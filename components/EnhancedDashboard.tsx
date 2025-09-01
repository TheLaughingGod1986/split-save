'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { SmartNotificationManager } from './SmartNotificationManager'
import { ProgressCelebration, useCelebration } from './ProgressCelebration'
import { formatCurrency } from '@/lib/monthly-progress-utils'

interface DashboardData {
  summary: {
    totalContributions: number
    totalGoals: number
    completedGoals: number
    currentStreak: number
    totalPoints: number
    currentLevel: number
    nextLevelProgress: number
  }
  recentActivity: any[]
  upcomingDeadlines: any[]
  partnerUpdates: any[]
  recommendations: string[]
  quickActions: any[]
}

export function EnhancedDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState<'overview' | 'insights' | 'actions'>('overview')
  const { celebration, showCelebration, hideCelebration } = useCelebration()

  const handleQuickAction = (action: any) => {
    action.action()
  }

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load achievements data for summary
      const achievementsResponse = await apiClient.get('/achievements')
      
      // Load monthly progress for insights
      const progressResponse = await apiClient.get('/monthly-progress')
      
      if (achievementsResponse.progress && progressResponse.insights) {
        const summary = {
          totalContributions: achievementsResponse.progress.total_contributions || 0,
          totalGoals: achievementsResponse.progress.total_goals || 0,
          completedGoals: achievementsResponse.progress.completed_goals || 0,
          currentStreak: achievementsResponse.progress.current_streak || 0,
          totalPoints: achievementsResponse.progress.total_points || 0,
          currentLevel: Math.floor((achievementsResponse.progress.total_points || 0) / 100) + 1,
          nextLevelProgress: ((achievementsResponse.progress.total_points || 0) % 100)
        }

        const recommendations = progressResponse.insights.recommendations || []
        const upcomingDeadlines: any[] = [] // Will be populated when goals/expenses API is available
        const recentActivity: any[] = [] // Will be populated when activity API is available
        const partnerUpdates: any[] = [] // Will be populated when partner API is available
        const quickActions = [
          {
            id: '1',
            title: 'Record Contribution',
            description: 'Add a new contribution to your goals',
            icon: '💰',
            action: () => toast.success('Opening contribution form...'),
            color: 'blue'
          },
          {
            id: '2',
            title: 'Set New Goal',
            description: 'Create a new savings target',
            icon: '🎯',
            action: () => toast.success('Opening goal creation form...'),
            color: 'green'
          },
          {
            id: '3',
            title: 'View Progress',
            description: 'Check your monthly progress',
            icon: '📊',
            action: () => toast.success('Opening progress analytics...'),
            color: 'purple'
          },
          {
            id: '4',
            title: 'Partner Chat',
            description: 'Message your financial partner',
            icon: '💬',
            action: () => toast.success('Opening partner chat...'),
            color: 'orange'
          }
        ]

        setDashboardData({
          summary,
          recentActivity,
          upcomingDeadlines,
          partnerUpdates,
          recommendations,
          quickActions
        })
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }



  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDeadlineColor = (days: number) => {
    if (days <= 7) return 'text-red-600 dark:text-red-400'
    if (days <= 14) return 'text-orange-600 dark:text-orange-400'
    return 'text-green-600 dark:text-green-400'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold">Enhanced Dashboard</h1>
              <p className="text-indigo-100">Loading your financial insights...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Notifications */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold">Enhanced Dashboard</h1>
              <p className="text-indigo-100">Your financial command center</p>
            </div>
          </div>
          
          {/* Smart Notification Manager */}
          <SmartNotificationManager
            userId="user-id"
            userProfile={{}}
            goals={[]}
            contributions={[]}
            achievements={[]}
            onNotificationAction={(notification) => {
              toast.success(`Handling notification: ${notification.title}`)
            }}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'insights', label: 'Insights', icon: '💡' },
            { id: 'actions', label: 'Quick Actions', icon: '⚡' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedView(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedView === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {dashboardData.summary.totalContributions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Contributions</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dashboardData.summary.completedGoals}/{dashboardData.summary.totalGoals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Goals Completed</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {dashboardData.summary.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Month Streak</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                Level {dashboardData.summary.currentLevel}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {dashboardData.summary.nextLevelProgress}/100 XP
              </div>
            </div>
          </div>

          {/* Recent Activity & Upcoming Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                📝 Recent Activity
              </h2>
              <div className="space-y-3">
                {dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-2xl">{activity.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.timestamp.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ⏰ Upcoming Deadlines
              </h2>
              <div className="space-y-3">
                {dashboardData.upcomingDeadlines.map((deadline) => {
                  const daysUntil = getDaysUntilDeadline(deadline.deadline)
                  return (
                    <div key={deadline.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {deadline.title}
                        </div>
                        <span className={`text-sm font-bold ${getDeadlineColor(daysUntil)}`}>
                          {daysUntil} day{daysUntil > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Target: {formatCurrency(deadline.amount)}</span>
                        <span>{deadline.progress}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${deadline.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insights View */}
      {selectedView === 'insights' && dashboardData && (
        <div className="space-y-6">
          {/* Financial Health */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🏥 Financial Health Assessment
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  Excellent
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">
                  You&apos;re on track with your financial goals
                </div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboardData.summary.currentStreak}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Month contribution streak
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {dashboardData.summary.totalPoints}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Total achievement points
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              💡 Smart Recommendations
            </h2>
            <div className="space-y-3">
              {dashboardData.recommendations.length > 0 ? (
                dashboardData.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
                    <span className="text-blue-800 dark:text-blue-200">{rec}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <span className="text-4xl block mb-2">🎉</span>
                  <p>No recommendations needed!</p>
                  <p className="text-sm">You&apos;re doing great with your finances.</p>
                </div>
              )}
            </div>
          </div>

          {/* Partner Updates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🤝 Partner Updates
            </h2>
            <div className="space-y-3">
              {dashboardData.partnerUpdates.map((update) => (
                <div key={update.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-2xl">{update.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {update.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {update.message}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {update.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions View */}
      {selectedView === 'actions' && dashboardData && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ⚡ Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData.quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  className={`p-6 rounded-xl border-2 border-dashed transition-all hover:scale-105 ${
                    action.color === 'blue' ? 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                    action.color === 'green' ? 'border-green-300 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' :
                    action.color === 'purple' ? 'border-purple-300 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20' :
                    'border-orange-300 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-4xl block mb-3">{action.icon}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Celebration */}
      <ProgressCelebration
        type={celebration?.type || 'achievement'}
        title={celebration?.title || ''}
        message={celebration?.message || ''}
        icon={celebration?.icon || '🎉'}
        points={celebration?.points}
        isVisible={!!celebration}
        onClose={hideCelebration}
      />

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadDashboardData}
          className="px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors"
        >
          🔄 Refresh Dashboard
        </button>
      </div>
    </div>
  )
}
