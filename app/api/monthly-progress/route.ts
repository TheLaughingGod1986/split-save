import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { 
  calculateMonthlyProgress,
  calculateMonthlyTrends,
  calculatePartnerAccountability,
  generateProgressInsights
} from '@/lib/monthly-progress-utils'

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ 
      progress: {
        currentMonth: {
          totalIncome: 0,
          totalExpenses: 0,
          totalSavings: 0,
          savingsRate: 0,
          goalProgress: 0
        },
        trends: {
          monthlyGrowth: 0,
          consistencyScore: 0,
          partnerReliability: 0
        },
        insights: []
      }
    }, { status: 200 })
  }

  try {
    // Get user's active partnership
    const { data: partnerships } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .limit(1)

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ error: 'No active partnership found' }, { status: 400 })
    }

    const partnership = partnerships[0]
    const partnerId = partnership.user1_id === user.id ? partnership.user2_id : partnership.user1_id

    // Get partner profile
    const { data: partnerProfile } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', partnerId)
      .single()

    if (!partnerProfile) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 400 })
    }

    // Get user profile
    const { data: userProfile } = await supabaseAdmin
      .from('users')
      .select('id, name, email, income, currency')
      .eq('id', user.id)
      .single()

    // Get all contributions for the partnership
    const { data: contributions } = await supabaseAdmin
      .from('goal_contributions')
      .select('*')
      .eq('partnership_id', partnership.id)

    // Get all goals for the partnership
    const { data: goals } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('partnership_id', partnership.id)

    // Get all expenses for the partnership
    const { data: expenses } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('partnership_id', partnership.id)

    // Get safety pot amount
    const { data: safetyPot } = await supabaseAdmin
      .from('safety_pot')
      .select('current_amount')
      .eq('partnership_id', partnership.id)
      .single()

    // Get monthly contributions data
    const { data: monthlyContributions } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('partnership_id', partnership.id)
      .order('month', { ascending: false })

    // Calculate progress for the last 12 months
    const last12Months = []
    const currentDate = new Date()
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(currentDate)
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthString = monthDate.toISOString().substring(0, 7) // YYYY-MM
      
      const monthProgress = calculateMonthlyProgress(
        monthString,
        contributions || [],
        goals || [],
        expenses || [],
        safetyPot?.current_amount || 0,
        userProfile,
        partnerProfile
      )
      
      last12Months.push(monthProgress)
    }

    // Calculate trends
    const trends = calculateMonthlyTrends(last12Months)

    // Calculate partner accountability
    const partnerAccountability = calculatePartnerAccountability(
      partnerId,
      partnerProfile.name,
      last12Months,
      contributions || []
    )

    // Generate insights
    const insights = generateProgressInsights(
      last12Months,
      trends,
      partnerAccountability
    )

    // Get current month progress
    const currentMonth = currentDate.toISOString().substring(0, 7)
    const currentMonthProgress = last12Months.find(p => p.month === currentMonth) || last12Months[0]

    return NextResponse.json({
      currentMonth: currentMonthProgress,
      monthlyProgress: last12Months,
      trends,
      partnerAccountability,
      insights,
      summary: {
        totalMonthsTracked: trends.totalMonthsTracked,
        averageMonthlyContribution: trends.averageMonthlyContribution,
        consistencyScore: trends.consistencyScore,
        financialHealth: insights.financialHealth
      }
    })

  } catch (error) {
    console.error('Error fetching monthly progress:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly progress' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { month, notes, goalsProgress } = body

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    // Get user's active partnership
    const { data: partnerships } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .limit(1)

    if (!partnerships || partnerships.length === 0) {
      return NextResponse.json({ error: 'No active partnership found' }, { status: 400 })
    }

    const partnership = partnerships[0]

    // Check if monthly progress record exists
    const { data: existingProgress } = await supabaseAdmin
      .from('monthly_progress')
      .select('*')
      .eq('partnership_id', partnership.id)
      .eq('month', month)
      .single()

    if (existingProgress) {
      // Update existing record
      const { data: updatedProgress, error: updateError } = await supabaseAdmin
        .from('monthly_progress')
        .update({
          notes: notes || existingProgress.notes,
          goals_progress: goalsProgress || existingProgress.goals_progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProgress.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({ success: true, progress: updatedProgress })
    } else {
      // Create new record
      const { data: newProgress, error: insertError } = await supabaseAdmin
        .from('monthly_progress')
        .insert({
          partnership_id: partnership.id,
          month,
          notes: notes || null,
          goals_progress: goalsProgress || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({ success: true, progress: newProgress })
    }

  } catch (error) {
    console.error('Error updating monthly progress:', error)
    return NextResponse.json({ error: 'Failed to update monthly progress' }, { status: 500 })
  }
}
