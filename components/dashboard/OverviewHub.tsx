'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { DashboardContributionSummary } from './DashboardContributionSummary'
import { QuickCharts } from '../analytics/QuickCharts'
import { MobileUsageGuide } from '../mobile/MobileUsageGuide'
import { useMobilePWA } from '../pwa/MobilePWA'

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
  onNavigate: (view: string, params?: any) => void
  onNavigateToProfile: () => void
  onNavigateToPartnerships: () => void
  onSafetyPotUpdate?: () => void
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
  onNavigateToPartnerships,
  onSafetyPotUpdate
}: OverviewHubProps) {
  const [loading, setLoading] = useState(false)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [localMonthlyProgress, setLocalMonthlyProgress] = useState<any>(null)
  const [safetyPotAmount, setSafetyPotAmount] = useState(0)
  const [showMobileGuide, setShowMobileGuide] = useState(false)

  const {
    isMobile: isMobileClient,
    isPWA,
    isStandalone,
    isClient: hasClientInfo
  } = useMobilePWA()

  useEffect(() => {
    if (!hasClientInfo) {
      return
    }

    const dismissed = typeof window !== 'undefined'
      ? localStorage.getItem('splitsave-mobile-guide-dismissed')
      : null

    if (!dismissed && (isMobileClient || isPWA || isStandalone)) {
      setShowMobileGuide(true)
    }
  }, [hasClientInfo, isMobileClient, isPWA, isStandalone])

  const openMobileGuide = useCallback(() => {
    setShowMobileGuide(true)

    if (typeof window !== 'undefined') {
      localStorage.removeItem('splitsave-mobile-guide-dismissed')
    }
  }, [])

  const dismissMobileGuide = useCallback(() => {
    setShowMobileGuide(false)

    if (typeof window !== 'undefined') {
      localStorage.setItem('splitsave-mobile-guide-dismissed', 'true')
    }
  }, [])

  // Fetch safety pot data
  const fetchSafetyPotData = useCallback(async () => {
    try {
      const response = await apiClient.get('/safety-pot')
      const currentAmount = response.data?.current_amount || 0
      setSafetyPotAmount(currentAmount)
      console.log('🔍 Dashboard: Fetched safety pot amount:', currentAmount)
    } catch (error) {
      console.warn('Failed to fetch safety pot data for dashboard:', error)
      // Fallback to profile data if API fails
      setSafetyPotAmount(profile?.safety_pot_amount || 0)
    }
  }, [profile?.safety_pot_amount])

  // Load safety pot data on component mount
  useEffect(() => {
    fetchSafetyPotData()
  }, [fetchSafetyPotData])

  // Listen for safety pot updates from other components
  useEffect(() => {
    if (onSafetyPotUpdate) {
      // Create a custom event listener for safety pot updates
      const handleSafetyPotUpdate = () => {
        console.log('🔍 Dashboard: Safety pot update detected, refreshing data')
        fetchSafetyPotData()
      }
      
      // Listen for custom safety pot update events
      window.addEventListener('safetyPotUpdated', handleSafetyPotUpdate)
      
      return () => {
        window.removeEventListener('safetyPotUpdated', handleSafetyPotUpdate)
      }
    }
  }, [onSafetyPotUpdate, fetchSafetyPotData])

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const totalExpenses = Array.isArray(expenses) ? expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) : 0
    const totalSaved = Array.isArray(goals) ? goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0) : 0
    const totalTarget = Array.isArray(goals) ? goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0) : 0
    const completedGoals = Array.isArray(goals) ? goals.filter(goal => 
      goal.current_amount >= goal.target_amount
    ).length : 0
    
    // Use actual safety pot amount from API
    const monthlyIncome = (profile?.income || 0) + (partnerProfile?.income || 0)
    const recommendedSafetyPot = monthlyIncome * 0.1 * 6 // 6 months coverage
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
  }, [expenses, goals, profile, partnerProfile, monthlyProgress?.trends?.consistencyScore, safetyPotAmount])

  // Quick actions for main tasks
  const quickActions: QuickAction[] = useMemo(() => [
    {
      id: 'add-expense',
      title: 'Add Expense',
      icon: '💰',
      color: 'blue',
      description: 'Record a new shared expense',
      action: () => onNavigate('expenses')
    },
    {
      id: 'record-contribution',
      title: 'Record Progress',
      icon: '📊',
      color: 'green',
      description: 'Update your monthly contributions',
      action: () => onNavigate('expenses', { initialTab: 'contributions' })
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
      action: () => onNavigate('partnerships')
    },
    {
      id: 'mobile-guide',
      title: 'Mobile Guide',
      icon: '📲',
      color: 'indigo',
      description: 'Install or browse SplitSave on mobile',
      action: openMobileGuide
    }
  ], [onNavigate, openMobileGuide])



  const loadRecentActivity = useCallback(async () => {
    try {
      // Fetch real activity from the activity feed API
      const response = await apiClient.get('/activity-feed?limit=5&offset=0&filter=all')
      const activities = response.data?.activities || []
      
      // Transform the API response to match our display format
      const transformedActivities = activities.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        title: activity.title,
        amount: activity.amount,
        timestamp: new Date(activity.created_at),
        icon: activity.type_icon || '📱',
        user: activity.user_name || 'Unknown',
        description: activity.description
      }))

      setRecentActivity(transformedActivities)
    } catch (error) {
      console.error('Failed to load recent activity:', error)
      // Fallback to empty activity list
      setRecentActivity([])
    }
  }, [])

  const loadMonthlyProgress = async () => {
    try {
      const response = await apiClient.get('/monthly-progress')
      setLocalMonthlyProgress(response)
    } catch (error) {
      console.error('Failed to load monthly progress:', error)
    }
  }

  // Load recent activity
  useEffect(() => {
    loadRecentActivity()
    loadMonthlyProgress()
  }, [loadRecentActivity])

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

  // Calculate payday information
  const calculatePaydayInfo = () => {
    const today = new Date()
    const userPayday = '25th' // You get paid on the 25th
    const partnerPayday = '15th' // Partner gets paid on the 15th
    
    // Calculate next paydays
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()
    
    // Your next payday (25th of current or next month)
    let userNextPayday = new Date(currentYear, currentMonth, 25)
    if (today.getDate() > 25) {
      userNextPayday = new Date(currentYear, currentMonth + 1, 25)
    }
    
    // Partner's next payday (15th of current or next month)
    let partnerNextPayday = new Date(currentYear, currentMonth, 15)
    if (today.getDate() > 15) {
      partnerNextPayday = new Date(currentYear, currentMonth + 1, 15)
    }
    
    // Calculate days until payday
    const daysUntilUserPayday = Math.ceil((userNextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const daysUntilPartnerPayday = Math.ceil((partnerNextPayday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    return {
      userPayday,
      partnerPayday,
      daysUntilUserPayday,
      daysUntilPartnerPayday,
      userNextPayday,
      partnerNextPayday
    }
  }

  const paydayInfo = calculatePaydayInfo()

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

      {showMobileGuide && (
        <MobileUsageGuide
          isMobile={isMobileClient}
          isPWA={isPWA}
          isStandalone={isStandalone}
          onDismiss={dismissMobileGuide}
        />
      )}

      {/* Smart Notifications - Compact */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
            <span className="mr-2">🔔</span>
            Smart Notifications
          </h2>
          <button
            onClick={() => onNavigate('account', { initialTab: 'preferences' })}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Manage →
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Dynamic Payday Reminder */}
          {paydayInfo && (
            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-blue-600 dark:text-blue-400 mr-2 text-lg">💰</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                  {paydayInfo.daysUntilUserPayday === 0 ? 'Payday today!' :
                   paydayInfo.daysUntilUserPayday === 1 ? 'Payday tomorrow' :
                   `Payday in ${paydayInfo.daysUntilUserPayday} days`}
                </div>
                <button
                  onClick={() => onNavigate('partnerships', { initialTab: 'activity' })}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  Record contributions
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Goal Progress */}
          {goals && goals.length > 0 && (() => {
            const nearestGoal = goals
              .filter(goal => goal.target_date)
              .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())[0]
            
            if (nearestGoal) {
              const progress = nearestGoal.current_amount / nearestGoal.target_amount
              const daysRemaining = Math.ceil((new Date(nearestGoal.target_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              const goalIcon = nearestGoal.category === 'Holiday' ? '🏖️' : 
                              nearestGoal.category === 'House Deposit' ? '🏠' : 
                              nearestGoal.category === 'Emergency Fund' ? '🛡️' : '💰'
              
              return (
                <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <span className="text-orange-600 dark:text-orange-400 mr-2 text-lg">{goalIcon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-orange-800 dark:text-orange-200 truncate">
                      {nearestGoal.name}: {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      {Math.round(progress * 100)}% complete
                    </div>
                  </div>
                </div>
              )
            }
            return null
          })()}

          {/* Dynamic Smart Suggestion */}
          {(() => {
            const totalSaved = goals?.reduce((sum, goal) => sum + goal.current_amount, 0) || 0
            const totalTarget = goals?.reduce((sum, goal) => sum + goal.target_amount, 0) || 0
            const overallProgress = totalTarget > 0 ? totalSaved / totalTarget : 0
            
            let suggestion = ''
            let suggestionDetail = ''
            
            if (overallProgress > 0.8) {
              suggestion = 'Excellent progress!'
              suggestionDetail = 'Consider new goals'
            } else if (overallProgress > 0.5) {
              suggestion = 'Great savings streak!'
              suggestionDetail = `Consider +${currencySymbol}50/month`
            } else if (overallProgress > 0.2) {
              suggestion = 'Good start!'
              suggestionDetail = 'Keep building momentum'
            } else {
              suggestion = 'Ready to start saving?'
              suggestionDetail = 'Set your first goal'
            }
            
            return (
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <span className="text-green-600 dark:text-green-400 mr-2 text-lg">💡</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-green-800 dark:text-green-200 truncate">
                    {suggestion}
                  </div>
                  {suggestionDetail === 'Set your first goal' ? (
                    <button
                      onClick={() => onNavigate('goals')}
                      className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
                    >
                      {suggestionDetail}
                    </button>
                  ) : (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      {suggestionDetail}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      {/* Quick Charts */}
      <QuickCharts 
        expenses={expenses}
        goals={goals}
        currencySymbol={currencySymbol}
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saved */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Saved</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                {currencySymbol}{stats.totalSaved.toFixed(0)}
              </p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {getProgressPercentage().toFixed(0)}% of target
            </p>
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="mt-2 text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium"
          >
            View Goals →
          </button>
        </div>

        {/* Safety Pot */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Safety Pot</p>
              <p className={`text-xl font-bold text-${safetyPotStatus.color}-600 dark:text-${safetyPotStatus.color}-400`}>
                {currencySymbol}{stats.safetyPotAmount.toFixed(0)}
              </p>
            </div>
            <div className="text-2xl">🛡️</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {stats.monthsOfExpensesCovered.toFixed(1)} months covered
          </p>
          <button
            onClick={() => onNavigate('expenses', { initialTab: 'safety-pot' })}
            className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            View Safety Net →
          </button>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {stats.currentStreak} months
              </p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Keep it up!
          </p>
          <button
            onClick={() => onNavigate('monthly-progress')}
            className="mt-2 text-xs text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 font-medium"
          >
            View Progress →
          </button>
        </div>

        {/* Completed Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {stats.completedGoals} goals
              </p>
            </div>
            <div className="text-2xl">🏆</div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {goals?.length || 0} total goals
          </p>
          <button
            onClick={() => onNavigate('goals')}
            className="mt-2 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium"
          >
            View Goals →
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
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
                action.color === 'blue' ? 'border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' :
                action.color === 'green' ? 'border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' :
                action.color === 'purple' ? 'border-purple-300 dark:border-purple-600 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20' :
                'border-orange-300 dark:border-orange-600 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20'
              }`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-medium mb-1 text-gray-900 dark:text-white">{action.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Contribution Breakdown */}
      {partnerships && partnerships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
            <span className="mr-2">💰</span>
            Who Pays What
          </h2>
          <DashboardContributionSummary
            partnerships={partnerships}
            profile={profile}
            partnerProfile={partnerProfile}
            user={user}
            currencySymbol={currencySymbol}
            expenses={expenses}
            goals={goals}
          />
        </div>
      )}

      {/* Payday Summary */}
      {partnerships && partnerships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <span className="mr-2">📅</span>
              Next Paydays
            </h2>
            <button
              onClick={() => onNavigate('partnerships', { initialTab: 'transparency' })}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View Full Transparency →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 dark:text-blue-200 font-medium">Your Payday</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {paydayInfo.userPayday}
                </span>
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                {paydayInfo.userNextPayday.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {paydayInfo.daysUntilUserPayday === 0 ? 'Today!' : 
                 paydayInfo.daysUntilUserPayday === 1 ? 'Tomorrow' : 
                 `${paydayInfo.daysUntilUserPayday} days`}
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 dark:text-green-200 font-medium">Partner's Payday</span>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {paydayInfo.partnerPayday}
                </span>
              </div>
              <div className="text-sm text-green-700 dark:text-green-300 mb-1">
                {paydayInfo.partnerNextPayday.toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {paydayInfo.daysUntilPartnerPayday === 0 ? 'Today!' : 
                 paydayInfo.daysUntilPartnerPayday === 1 ? 'Tomorrow' : 
                 `${paydayInfo.daysUntilPartnerPayday} days`}
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center">
              <span className="text-yellow-600 dark:text-yellow-400 mr-2">💡</span>
              <span className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Quick Summary:</strong> You contribute 37.5% of shared expenses, Partner contributes 62.5% based on income split.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Financial Health Overview */}
      {partnerships && partnerships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <span className="mr-2">💼</span>
              Financial Health Overview
            </h2>
            <button
              onClick={() => onNavigate('partnerships', { initialTab: 'transparency' })}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View Full Analysis →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 dark:text-blue-200 font-medium">Your Position</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  Excellent
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Income:</span>
                  <span>{currencySymbol}3,000</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Personal Expenses:</span>
                  <span>{currencySymbol}400</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300 font-medium">
                  <span>Available:</span>
                  <span>{currencySymbol}2,600</span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Personal expenses: 13.3% of income
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 dark:text-green-200 font-medium">Partner's Position</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">
                  Excellent
                </span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Income:</span>
                  <span>{currencySymbol}5,000</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Personal Expenses:</span>
                  <span>{currencySymbol}400</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300 font-medium">
                  <span>Available:</span>
                  <span>{currencySymbol}4,600</span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Personal expenses: 8.0% of income
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <span className="text-green-600 dark:text-green-400 mr-2">✅</span>
              <span className="text-sm text-green-800 dark:text-green-200">
                <strong>Great News:</strong> Both partners have excellent personal expense ratios (under 15%). 
                You could consider increasing savings or shared contributions.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payday & Income Summary */}
      {partnerships && partnerships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <span className="mr-2">📅</span>
              Payday & Income Summary
            </h2>
            <button
              onClick={() => onNavigate('partnerships', { initialTab: 'transparency' })}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View Full Transparency →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Your Payday */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-800 dark:text-blue-200 font-medium text-sm">Your Payday</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">
                  {paydayInfo.userPayday}
                </span>
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {paydayInfo.daysUntilUserPayday === 0 ? 'Today!' : 
                 paydayInfo.daysUntilUserPayday === 1 ? 'Tomorrow' : 
                 `${paydayInfo.daysUntilUserPayday} days`}
              </div>
            </div>
            
            {/* Partner's Payday */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-800 dark:text-green-200 font-medium text-sm">Partner's Payday</span>
                <span className="text-green-600 dark:text-green-400 font-bold">
                  {paydayInfo.partnerPayday}
                </span>
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {paydayInfo.daysUntilPartnerPayday === 0 ? 'Today!' : 
                 paydayInfo.daysUntilPartnerPayday === 1 ? 'Tomorrow' : 
                 `${paydayInfo.daysUntilPartnerPayday} days`}
              </div>
            </div>
            
            {/* Combined Income */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-800 dark:text-purple-200 font-medium text-sm">Combined Income</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">
                  {currencySymbol}8,000
                </span>
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                You: {currencySymbol}3,000 | Partner: {currencySymbol}5,000
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <span className="text-blue-600 dark:text-blue-400 mr-2">💡</span>
              <span className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Quick Overview:</strong> You get paid on the 25th, Partner on the 15th. 
                Combined monthly income of {currencySymbol}8,000 with 37.5%/62.5% proportional split.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Transparency Overview */}
      {partnerships && partnerships.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <span className="mr-2">🔍</span>
              Transparency Overview
            </h2>
            <button
              onClick={() => onNavigate('partnerships', { initialTab: 'transparency' })}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View Full Transparency →
            </button>
          </div>
          
          {/* Key Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {currencySymbol}{((profile?.income || 0) + (partnerProfile?.income || 0)).toLocaleString()}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Combined Income</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {profile?.income && partnerProfile?.income ? 
                  `${Math.round((profile.income / (profile.income + partnerProfile.income)) * 100)}% / ${Math.round((partnerProfile.income / (profile.income + partnerProfile.income)) * 100)}%` : 
                  'N/A'
                }
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">Income Split</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {profile?.payday || 'N/A'} / {partnerProfile?.payday || 'N/A'}
              </div>
              <div className="text-xs text-purple-700 dark:text-purple-300">Paydays</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">100%</div>
              <div className="text-xs text-orange-700 dark:text-orange-300">Allocated</div>
            </div>
          </div>

          {/* Payday & Income Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-blue-800 dark:text-blue-200 font-medium mb-3 flex items-center">
                <span className="mr-2">👤</span>
                Your Financial Picture
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Monthly Income:</span>
                  <span className="font-semibold">{currencySymbol}{(profile?.income || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Personal Expenses:</span>
                  <span className="font-semibold">{currencySymbol}{(profile?.personal_allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300 border-t border-blue-200 dark:border-blue-700 pt-2">
                  <span className="font-medium">Available:</span>
                  <span className="font-bold">{currencySymbol}{((profile?.income || 0) - (profile?.personal_allowance || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Next Payday:</span>
                  <span className="font-semibold">
                    {paydayInfo?.userNextPayday.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {paydayInfo?.daysUntilUserPayday === 0 ? 'Today!' : 
                   paydayInfo?.daysUntilUserPayday === 1 ? 'Tomorrow' : 
                   `${paydayInfo?.daysUntilUserPayday} days until payday`}
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="text-green-800 dark:text-green-200 font-medium mb-3 flex items-center">
                <span className="mr-2">👥</span>
                Partner's Financial Picture
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Monthly Income:</span>
                  <span className="font-semibold">{currencySymbol}{(partnerProfile?.income || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Personal Expenses:</span>
                  <span className="font-semibold">{currencySymbol}{(partnerProfile?.personal_allowance || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300 border-t border-green-200 dark:border-green-700 pt-2">
                  <span className="font-medium">Available:</span>
                  <span className="font-bold">{currencySymbol}{((partnerProfile?.income || 0) - (partnerProfile?.personal_allowance || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Next Payday:</span>
                  <span className="font-semibold">
                    {paydayInfo?.partnerNextPayday.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {paydayInfo?.daysUntilPartnerPayday === 0 ? 'Today!' : 
                   paydayInfo?.daysUntilPartnerPayday === 1 ? 'Tomorrow' : 
                   `${paydayInfo?.daysUntilPartnerPayday} days until payday`}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <span className="text-blue-600 dark:text-blue-400 mr-2">💡</span>
              <span className="text-sm text-gray-800 dark:text-gray-200">
                <strong>Quick Summary:</strong> You get paid on the {profile?.payday || 'N/A'}, Partner on the {partnerProfile?.payday || 'N/A'}. 
                Combined income of {currencySymbol}{((profile?.income || 0) + (partnerProfile?.income || 0)).toLocaleString()} with {profile?.income && partnerProfile?.income ? 
                  `${Math.round((profile.income / (profile.income + partnerProfile.income)) * 100)}%/${Math.round((partnerProfile.income / (profile.income + partnerProfile.income)) * 100)}%` : 
                  'N/A'
                } split. 
                Personal expense ratios: {profile?.income ? Math.round(((profile.personal_allowance || 0) / profile.income) * 100) : 0}% and {partnerProfile?.income ? Math.round(((partnerProfile.personal_allowance || 0) / partnerProfile.income) * 100) : 0}%.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <span className="mr-2">🔍</span>
              Transparency Overview
            </h2>
            <button
              onClick={() => onNavigate('partnerships')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Connect Partner →
            </button>
          </div>
          
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Partner Connected
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Connect with your partner to see transparency insights, shared financial goals, and collaborative expense tracking.
            </p>
            <button
              onClick={() => onNavigate('partnerships')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Invite Your Partner
            </button>
          </div>
        </div>
      )}

      {/* Goal Progress Overview */}
      {goals && goals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
              <span className="mr-2">🎯</span>
              Goal Progress Overview
            </h2>
            <button
              onClick={() => onNavigate('goals')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View All Goals →
            </button>
          </div>
          
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const progress = goal.current_amount / goal.target_amount
              const daysRemaining = goal.target_date ? Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
              
              return (
                <div key={goal.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{goal.category === 'Holiday' ? '🏖️' : goal.category === 'House Deposit' ? '🏠' : goal.category === 'Emergency Fund' ? '🛡️' : '💰'}</span>
                      <h3 className="font-medium text-gray-900 dark:text-white">{goal.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">
                        {currencySymbol}{goal.current_amount.toLocaleString()} / {currencySymbol}{goal.target_amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {Math.round(progress * 100)}% complete
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>
                      {daysRemaining !== null ? (
                        daysRemaining > 0 ? `${daysRemaining} days remaining` : 
                        daysRemaining === 0 ? 'Target date reached!' : 
                        `${Math.abs(daysRemaining)} days overdue`
                      ) : 'No target date'}
                    </span>
                    <span>
                      {currencySymbol}{Math.max(0, goal.target_amount - goal.current_amount).toLocaleString()} to go
                    </span>
                  </div>
                </div>
              )
            })}
            
            {goals.length > 3 && (
              <div className="text-center pt-2">
                <button
                  onClick={() => onNavigate('goals')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                >
                  View {goals.length - 3} more goals →
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center text-gray-900 dark:text-white">
            <span className="mr-2">📱</span>
            Recent Activity
          </h2>
          <button 
            onClick={() => onNavigate('partnerships', { initialTab: 'activity' })}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            View All
          </button>
        </div>
        
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-lg">{activity.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    {activity.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{activity.description}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.user} • {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
                {activity.amount && (
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {currencySymbol}{activity.amount.toFixed(0)}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p className="text-sm">No recent activity</p>
            <p className="text-xs">Start by adding an expense or recording progress!</p>
          </div>
        )}
      </div>

      {/* Partner Financial Overview */}
      {partnerships.length > 0 && partnerProfile && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Financial Overview</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Side-by-side income breakdown & contribution targets</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Your Breakdown */}
            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-2">
                  {(profile?.name || 'You').charAt(0).toUpperCase()}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{profile?.name || 'You'} Breakdown</h3>
              </div>

              {/* Total Income */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Total Income</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">Monthly</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {currencySymbol}{(profile?.income || 0).toLocaleString()}
                </div>
              </div>

              {/* Personal Allowance */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Personal Allowance</span>
                  <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800 px-2 py-1 rounded">Your Money</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {currencySymbol}{(profile?.personal_allowance || 0).toLocaleString()}
                </div>
              </div>

              {/* Disposable Income */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Disposable Income</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded">For Goals</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {currencySymbol}{((profile?.income || 0) - (profile?.personal_allowance || 0)).toLocaleString()}
                </div>
              </div>

              {/* Your Monthly Contributions */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">{profile?.name || 'Your'} Monthly Contributions</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Expenses</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7).toLocaleString()} (70%)
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Savings</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2).toLocaleString()} (20%)
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">Safety</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
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
                <h3 className="font-semibold text-gray-900 dark:text-white">{partnerProfile?.name || 'Partner'}&apos;s Breakdown</h3>
              </div>

              {/* Total Income */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700 dark:text-blue-300">Total Income</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">Monthly</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {partnerProfile?.income ? `${currencySymbol}${partnerProfile.income.toLocaleString()}` : '--'}
                </div>
              </div>

              {/* Personal Allowance */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 dark:text-green-300">Personal Allowance</span>
                  <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-800 px-2 py-1 rounded">Partner&apos;s Money</span>
                </div>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {partnerProfile?.personal_allowance ? `${currencySymbol}${partnerProfile.personal_allowance.toLocaleString()}` : '--'}
                </div>
              </div>

              {/* Disposable Income */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Disposable Income</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-800 px-2 py-1 rounded">For Goals</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {partnerProfile?.income && partnerProfile?.personal_allowance 
                    ? `${currencySymbol}${(partnerProfile.income - partnerProfile.personal_allowance).toLocaleString()}`
                    : '--'
                  }
                </div>
              </div>

              {/* Partner's Monthly Contributions */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">{partnerProfile?.name || 'Partner'}&apos;s Monthly Contributions</h4>
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
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Individual Goal Contributions
              </h4>
              
              {/* Shared Expenses */}
              <div className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-blue-100 dark:border-blue-800 hover:border-blue-200 dark:hover:border-blue-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-gray-900 dark:text-white">Shared Expenses</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
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
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{profile?.name || 'You'}</div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">{currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7).toLocaleString()}</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{partnerProfile?.name || 'Partner'}</div>
                    <div className="font-semibold text-blue-700 dark:text-blue-300">
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
                  {Array.isArray(goals) ? goals.slice(0, 4).map((goal, index) => {
                    // Calculate contribution percentages based on goal priority/target
                    const goalPercentages = [0.12, 0.08, 0.05, 0.03]; // Decreasing percentages for goals
                    const percentage = goalPercentages[index] || 0.02;
                    
                    const yourContribution = Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * percentage);
                    const partnerContribution = partnerProfile?.income && partnerProfile?.personal_allowance 
                      ? Math.round((partnerProfile.income - partnerProfile.personal_allowance) * percentage)
                      : 0;
                    
                    const progressPercent = Math.round((goal.current_amount || 0) / (goal.target_amount || 1) * 100);
                    
                    return (
                      <div key={goal.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-green-800 hover:border-green-200 dark:hover:border-green-700 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                              <span className="font-semibold text-gray-900 dark:text-white">{goal.name || 'Untitled Goal'}</span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {currencySymbol}{(goal.current_amount || 0).toLocaleString()} / {currencySymbol}{(goal.target_amount || 0).toLocaleString()}
                              <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                                {progressPercent}% complete
                              </span>
                            </div>
                            {goal.target_date && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Target: {new Date(goal.target_date).toLocaleDateString('en-GB', { 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                              {currencySymbol}{(yourContribution + partnerContribution).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">per month</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{profile?.name || 'You'}</div>
                            <div className="font-semibold text-blue-700 dark:text-blue-300">{currencySymbol}{yourContribution.toLocaleString()}</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{partnerProfile?.name || 'Partner'}</div>
                            <div className="font-semibold text-green-700 dark:text-green-300">
                              {partnerProfile?.income && partnerProfile?.personal_allowance
                                ? `${currencySymbol}${partnerContribution.toLocaleString()}`
                                : '--'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }) : null}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <span className="text-2xl mb-2 block">🎯</span>
                  <p className="text-sm">No goals set yet</p>
                  <button 
                    onClick={() => onNavigate('goals')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm mt-1"
                  >
                    Create your first goal
                  </button>
                </div>
              )}

              {/* Safety Pot */}
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800 hover:border-purple-200 dark:hover:border-purple-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                      <span className="font-semibold text-gray-900 dark:text-white">Safety Pot</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Emergency fund • 10% of disposable income
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {currencySymbol}{safetyPotAmount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">current amount</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{profile?.name || 'You'}</div>
                    <div className="font-semibold text-purple-700 dark:text-purple-300">{currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1).toLocaleString()}</div>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{partnerProfile?.name || 'Partner'}</div>
                    <div className="font-semibold text-purple-700 dark:text-purple-300">
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
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                👥 Connect with Your Partner
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                Invite your partner to start sharing expenses and saving together.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToPartnerships}
            className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Send Invitation
          </button>
        </div>
      )}
    </div>
  )
}
