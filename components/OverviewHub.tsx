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
  monthlyProgress?: any
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
  monthlyProgress,
  onNavigate,
  onNavigateToProfile,
  onNavigateToPartnerships
}: OverviewHubProps) {
  const [loading, setLoading] = useState(false)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [localMonthlyProgress, setLocalMonthlyProgress] = useState<any>(null)

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
      currentStreak: monthlyProgress?.trends?.consistencyScore ? Math.floor(monthlyProgress.trends.consistencyScore / 10) : 0,
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
      setLocalMonthlyProgress(response)
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

      {/* Partner Financial Overview */}
      {partnerships.length > 0 && partnerProfile && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Partner Financial Overview</h2>
              <p className="text-gray-600 text-sm">Side-by-side income breakdown & contribution targets</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Your Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                  {(profile?.name || 'You').charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900">{profile?.name || 'You'} Breakdown</h3>
              </div>

              {/* Total Income */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Total Income</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Monthly</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {currencySymbol}{(profile?.income || 0).toLocaleString()}
                </div>
              </div>

              {/* Personal Allowance */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Personal Allowance</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Your Money</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {currencySymbol}{(profile?.personal_allowance || 0).toLocaleString()}
                </div>
              </div>

              {/* Disposable Income */}
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">Disposable Income</span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">For Goals</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {currencySymbol}{((profile?.income || 0) - (profile?.personal_allowance || 0)).toLocaleString()}
                </div>
              </div>

              {/* Your Monthly Contributions */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">{profile?.name || 'Your'} Monthly Contributions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm">Expenses</span>
                    </div>
                    <div className="text-sm font-medium">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7).toLocaleString()} (70%)
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Savings</span>
                    </div>
                    <div className="text-sm font-medium">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2).toLocaleString()} (20%)
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm">Safety</span>
                    </div>
                    <div className="text-sm font-medium">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1).toLocaleString()} (10%)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Partner's Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                  {(partnerProfile?.name || 'Partner').charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900">{partnerProfile?.name || 'Partner'}'s Breakdown</h3>
              </div>

              {/* Total Income */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">Total Income</span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Monthly</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {partnerProfile?.income ? `${currencySymbol}${partnerProfile.income.toLocaleString()}` : '--'}
                </div>
              </div>

              {/* Personal Allowance */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Personal Allowance</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Partner's Money</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {partnerProfile?.personal_allowance ? `${currencySymbol}${partnerProfile.personal_allowance.toLocaleString()}` : '--'}
                </div>
              </div>

              {/* Disposable Income */}
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700">Disposable Income</span>
                  <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">For Goals</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {partnerProfile?.income && partnerProfile?.personal_allowance 
                    ? `${currencySymbol}${(partnerProfile.income - partnerProfile.personal_allowance).toLocaleString()}`
                    : '--'
                  }
                </div>
              </div>

              {/* Partner's Monthly Contributions */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">{partnerProfile?.name || 'Partner'}'s Monthly Contributions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm">Expenses</span>
                    </div>
                    <div className="text-sm font-medium">
                      {partnerProfile?.income && partnerProfile?.personal_allowance
                        ? `${currencySymbol}${Math.round((partnerProfile.income - partnerProfile.personal_allowance) * 0.7).toLocaleString()} (70%)`
                        : '--'
                      }
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Savings</span>
                    </div>
                    <div className="text-sm font-medium">
                      {partnerProfile?.income && partnerProfile?.personal_allowance
                        ? `${currencySymbol}${Math.round((partnerProfile.income - partnerProfile.personal_allowance) * 0.2).toLocaleString()} (20%)`
                        : '--'
                      }
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm">Safety</span>
                    </div>
                    <div className="text-sm font-medium">
                      {partnerProfile?.income && partnerProfile?.personal_allowance
                        ? `${currencySymbol}${Math.round((partnerProfile.income - partnerProfile.personal_allowance) * 0.1).toLocaleString()} (10%)`
                        : '--'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Individual Goal Contributions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Individual Goal Contributions
              </h4>
              
              {/* Shared Expenses */}
              <div className="mb-4 p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-gray-900">Shared Expenses</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Household costs, bills, groceries
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      {currencySymbol}{(
                        Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7) +
                        Math.round(((partnerProfile?.income || 0) - (partnerProfile?.personal_allowance || 0)) * 0.7)
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 mb-1">{profile?.name || 'You'}</div>
                    <div className="font-semibold text-blue-700">{currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7).toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 mb-1">{partnerProfile?.name || 'Partner'}</div>
                    <div className="font-semibold text-blue-700">
                      {partnerProfile?.income && partnerProfile?.personal_allowance
                        ? `${currencySymbol}${Math.round((partnerProfile.income - partnerProfile.personal_allowance) * 0.7).toLocaleString()}`
                        : '--'
                      }
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Goals */}
              {goals && goals.length > 0 ? (
                <div className="space-y-3">
                  {goals.slice(0, 4).map((goal, index) => {
                    // Calculate contribution percentages based on goal priority/target
                    const goalPercentages = [0.12, 0.08, 0.05, 0.03]; // Decreasing percentages for goals
                    const percentage = goalPercentages[index] || 0.02;
                    
                    const yourContribution = Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * percentage);
                    const partnerContribution = partnerProfile?.income && partnerProfile?.personal_allowance 
                      ? Math.round((partnerProfile.income - partnerProfile.personal_allowance) * percentage)
                      : 0;
                    
                    const progressPercent = Math.round((goal.current_amount || 0) / (goal.target_amount || 1) * 100);
                    
                    return (
                      <div key={goal.id} className="p-4 bg-white rounded-lg border border-green-100 hover:border-green-200 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="font-semibold text-gray-900">{goal.title || 'Untitled Goal'}</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {currencySymbol}{(goal.current_amount || 0).toLocaleString()} / {currencySymbol}{(goal.target_amount || 0).toLocaleString()}
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {progressPercent}% complete
                              </span>
                            </div>
                            {goal.target_date && (
                              <div className="text-xs text-gray-500">
                                Target: {new Date(goal.target_date).toLocaleDateString('en-GB', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {currencySymbol}{(yourContribution + partnerContribution).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">per month</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                          <div className="bg-blue-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 mb-1">{profile?.name || 'You'}</div>
                            <div className="font-semibold text-blue-700">{currencySymbol}{yourContribution.toLocaleString()}</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <div className="text-xs text-gray-600 mb-1">{partnerProfile?.name || 'Partner'}</div>
                            <div className="font-semibold text-green-700">
                              {partnerProfile?.income && partnerProfile?.personal_allowance
                                ? `${currencySymbol}${partnerContribution.toLocaleString()}`
                                : '--'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <span className="text-2xl mb-2 block">🎯</span>
                  <p className="text-sm">No goals set yet</p>
                  <button 
                    onClick={() => onNavigate('goals')}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                  >
                    Create your first goal
                  </button>
                </div>
              )}

              {/* Safety Pot */}
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-100 hover:border-purple-200 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-gray-900">Safety Pot</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Emergency fund • 10% of disposable income
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">
                      {currencySymbol}{(
                        Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1) +
                        Math.round(((partnerProfile?.income || 0) - (partnerProfile?.personal_allowance || 0)) * 0.1)
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">per month</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 mb-1">{profile?.name || 'You'}</div>
                    <div className="font-semibold text-purple-700">{currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1).toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600 mb-1">{partnerProfile?.name || 'Partner'}</div>
                    <div className="font-semibold text-purple-700">
                      {partnerProfile?.income && partnerProfile?.personal_allowance
                        ? `${currencySymbol}${Math.round((partnerProfile.income - partnerProfile.personal_allowance) * 0.1).toLocaleString()}`
                        : '--'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
