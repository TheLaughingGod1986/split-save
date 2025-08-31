'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface OverviewHubProps {
  expenses: any[]
  goals: any[]
  partnerships: any[]
  profile: any
  partnerProfile: any
  user: any
  currencySymbol: string
  currencyEmoji: string
  onNavigate: (view: string) => void
  onNavigateToProfile: () => void
  onNavigateToPartnerships: () => void
}

interface DashboardStats {
  totalExpenses: number
  totalSaved: number
  totalTarget: number
  completedGoals: number
  currentStreak: number
  safetyPotAmount: number
  monthsOfExpensesCovered: number
}

interface QuickAction {
  id: string
  title: string
  icon: string
  color: string
  action: () => void
  description: string
}

export function OverviewHub({
  expenses,
  goals,
  partnerships,
  profile,
  partnerProfile,
  user,
  currencySymbol,
  currencyEmoji,
  onNavigate,
  onNavigateToProfile,
  onNavigateToPartnerships
}: OverviewHubProps) {
  const [loading, setLoading] = useState(false)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [monthlyProgress, setMonthlyProgress] = useState<any>(null)

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const totalExpenses = expenses?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0
    const totalSaved = goals?.reduce((sum, goal) => sum + (goal.current_amount || 0), 0) || 0
    const totalTarget = goals?.reduce((sum, goal) => sum + (goal.target_amount || 0), 0) || 0
    const completedGoals = goals?.filter(goal => 
      goal.current_amount >= goal.target_amount
    ).length || 0
    
    // Calculate safety pot (10% of monthly income)
    const monthlyIncome = (profile?.income || 0) + (partnerProfile?.income || 0)
    const recommendedSafetyPot = monthlyIncome * 0.1 * 6 // 6 months coverage
    const safetyPotAmount = totalSaved * 0.1 // Assume 10% of savings goes to safety pot
    const monthsOfExpensesCovered = totalExpenses > 0 ? safetyPotAmount / totalExpenses : 0

    return {
      totalExpenses,
      totalSaved,
      totalTarget,
      completedGoals,
      currentStreak: 3, // TODO: Get from real streak tracking
      safetyPotAmount,
      monthsOfExpensesCovered
    }
  }, [expenses, goals, profile, partnerProfile])

  // Quick actions for main tasks
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'add-expense',
      title: 'Add Expense',
      icon: '💰',
      color: 'blue',
      description: 'Record a new shared expense',
      action: () => onNavigate('money')
    },
    {
      id: 'record-contribution',
      title: 'Record Progress',
      icon: '📊',
      color: 'green',
      description: 'Update your monthly contributions',
      action: () => onNavigate('money')
    },
    {
      id: 'create-goal',
      title: 'New Goal',
      icon: '🎯',
      color: 'purple',
      description: 'Set a new savings target',
      action: () => onNavigate('goals')
    },
    {
      id: 'partner-activity',
      title: 'Partner Hub',
      icon: '🤝',
      color: 'orange',
      description: 'View partner activity & approvals',
      action: () => onNavigate('partner')
    }
  ], [onNavigate])

  // Load recent activity
  useEffect(() => {
    loadRecentActivity()
    loadMonthlyProgress()
  }, [])

  const loadRecentActivity = async () => {
    try {
      // In a real app, this would fetch from activity API
      // For now, generate activity from existing data
      const activities: any[] = []
      
      // Add recent expenses
      if (expenses && expenses.length > 0) {
        expenses.slice(0, 3).forEach(expense => {
          activities.push({
            id: `expense-${expense.id}`,
            type: 'expense',
            title: `Expense: ${expense.description}`,
            amount: expense.amount,
            timestamp: new Date(expense.created_at || Date.now()),
            icon: '💰',
            user: 'You'
          })
        })
      }

      // Add recent goal progress
      if (goals && goals.length > 0) {
        goals.slice(0, 2).forEach(goal => {
          if (goal.current_amount > 0) {
            activities.push({
              id: `goal-${goal.id}`,
              type: 'goal',
              title: `Progress: ${goal.name}`,
              amount: goal.current_amount,
              timestamp: new Date(goal.updated_at || Date.now()),
              icon: '🎯',
              user: 'You'
            })
          }
        })
      }

      // Sort by timestamp and limit to 5 most recent
      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setRecentActivity(activities.slice(0, 5))
    } catch (error) {
      console.error('Failed to load recent activity:', error)
    }
  }

  const loadMonthlyProgress = async () => {
    try {
      const response = await apiClient.get('/monthly-progress')
      setMonthlyProgress(response)
    } catch (error) {
      console.error('Failed to load monthly progress:', error)
    }
  }

  const getProgressPercentage = () => {
    if (stats.totalTarget === 0) return 0
    return Math.min(100, (stats.totalSaved / stats.totalTarget) * 100)
  }

  const getSafetyPotStatus = () => {
    if (stats.monthsOfExpensesCovered >= 6) return { status: 'excellent', color: 'green' }
    if (stats.monthsOfExpensesCovered >= 3) return { status: 'good', color: 'blue' }
    if (stats.monthsOfExpensesCovered >= 1) return { status: 'fair', color: 'yellow' }
    return { status: 'low', color: 'red' }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return timestamp.toLocaleDateString()
  }

  const safetyPotStatus = getSafetyPotStatus()

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {profile?.name || 'there'}! {currencyEmoji}
        </h1>
        <p className="text-blue-100">
          {partnerships.length > 0 
            ? `You and ${partnerProfile?.name || 'your partner'} are doing great!`
            : 'Ready to start your financial journey?'
          }
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saved */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Saved</p>
              <p className="text-xl font-bold text-green-600">
                {currencySymbol}{stats.totalSaved.toFixed(0)}
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getProgressPercentage().toFixed(0)}% of target
            </p>
          </div>
        </div>

        {/* Safety Pot */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Safety Pot</p>
              <p className={`text-xl font-bold text-${safetyPotStatus.color}-600`}>
                {currencySymbol}{stats.safetyPotAmount.toFixed(0)}
              </p>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.monthsOfExpensesCovered.toFixed(1)} months covered
          </p>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Streak</p>
              <p className="text-xl font-bold text-orange-600">
                {stats.currentStreak} months
              </p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Keep it up!
          </p>
        </div>

        {/* Completed Goals */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-xl font-bold text-purple-600">
                {stats.completedGoals} goals
              </p>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {goals?.length || 0} total goals
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`p-4 rounded-lg border-2 border-dashed transition-all hover:scale-105 active:scale-95 ${
                action.color === 'blue' ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50' :
                action.color === 'green' ? 'border-green-300 hover:border-green-400 hover:bg-green-50' :
                action.color === 'purple' ? 'border-purple-300 hover:border-purple-400 hover:bg-purple-50' :
                'border-orange-300 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium mb-1">{action.title}</div>
              <div className="text-xs text-gray-500">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <span className="mr-2">📱</span>
            Recent Activity
          </h2>
          <button 
            onClick={() => onNavigate('partner')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All
          </button>
        </div>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{activity.icon}</div>
                  <div>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {activity.user} • {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-sm font-medium text-gray-900">
                    {currencySymbol}{activity.amount.toFixed(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Start by adding an expense or recording progress!</p>
          </div>
        )}
      </div>

      {/* Partnership Status */}
      {partnerships.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                👥 Connect with Your Partner
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Invite your partner to start sharing expenses and saving together.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToPartnerships}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send Invitation
          </button>
        </div>
      )}
    </div>
  )
}
