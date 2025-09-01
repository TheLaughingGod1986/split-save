'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/toast'

interface DashboardWidgetsProps {
  goals: any[]
  expenses: any[]
  monthlyProgress: any
  partnerships: any[]
  profile: any
  achievements: any[]
}

interface WidgetData {
  id: string
  type: 'goal-progress' | 'safety-pot' | 'partner-activity' | 'expense-chart' | 'savings-forecast' | 'quick-stats'
  title: string
  description: string
  data: any
  priority: number
  size: 'small' | 'medium' | 'large'
  refreshInterval?: number
}

export function DashboardWidgets({
  goals,
  expenses,
  monthlyProgress,
  partnerships,
  profile,
  achievements
}: DashboardWidgetsProps) {
  const [widgets, setWidgets] = useState<WidgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null)
  const [widgetLayout, setWidgetLayout] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    generateWidgets()
  }, [goals, expenses, monthlyProgress, partnerships, profile, achievements])

  const generateWidgets = () => {
    const newWidgets: WidgetData[] = []

    // Goal Progress Widget
    if (goals.length > 0) {
      newWidgets.push({
        id: 'goal-progress',
        type: 'goal-progress',
        title: '🎯 Goal Progress',
        description: 'Track your savings goals',
        data: {
          goals: goals.filter(g => !g.completed),
          totalProgress: calculateTotalGoalProgress(goals),
          nextMilestone: findNextMilestone(goals)
        },
        priority: 1,
        size: 'large'
      })
    }

    // Safety Pot Widget
    if (monthlyProgress) {
      newWidgets.push({
        id: 'safety-pot',
        type: 'safety-pot',
        title: '🛡️ Safety Pot',
        description: 'Emergency fund status',
        data: {
          currentAmount: monthlyProgress.safetyPotAmount || 0,
          targetAmount: calculateSafetyPotTarget(expenses, profile),
          monthsCovered: calculateMonthsCovered(monthlyProgress.safetyPotAmount, expenses),
          status: getSafetyPotStatus(monthlyProgress.safetyPotAmount, expenses)
        },
        priority: 2,
        size: 'medium'
      })
    }

    // Partner Activity Widget
    if (partnerships.length > 0) {
      newWidgets.push({
        id: 'partner-activity',
        type: 'partner-activity',
        title: '👥 Partner Activity',
        description: 'Recent partner actions',
        data: {
          recentActivities: generatePartnerActivities(expenses, goals),
          partnerName: 'Your Partner', // In real app, get from partnership data
          lastContribution: getLastPartnerContribution(expenses)
        },
        priority: 3,
        size: 'medium'
      })
    }

    // Expense Chart Widget
    if (expenses.length > 0) {
      newWidgets.push({
        id: 'expense-chart',
        type: 'expense-chart',
        title: '📊 Expense Overview',
        description: 'Monthly expense breakdown',
        data: {
          monthlyExpenses: calculateMonthlyExpenses(expenses),
          categoryBreakdown: calculateCategoryBreakdown(expenses),
          trend: calculateExpenseTrend(expenses)
        },
        priority: 4,
        size: 'large'
      })
    }

    // Savings Forecast Widget
    if (goals.length > 0 && monthlyProgress) {
      newWidgets.push({
        id: 'savings-forecast',
        type: 'savings-forecast',
        title: '🔮 Savings Forecast',
        description: 'Predict your savings trajectory',
        data: {
          forecast: generateSavingsForecast(goals, monthlyProgress, profile),
          projectedCompletion: calculateProjectedCompletion(goals, monthlyProgress)
        },
        priority: 5,
        size: 'medium'
      })
    }

    // Quick Stats Widget
    newWidgets.push({
      id: 'quick-stats',
      type: 'quick-stats',
      title: '⚡ Quick Stats',
      description: 'Key financial metrics',
      data: {
        totalSaved: monthlyProgress?.totalContributed || 0,
        monthlyAverage: calculateMonthlyAverage(expenses),
        goalCount: goals.length,
        achievementCount: achievements.length,
        streakDays: calculateStreakDays(monthlyProgress)
      },
      priority: 6,
      size: 'small'
    })

    // Sort by priority
    newWidgets.sort((a, b) => a.priority - b.priority)
    setWidgets(newWidgets)
    setLoading(false)
  }

  const calculateTotalGoalProgress = (goals: any[]): number => {
    if (goals.length === 0) return 0
    const totalProgress = goals.reduce((sum, goal) => {
      return sum + (goal.current_amount / goal.target_amount) * 100
    }, 0)
    return Math.round(totalProgress / goals.length)
  }

  const findNextMilestone = (goals: any[]): any => {
    const activeGoals = goals.filter(g => !g.completed)
    if (activeGoals.length === 0) return null

    return activeGoals.reduce((closest, goal) => {
      const progress = (goal.current_amount / goal.target_amount) * 100
      const nextMilestone = Math.ceil(progress / 25) * 25
      const distance = nextMilestone - progress

      if (!closest || distance < closest.distance) {
        return { goal, milestone: nextMilestone, distance }
      }
      return closest
    }, null)
  }

  const calculateSafetyPotTarget = (expenses: any[], profile: any): number => {
    const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return monthlyExpenses * 3 // 3 months of expenses
  }

  const calculateMonthsCovered = (safetyPotAmount: number, expenses: any[]): number => {
    const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return monthlyExpenses > 0 ? Math.round(safetyPotAmount / monthlyExpenses) : 0
  }

  const getSafetyPotStatus = (safetyPotAmount: number, expenses: any[]): 'excellent' | 'good' | 'warning' | 'critical' => {
    const monthsCovered = calculateMonthsCovered(safetyPotAmount, expenses)
    if (monthsCovered >= 6) return 'excellent'
    if (monthsCovered >= 3) return 'good'
    if (monthsCovered >= 1) return 'warning'
    return 'critical'
  }

  const generatePartnerActivities = (expenses: any[], goals: any[]): any[] => {
    const activities = []
    
    // Recent expenses
    const recentExpenses = expenses
      .filter(e => e.added_by_user_id !== profile?.user_id)
      .slice(0, 3)
      .map(expense => ({
        type: 'expense_added',
        description: `Added expense: ${expense.description}`,
        amount: expense.amount,
        date: new Date(expense.created_at)
      }))

    // Recent goals
    const recentGoals = goals
      .filter(g => g.added_by_user_id !== profile?.user_id)
      .slice(0, 2)
      .map(goal => ({
        type: 'goal_created',
        description: `Created goal: ${goal.name}`,
        amount: goal.target_amount,
        date: new Date(goal.created_at)
      }))

    return [...recentExpenses, ...recentGoals]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)
  }

  const getLastPartnerContribution = (expenses: any[]): any => {
    return expenses
      .filter(e => e.added_by_user_id !== profile?.user_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  }

  const calculateMonthlyExpenses = (expenses: any[]): any[] => {
    const monthlyData: { [key: string]: number } = {}
    expenses.forEach(expense => {
      const month = new Date(expense.date).toISOString().slice(0, 7)
      monthlyData[month] = (monthlyData[month] || 0) + expense.amount
    })
    return Object.entries(monthlyData).map(([month, amount]) => ({ month, amount }))
  }

  const calculateCategoryBreakdown = (expenses: any[]): any[] => {
    const categories: { [key: string]: number } = {}
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized'
      categories[category] = (categories[category] || 0) + expense.amount
    })
    return Object.entries(categories).map(([category, amount]) => ({ category, amount }))
  }

  const calculateExpenseTrend = (expenses: any[]): 'increasing' | 'decreasing' | 'stable' => {
    const monthlyData = calculateMonthlyExpenses(expenses)
    if (monthlyData.length < 2) return 'stable'
    
    const recent = monthlyData.slice(-2)
    const change = recent[1].amount - recent[0].amount
    const percentageChange = (change / recent[0].amount) * 100
    
    if (percentageChange > 10) return 'increasing'
    if (percentageChange < -10) return 'decreasing'
    return 'stable'
  }

  const generateSavingsForecast = (goals: any[], monthlyProgress: any, profile: any): any => {
    const averageMonthlyContribution = monthlyProgress?.totalContributed / 12 || profile?.income * 0.1
    const totalGoalAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
    const monthsToComplete = totalGoalAmount / averageMonthlyContribution
    
    return {
      averageMonthlyContribution,
      totalGoalAmount,
      monthsToComplete: Math.ceil(monthsToComplete),
      projectedDate: new Date(Date.now() + monthsToComplete * 30 * 24 * 60 * 60 * 1000)
    }
  }

  const calculateProjectedCompletion = (goals: any[], monthlyProgress: any): any[] => {
    const averageMonthlyContribution = monthlyProgress?.totalContributed / 12 || 500
    return goals.map(goal => {
      const remaining = goal.target_amount - goal.current_amount
      const monthsToComplete = remaining / averageMonthlyContribution
      return {
        goalName: goal.name,
        monthsToComplete: Math.ceil(monthsToComplete),
        projectedDate: new Date(Date.now() + monthsToComplete * 30 * 24 * 60 * 60 * 1000)
      }
    })
  }

  const calculateMonthlyAverage = (expenses: any[]): number => {
    if (expenses.length === 0) return 0
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    return Math.round(total / expenses.length)
  }

  const calculateStreakDays = (monthlyProgress: any): number => {
    // This would be calculated from actual contribution data
    return monthlyProgress?.streakDays || 0
  }

  const renderWidget = (widget: WidgetData) => {
    switch (widget.type) {
      case 'goal-progress':
        return <GoalProgressWidget data={widget.data} />
      case 'safety-pot':
        return <SafetyPotWidget data={widget.data} />
      case 'partner-activity':
        return <PartnerActivityWidget data={widget.data} />
      case 'expense-chart':
        return <ExpenseChartWidget data={widget.data} />
      case 'savings-forecast':
        return <SavingsForecastWidget data={widget.data} />
      case 'quick-stats':
        return <QuickStatsWidget data={widget.data} />
      default:
        return <div>Unknown widget type</div>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Your financial overview at a glance</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setWidgetLayout('grid')}
            className={`p-2 rounded-lg transition-colors ${
              widgetLayout === 'grid' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setWidgetLayout('list')}
            className={`p-2 rounded-lg transition-colors ${
              widgetLayout === 'list' 
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className={`grid gap-6 ${
        widgetLayout === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1'
      }`}>
        <AnimatePresence>
          {widgets.map((widget) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${
                widget.size === 'large' ? 'lg:col-span-2' : ''
              }`}
            >
              {renderWidget(widget)}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// Individual Widget Components
function GoalProgressWidget({ data }: { data: any }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goal Progress</h3>
        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {data.totalProgress}%
        </span>
      </div>
      
      <div className="space-y-4">
        {data.goals.map((goal: any) => (
          <div key={goal.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {goal.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round((goal.current_amount / goal.target_amount) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(goal.current_amount / goal.target_amount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {data.nextMilestone && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🎯 Next milestone: {data.nextMilestone.milestone}% on {data.nextMilestone.goal.name}
          </p>
        </div>
      )}
    </div>
  )
}

function SafetyPotWidget({ data }: { data: any }) {
  const statusColors: { [key: string]: string } = {
    excellent: 'text-green-600 dark:text-green-400',
    good: 'text-blue-600 dark:text-blue-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    critical: 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Pot</h3>
        <span className={`text-lg font-bold ${statusColors[data.status]}`}>
          {data.monthsCovered} months
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Current Amount</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            £{data.currentAmount.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Target Amount</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            £{data.targetAmount.toFixed(2)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((data.currentAmount / data.targetAmount) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {data.status === 'excellent' && '🛡️ Your safety pot is well-funded!'}
          {data.status === 'good' && '✅ Your safety pot is in good shape.'}
          {data.status === 'warning' && '⚠️ Consider adding more to your safety pot.'}
          {data.status === 'critical' && '🚨 Your safety pot needs attention.'}
        </p>
      </div>
    </div>
  )
}

function PartnerActivityWidget({ data }: { data: any }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Activity</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data.recentActivities.length} recent
        </span>
      </div>
      
      <div className="space-y-3">
        {data.recentActivities.map((activity: any, index: number) => (
          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {activity.date.toLocaleDateString()}
              </p>
            </div>
            {activity.amount && (
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                £{activity.amount.toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>

      {data.lastContribution && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💰 Last contribution: £{data.lastContribution.amount.toFixed(2)} on {new Date(data.lastContribution.created_at).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  )
}

function ExpenseChartWidget({ data }: { data: any }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Overview</h3>
        <span className={`text-sm font-medium ${
          data.trend === 'increasing' ? 'text-red-600 dark:text-red-400' :
          data.trend === 'decreasing' ? 'text-green-600 dark:text-green-400' :
          'text-gray-600 dark:text-gray-400'
        }`}>
          {data.trend === 'increasing' ? '↗️ Increasing' :
           data.trend === 'decreasing' ? '↘️ Decreasing' :
           '→ Stable'}
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {data.categoryBreakdown.slice(0, 4).map((category: any, index: number) => (
            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {category.category}
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                £{category.amount.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SavingsForecastWidget({ data }: { data: any }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Forecast</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data.forecast.monthsToComplete} months
        </span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Average</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            £{data.forecast.averageMonthlyContribution.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Total Goal Amount</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            £{data.forecast.totalGoalAmount.toFixed(2)}
          </span>
        </div>
        
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            🎯 Projected completion: {data.forecast.projectedDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}

function QuickStatsWidget({ data }: { data: any }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Stats</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">This month</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            £{data.totalSaved.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Saved</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            £{data.monthlyAverage.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Avg</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {data.goalCount}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Active Goals</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {data.streakDays}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Streak Days</p>
        </div>
      </div>
    </div>
  )
}
