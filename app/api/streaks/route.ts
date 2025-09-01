import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's contributions and goals data
    const [contributionsResult, goalsResult, progressResult] = await Promise.all([
      supabaseAdmin
        .from('contributions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      
      supabaseAdmin
        .from('goals')
        .select('*')
        .eq('partnership_id', user.partnershipId || ''),
      
      supabaseAdmin
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single()
    ])

    const contributions = contributionsResult.data || []
    const goals = goalsResult.data || []
    const progress = progressResult.data

    // Calculate streak data
    const streakData = calculateStreakData(contributions, goals, progress)

    return NextResponse.json(streakData)
  } catch (error) {
    console.error('Error fetching streak data:', error)
    return NextResponse.json({ error: 'Failed to fetch streak data' }, { status: 500 })
  }
}

function calculateStreakData(contributions: any[], goals: any[], progress: any) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Calculate monthly contribution streak
  let monthlyStreak = 0
  let longestMonthlyStreak = 0
  let lastMonthlyContribution: string | undefined

  // Group contributions by month
  const monthlyContributions = new Map<string, any[]>()
  
  contributions.forEach(contribution => {
    const date = new Date(contribution.created_at)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyContributions.has(monthKey)) {
      monthlyContributions.set(monthKey, [])
    }
    monthlyContributions.get(monthKey)!.push(contribution)
  })

  // Calculate current monthly streak
  let currentStreak = 0
  let tempStreak = 0
  
  // Sort months in descending order
  const sortedMonths = Array.from(monthlyContributions.keys()).sort().reverse()
  
  for (let i = 0; i < sortedMonths.length; i++) {
    const month = sortedMonths[i]
    const monthContributions = monthlyContributions.get(month)!
    
    if (monthContributions.length > 0) {
      tempStreak++
      currentStreak = Math.max(currentStreak, tempStreak)
      
      // Track last monthly contribution
      if (i === 0) {
        const lastContribution = monthContributions[0]
        lastMonthlyContribution = lastContribution.created_at
      }
    } else {
      tempStreak = 0
    }
  }

  monthlyStreak = currentStreak
  longestMonthlyStreak = progress?.longest_streak || currentStreak

  // Calculate goal contribution streak
  let goalStreak = 0
  let lastGoalContribution: string | undefined

  // Count consecutive goal contributions
  let tempGoalStreak = 0
  for (let i = 0; i < contributions.length; i++) {
    const contribution = contributions[i]
    
    // Check if this contribution was for a goal
    const isGoalContribution = goals.some(goal => 
      goal.id === contribution.goal_id || 
      contribution.description?.toLowerCase().includes('goal') ||
      contribution.category === 'goal'
    )
    
    if (isGoalContribution) {
      tempGoalStreak++
      goalStreak = Math.max(goalStreak, tempGoalStreak)
      
      if (!lastGoalContribution) {
        lastGoalContribution = contribution.created_at
      }
    } else {
      tempGoalStreak = 0
    }
  }

  // Calculate overall streak (combined monthly and goal streaks)
  const overallStreak = Math.max(monthlyStreak, goalStreak)

  return {
    currentStreak: overallStreak,
    longestStreak: longestMonthlyStreak,
    totalContributions: contributions.length,
    lastContributionDate: contributions.length > 0 ? contributions[0].created_at : undefined,
    streakType: 'mixed',
    monthlyStreak,
    goalStreak,
    lastMonthlyContribution,
    lastGoalContribution,
    // Additional streak metrics
    averageContributionAmount: contributions.length > 0 
      ? contributions.reduce((sum, c) => sum + (c.amount || 0), 0) / contributions.length 
      : 0,
    totalContributedAmount: contributions.reduce((sum, c) => sum + (c.amount || 0), 0),
    streakStartDate: sortedMonths.length > 0 ? `${sortedMonths[sortedMonths.length - 1]}-01` : undefined,
    monthsActive: monthlyContributions.size,
    // Streak health indicators
    isStreakActive: monthlyStreak > 0,
    isStreakAtRisk: lastMonthlyContribution 
      ? (now.getTime() - new Date(lastMonthlyContribution).getTime()) > (30 * 24 * 60 * 60 * 1000)
      : false,
    daysSinceLastContribution: lastMonthlyContribution 
      ? Math.floor((now.getTime() - new Date(lastMonthlyContribution).getTime()) / (24 * 60 * 60 * 1000))
      : null
  }
}
