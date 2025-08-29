import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  const goalId = params.id
  try {
    const body = await req.json()
    const { amount, message, month, year } = body
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid contribution amount' }, { status: 400 })
    }
    
    if (!month || !year) {
      return NextResponse.json({ error: 'Month and year are required' }, { status: 400 })
    }

    // Get the goal and partnership details
    const { data: goal, error: goalError } = await supabaseAdmin
      .from('goals')
      .select('id, current_amount, target_amount, name, partnership_id, priority')
      .eq('id', goalId)
      .eq('partnership_id', user.partnershipId)
      .single()
    
    if (goalError || !goal) {
      return NextResponse.json({ error: 'Goal not found or access denied' }, { status: 404 })
    }

    // Get partnership and user income details
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select(`
        id,
        user1_id,
        user2_id,
        user1_profile:profiles!partnerships_user1_id_fkey(income, currency),
        user2_profile:profiles!partnerships_user2_id_fkey(income, currency)
      `)
      .eq('id', user.partnershipId)
      .eq('status', 'active')
      .single()

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 })
    }

    // For now, use a simple equal split since we don't have income data in this endpoint
    // The Monthly Contribution Summary component handles the detailed income-based calculations
    const monthlyGoalContribution = Math.ceil((goal.target_amount - goal.current_amount) / 12)
    const user1Expected = monthlyGoalContribution / 2
    const user2Expected = monthlyGoalContribution / 2

    // Check if this month already has contributions
    const { data: existingContributions, error: existingError } = await supabaseAdmin
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .eq('month', month)
      .eq('year', year)

    if (existingError) {
      console.error('Failed to check existing contributions:', existingError)
      return NextResponse.json({ error: 'Failed to check existing contributions' }, { status: 500 })
    }

    // Calculate total contributions for this month
    const totalThisMonth = existingContributions?.reduce((sum, c) => sum + c.amount, 0) || 0
    const newTotalThisMonth = totalThisMonth + amount

    // Determine which user this is and their expected amount
    const isUser1 = user.id === partnership.user1_id
    const expectedAmount = isUser1 ? user1Expected : user2Expected
    const otherUserExpected = isUser1 ? user2Expected : user1Expected

    // Calculate overpayment/underpayment
    const userContribution = existingContributions?.find(c => c.user_id === user.id)?.amount || 0
    const newUserContribution = userContribution + amount
    const userOverUnder = newUserContribution - expectedAmount

    // Create the contribution record
    const { error: contributionError } = await supabaseAdmin
      .from('goal_contributions')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        amount: amount,
        message: message || null,
        month: month,
        year: year,
        expected_amount: expectedAmount,
        over_under_amount: userOverUnder,
        created_at: new Date().toISOString()
      })

    if (contributionError) {
      console.error('Failed to create contribution record:', contributionError)
      return NextResponse.json({ error: 'Failed to create contribution record' }, { status: 500 })
    }

    // Update goal current amount
    const newCurrentAmount = Math.min(goal.current_amount + amount, goal.target_amount)
    const isCompleted = newCurrentAmount >= goal.target_amount

    const { error: updateError } = await supabaseAdmin
      .from('goals')
      .update({ 
        current_amount: newCurrentAmount, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', goalId)

    if (updateError) {
      console.error('Failed to update goal:', updateError)
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
    }

    // Get updated goal with all details
    const { data: updatedGoal, error: fetchError } = await supabaseAdmin
      .from('goals')
      .select(`
        *,
        added_by_user:users!goals_added_by_user_id_fkey(id, name),
        contributions:goal_contributions(
          id,
          amount,
          message,
          month,
          year,
          expected_amount,
          over_under_amount,
          created_at,
          user:users!goal_contributions_user_id_fkey(id, name)
        )
      `)
      .eq('id', goalId)
      .single()

    if (fetchError) {
      console.error('Failed to fetch updated goal:', fetchError)
      return NextResponse.json({ error: 'Goal updated but failed to fetch updated data' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      goal: updatedGoal,
      contribution: {
        amount,
        newCurrentAmount,
        isCompleted,
        message,
        month,
        year,
        expectedAmount,
        overUnderAmount: userOverUnder,
        monthlyGoalContribution,
        user1Expected,
        user2Expected
      }
    })

  } catch (error) {
    console.error('Contribute to goal error:', error)
    return NextResponse.json({ error: 'Failed to contribute to goal' }, { status: 500 })
  }
}
