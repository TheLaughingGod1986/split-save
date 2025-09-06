import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user from authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get widget type from query params
    const { searchParams } = new URL(request.url)
    const widgetType = searchParams.get('type')
    const refreshToken = searchParams.get('refresh')

    // Get user data
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get partnerships
    const { data: partnerships } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')

    // Get goals
    const { data: goals } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('added_by_user_id', user.id)

    // Get expenses
    const { data: expenses } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('added_by_user_id', user.id)

    // Get achievements
    const { data: achievements } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)

    // Calculate widget data based on type
    let widgetData: any = {}

    switch (widgetType) {
      case 'goal-progress':
        widgetData = calculateGoalProgressWidget(goals || [])
        break
      
      case 'safety-pot':
        widgetData = calculateSafetyPotWidget(expenses || [], profile)
        break
      
      case 'partner-activity':
        widgetData = calculatePartnerActivityWidget(expenses || [], goals || [], partnerships || [], user.id)
        break
      
      case 'quick-stats':
        widgetData = calculateQuickStatsWidget(goals || [], expenses || [], achievements || [])
        break
      
      case 'expense-overview':
        widgetData = calculateExpenseOverviewWidget(expenses || [])
        break
      
      case 'savings-forecast':
        widgetData = calculateSavingsForecastWidget(goals || [], profile)
        break
      
      default:
        // Return all widget data
        widgetData = {
          'goal-progress': calculateGoalProgressWidget(goals || []),
          'safety-pot': calculateSafetyPotWidget(expenses || [], profile),
          'partner-activity': calculatePartnerActivityWidget(expenses || [], goals || [], partnerships || [], user.id),
          'quick-stats': calculateQuickStatsWidget(goals || [], expenses || [], achievements || []),
          'expense-overview': calculateExpenseOverviewWidget(expenses || []),
          'savings-forecast': calculateSavingsForecastWidget(goals || [], profile)
        }
    }

    return NextResponse.json({
      success: true,
      data: widgetData,
      timestamp: new Date().toISOString(),
      refreshToken: refreshToken
    })

  } catch (error) {
    console.error('Widget API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function calculateGoalProgressWidget(goals: any[]) {
  const activeGoals = goals.filter(g => !g.completed)
  const totalProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, goal) => sum + (goal.current_amount / goal.target_amount) * 100, 0) / activeGoals.length
    : 0

  const nextMilestone = activeGoals.length > 0 ? activeGoals.reduce((closest, goal) => {
    const progress = (goal.current_amount / goal.target_amount) * 100
    const nextMilestone = Math.ceil(progress / 25) * 25
    const distance = nextMilestone - progress

    if (!closest || distance < closest.distance) {
      return { goal, milestone: nextMilestone, distance }
    }
    return closest
  }, null) : null

  return {
    goals: activeGoals,
    totalProgress: Math.round(totalProgress),
    nextMilestone
  }
}

function calculateSafetyPotWidget(expenses: any[], profile: any) {
  const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const targetAmount = monthlyExpenses * 3 // 3 months of expenses
  const currentAmount = profile?.safety_pot_amount || 0
  const monthsCovered = monthlyExpenses > 0 ? Math.round(currentAmount / monthlyExpenses) : 0

  let status: 'excellent' | 'good' | 'warning' | 'critical'
  if (monthsCovered >= 6) status = 'excellent'
  else if (monthsCovered >= 3) status = 'good'
  else if (monthsCovered >= 1) status = 'warning'
  else status = 'critical'

  return {
    currentAmount,
    targetAmount,
    monthsCovered,
    status
  }
}

function calculatePartnerActivityWidget(expenses: any[], goals: any[], partnerships: any[], userId: string) {
  const partnerId = partnerships.length > 0 
    ? (partnerships[0].user1_id === userId ? partnerships[0].user2_id : partnerships[0].user1_id)
    : null

  const recentActivities = []
  
  // Recent expenses from partner
  const partnerExpenses = expenses
    .filter(e => e.added_by_user_id === partnerId)
    .slice(0, 3)
    .map(expense => ({
      type: 'expense_added',
      description: `Added expense: ${expense.description}`,
      amount: expense.amount,
      date: expense.created_at
    }))

  // Recent goals from partner
  const partnerGoals = goals
    .filter(g => g.added_by_user_id === partnerId)
    .slice(0, 2)
    .map(goal => ({
      type: 'goal_created',
      description: `Created goal: ${goal.name}`,
      amount: goal.target_amount,
      date: goal.created_at
    }))

  const lastContribution = expenses
    .filter(e => e.added_by_user_id === partnerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

  return {
    recentActivities: [...partnerExpenses, ...partnerGoals]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    partnerName: 'Your Partner', // In real app, get from partnership data
    lastContribution
  }
}

function calculateQuickStatsWidget(goals: any[], expenses: any[], achievements: any[]) {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0)
  const monthlyAverage = expenses.length > 0 
    ? expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length
    : 0
  const goalCount = goals.filter(g => !g.completed).length
  const streakDays = achievements.length > 0 ? achievements[0].streak_days || 0 : 0

  return {
    totalSaved,
    monthlyAverage: Math.round(monthlyAverage),
    goalCount,
    achievementCount: achievements.length,
    streakDays
  }
}

function calculateExpenseOverviewWidget(expenses: any[]) {
  const monthlyData: { [key: string]: number } = {}
  expenses.forEach(expense => {
    const month = new Date(expense.date).toISOString().slice(0, 7)
    monthlyData[month] = (monthlyData[month] || 0) + expense.amount
  })

  const monthlyExpenses = Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))
  
  const categories: { [key: string]: number } = {}
  expenses.forEach(expense => {
    const category = expense.category || 'Uncategorized'
    categories[category] = (categories[category] || 0) + expense.amount
  })
  const categoryBreakdown = Object.entries(categories).map(([category, amount]) => ({ category, amount }))

  // Calculate trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable'
  if (monthlyExpenses.length >= 2) {
    const recent = monthlyExpenses.slice(-2)
    const change = recent[1].amount - recent[0].amount
    const percentageChange = (change / recent[0].amount) * 100
    
    if (percentageChange > 10) trend = 'increasing'
    else if (percentageChange < -10) trend = 'decreasing'
  }

  return {
    monthlyExpenses,
    categoryBreakdown,
    trend
  }
}

function calculateSavingsForecastWidget(goals: any[], profile: any) {
  const averageMonthlyContribution = profile?.income * 0.1 || 500
  const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
  const monthsToComplete = totalGoalAmount / averageMonthlyContribution

  const projectedCompletion = goals.map(goal => {
    const remaining = goal.target_amount - goal.current_amount
    const monthsToComplete = remaining / averageMonthlyContribution
    return {
      goalName: goal.name,
      monthsToComplete: Math.ceil(monthsToComplete),
      projectedDate: new Date(Date.now() + monthsToComplete * 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  })

  return {
    forecast: {
      averageMonthlyContribution,
      totalGoalAmount,
      monthsToComplete: Math.ceil(monthsToComplete),
      projectedDate: new Date(Date.now() + monthsToComplete * 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    projectedCompletion
  }
}
