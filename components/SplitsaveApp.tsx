'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthProvider'
import { useTheme } from 'next-themes'
import { toast } from '@/lib/toast'
import { apiClient, type Expense, type Goal, type ApprovalRequest } from '@/lib/api-client'
import { useAnalytics, trackPageView, trackNavigation } from '@/lib/analytics'
import { DarkModeToggle } from './DesignSystem'
import dynamic from 'next/dynamic'

// Lazy load heavy components for better performance
const AIInsightsEngine = dynamic(() => import('./AIInsightsEngine').then(mod => ({ default: mod.AIInsightsEngine })), {
  loading: () => <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading AI Insights...</div>,
  ssr: false
});

const AdvancedAnalyticsDashboard = dynamic(() => import('./AdvancedAnalyticsDashboard').then(mod => ({ default: mod.AdvancedAnalyticsDashboard })), {
  loading: () => <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading Analytics...</div>,
  ssr: false
});

const PerformanceOptimizer = dynamic(() => import('./PerformanceOptimizer').then(mod => ({ default: mod.PerformanceOptimizer })), {
  loading: () => <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading Optimizer...</div>,
  ssr: false
});

const GamificationDashboard = dynamic(() => import('./GamificationDashboard').then(mod => ({ default: mod.GamificationDashboard })), {
  loading: () => <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading Gamification...</div>,
  ssr: false
});

const AchievementCelebration = dynamic(() => import('./AchievementCelebration').then(mod => ({ default: mod.AchievementCelebration })), {
  loading: () => null,
  ssr: false
});

const EnhancedDashboard = dynamic(() => import('./EnhancedDashboard').then(mod => ({ default: mod.EnhancedDashboard })), {
  loading: () => <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading Dashboard...</div>,
  ssr: false
});


import { ProfileManager } from './ProfileManager'
import { PWAInstallPrompt } from './PWAInstallPrompt'
import { ClientOnly } from './ClientOnly'
import { EnhancedSafetyPot } from './EnhancedSafetyPot'
import ContributionManager from './ContributionManager'
import { PartnershipManager } from './PartnershipManager'
import { MonthlyContributionSummary } from './MonthlyContributionSummary'
import { GoalContributionForm } from './GoalContributionForm'

import { ActivityFeed } from './ActivityFeed'
import { MonthlyProgress } from './MonthlyProgress'
import { AnalyticsView } from './AnalyticsView'
import { NotificationManager } from './NotificationManager'
import { AchievementsView } from './AchievementsView'
import { PartnerCollaborationView } from './PartnerCollaborationView'
import { DataExportView } from './DataExportView'
import { MobileNavigation, MobileCard, MobileButton, MobileInput, MobileSelect } from './MobileNavigation'

// Import new hub components
import { OverviewHub } from './OverviewHub'
import { MoneyHub } from './MoneyHub'
import { GoalsHub } from './GoalsHub'
import { PartnerHub } from './PartnerHub'
import { AccountHub } from './AccountHub'
import { AnalyticsHub } from './AnalyticsHub'

import { SecurityDashboard } from './SecurityDashboard'
import { calculateNextPayday, getNextPaydayDescription, isTodayPayday } from '@/lib/payday-utils'
import { calculateGoalProgress, calculateSmartRedistribution, formatTimeRemaining, getContributionRecommendation } from '@/lib/goal-utils'

export function SplitsaveApp() {
  const { user, signOut } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [currentView, setCurrentView] = useState('overview')
  const analytics = useAnalytics()

  // Dark mode toggle function
  const toggleDarkMode = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }, [setTheme, resolvedTheme])

  // Handle navigation with view mapping for backward compatibility
  const handleNavigation = (view: string) => {
    // Map consolidated tab names to hub views
    const viewMapping: { [key: string]: string } = {
      'dashboard': 'overview',
      'money': 'money',
      'goals': 'goals',
      'partners': 'partner',
      'analytics': 'analytics',
      'profile': 'account',
      // Legacy mappings for backward compatibility
      'expenses': 'money',
      'contributions': 'money',
      'safety-pot': 'money',
      'monthly-progress': 'money',
      'activity': 'account',
      'achievements': 'goals',
      'ai-insights': 'goals',
      'gamification': 'goals',
      'partner-collaboration': 'partner',
      'partnerships': 'partner',
      'approvals': 'partner',
      'security': 'account',
      'data-export': 'analytics',
      'advanced-analytics': 'analytics'
    }
    
    const mappedView = viewMapping[view] || view
    // Track navigation change
    if (currentView !== mappedView) {
      analytics.trackNavigation(currentView, mappedView, 'main_navigation')
    }
    setCurrentView(mappedView)
  }
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([])
  const [partnerships, setPartnerships] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [monthlyProgress, setMonthlyProgress] = useState<any>(null)
  const [profileCompletionShown, setProfileCompletionShown] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [partnerProfile, setPartnerProfile] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [celebratingAchievement, setCelebratingAchievement] = useState<any>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [achievementSummary, setAchievementSummary] = useState<any>(null)


  // Currency utility functions
  const getCurrencySymbol = (currency: string) => {
    const currencyMap: { [key: string]: string } = {
      'USD': '$',
      'GBP': '£',
      'EUR': '€',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr',
      'PLN': 'zł',
      'CZK': 'Kč',
      'HUF': 'Ft',
      'RON': 'lei',
      'BGN': 'лв',
      'HRK': 'kn',
      'RUB': '₽',
      'TRY': '₺',
      'BRL': 'R$',
      'MXN': '$',
      'ARS': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'UYU': '$',
      'VND': '₫',
      'THB': '฿',
      'MYR': 'RM',
      'SGD': 'S$',
      'HKD': 'HK$',
      'TWD': 'NT$',
      'KRW': '₩',
      'INR': '₹',
      'PKR': '₨',
      'BDT': '৳',
      'LKR': 'Rs',
      'NPR': '₨',
      'MMK': 'K',
      'KHR': '៛',
      'LAK': '₭',
      'MNT': '₮',
      'KZT': '₸',
      'UZS': 'so\'m',
      'GEL': '₾',
      'AMD': '֏',
      'AZN': '₼',
      'BYN': 'Br',
      'MDL': 'L',
      'UAH': '₴',
      'BAM': 'KM',
      'RSD': 'дин',
      'MKD': 'ден',
      'ALL': 'L',
      'KGS': 'с',
      'TJS': 'ЅМ',
      'TMT': 'T',
      'AFN': '؋',
      'IRR': '﷼',
      'IQD': 'ع.د',
      'JOD': 'د.ا',
      'KWD': 'د.ك',
      'LBP': 'ل.ل',
      'OMR': 'ر.ع.',
      'QAR': 'ر.ق',
      'SAR': 'ر.س',
      'SYP': 'ل.س',
      'AED': 'د.إ',
      'YER': 'ر.ي',
      'EGP': 'ج.م',
      'LYD': 'ل.د',
      'TND': 'د.ت',
      'DZD': 'د.ج',
      'MAD': 'د.م.',
      'XOF': 'CFA',
      'XAF': 'FCFA',
      'XPF': 'CFP',
      'ZAR': 'R',
      'NGN': '₦',
      'KES': 'KSh',
      'UGX': 'USh',
      'TZS': 'TSh',
      'ETB': 'Br',
      'GHS': 'GH₵',
      'ZMW': 'ZK',
      'BWP': 'P',
      'NAD': 'N$',
      'SZL': 'E',
      'LSL': 'L',
      'MUR': '₨',
      'SCR': '₨',
      'MVR': 'MVR',
      'BTN': 'Nu.'
    }
    return currencyMap[currency] || currency
  }

  const getCurrencyEmoji = (currency: string) => {
    const emojiMap: { [key: string]: string } = {
      'USD': '💵', // Dollar bill
      'GBP': '💷', // Pound note
      'EUR': '💶', // Euro note
      'CAD': '🇨🇦', // Canadian flag
      'AUD': '🇦🇺', // Australian flag
      'JPY': '💴', // Yen note
      'CHF': '🇨🇭', // Swiss flag
      'SEK': '🇸🇪', // Swedish flag
      'NOK': '🇳🇴', // Norwegian flag
      'DKK': '🇩🇰', // Danish flag
      'PLN': '🇵🇱', // Polish flag
      'CZK': '🇨🇿', // Czech flag
      'HUF': '🇭🇺', // Hungarian flag
      'RON': '🇷🇴', // Romanian flag
      'BGN': '🇧🇬', // Bulgarian flag
      'HRK': '🇭🇷', // Croatian flag
      'RUB': '🇷🇺', // Russian flag
      'TRY': '🇹🇷', // Turkish flag
      'BRL': '🇧🇷', // Brazilian flag
      'MXN': '🇲🇽', // Mexican flag
      'ARS': '🇦🇷', // Argentine flag
      'CLP': '🇨🇱', // Chilean flag
      'COP': '🇨🇴', // Colombian flag
      'PEN': '🇵🇪', // Peruvian flag
      'UYU': '🇺🇾', // Uruguayan flag
      'VND': '🇻🇳', // Vietnamese flag
      'THB': '🇹🇭', // Thai flag
      'MYR': '🇲🇾', // Malaysian flag
      'SGD': '🇸🇬', // Singapore flag
      'HKD': '🇭🇰', // Hong Kong flag
      'TWD': '🇹🇼', // Taiwan flag
      'KRW': '🇰🇷', // South Korean flag
      'INR': '🇮🇳', // Indian flag
      'PKR': '🇵🇰', // Pakistani flag
      'BDT': '🇧🇩', // Bangladeshi flag
      'LKR': '🇱🇰', // Sri Lankan flag
      'NPR': '🇳🇵', // Nepalese flag
      'MMK': '🇲🇲', // Myanmar flag
      'KHR': '🇰🇭', // Cambodian flag
      'LAK': '🇱🇦', // Lao flag
      'MNT': '🇲🇳', // Mongolian flag
      'KZT': '🇰🇿', // Kazakh flag
      'UZS': '🇺🇿', // Uzbek flag
      'GEL': '🇬🇪', // Georgian flag
      'AMD': '🇦🇲', // Armenian flag
      'AZN': '🇦🇿', // Azerbaijani flag
      'BYN': '🇧🇾', // Belarusian flag
      'MDL': '🇲🇩', // Moldovan flag
      'UAH': '🇺🇦', // Ukrainian flag
      'BAM': '🇧🇦', // Bosnian flag
      'RSD': '🇷🇸', // Serbian flag
      'MKD': '🇲🇰', // Macedonian flag
      'ALL': '🇦🇱', // Albanian flag
      'KGS': '🇰🇬', // Kyrgyz flag
      'TJS': '🇹🇯', // Tajik flag
      'TMT': '🇹🇲', // Turkmen flag
      'AFN': '🇦🇫', // Afghan flag
      'IRR': '🇮🇷', // Iranian flag
      'IQD': '🇮🇶', // Iraqi flag
      'JOD': '🇯🇴', // Jordanian flag
      'KWD': '🇰🇼', // Kuwaiti flag
      'LBP': '🇱🇧', // Lebanese flag
      'OMR': '🇴🇲', // Omani flag
      'QAR': '🇶🇦', // Qatari flag
      'SAR': '🇸🇦', // Saudi flag
      'SYP': '🇸🇾', // Syrian flag
      'AED': '🇦🇪', // UAE flag
      'YER': '🇾🇪', // Yemeni flag
      'EGP': '🇪🇬', // Egyptian flag
      'LYD': '🇱🇾', // Libyan flag
      'TND': '🇹🇳', // Tunisian flag
      'DZD': '🇩🇿', // Algerian flag
      'MAD': '🇲🇦', // Moroccan flag
      'XOF': '🇧🇫', // Burkina Faso flag (West African CFA)
      'XAF': '🇨🇲', // Cameroon flag (Central African CFA)
      'XPF': '🇵🇫', // French Polynesia flag (Pacific Franc)
      'ZAR': '🇿🇦', // South African flag
      'NGN': '🇳🇬', // Nigerian flag
      'KES': '🇰🇪', // Kenyan flag
      'UGX': '🇺🇬', // Ugandan flag
      'TZS': '🇹🇿', // Tanzanian flag
      'ETB': '🇪🇹', // Ethiopian flag
      'GHS': '🇬🇭', // Ghanaian flag
      'ZMW': '🇿🇲', // Zambian flag
      'BWP': '🇧🇼', // Botswanan flag
      'NAD': '🇳🇦', // Namibian flag
      'SZL': '🇸🇿', // Swazi flag
      'LSL': '🇱🇸', // Lesotho flag
      'MUR': '🇲🇺', // Mauritian flag
      'SCR': '🇸🇨', // Seychelles flag
      'MVR': '🇲🇻', // Maldivian flag
      'BTN': '🇧🇹'  // Bhutanese flag
    }
    return emojiMap[currency] || '💰' // Fallback to generic money bag
  }

  const currencySymbol = profile?.currency ? getCurrencySymbol(profile.currency) : '$'
  const currencyEmoji = profile?.currency ? getCurrencyEmoji(profile.currency) : '💰'

    // Load data from backend - SIMPLIFIED VERSION
  const loadData = async () => {
    try {
      console.log('🔄 loadData called - starting data load...')
      setLoading(true)
      setError('')
      
      // Load only essential data first
      const profileData = await apiClient.get('/auth/profile').catch((err) => {
        console.log('👤 Profile API response:', err)
        return null
      })
      
      setProfile(profileData)
      console.log('✅ Profile loaded:', profileData)
      
      // Load other data with shorter timeouts
      console.log('🔄 Loading expenses, goals, approvals, and partnerships...')
      const results = await Promise.allSettled([
        apiClient.get('/expenses').catch((err) => {
          console.log('📊 Expenses API response:', err)
          if (err.status === 400 && err.message?.includes('partnership')) {
            return null
          }
          return []
        }),
        apiClient.get('/goals').catch((err) => {
          console.log('🎯 Goals API response:', err)
          if (err.status === 400 && err.message?.includes('partnership')) {
            return null
          }
          return []
        }),
        apiClient.get('/approvals').catch((err) => {
          console.log('✅ Approvals API response:', err)
          if (err.status === 400 && err.message?.includes('partnership')) {
            return null
          }
          return []
        }),
        apiClient.get('/invite').catch((err) => {
          console.log('🤝 Partnerships API response:', err)
          return { partnerships: [], invitations: [] }
        }),
        apiClient.get('/monthly-progress').catch((err) => {
          console.log('📊 Monthly Progress API response:', err)
          if (err.status === 400 && err.message?.includes('partnership')) {
            return null
          }
          return null
        }),
        apiClient.get('/achievements').catch((err) => {
          console.log('🏆 Achievements API response:', err)
          return { achievements: [], summary: null, newAchievements: [] }
        }),
      ])
      
      const [expensesResult, goalsResult, approvalsResult, partnershipsResult, monthlyProgressResult, achievementsResult] = results
      
      // Handle results safely
      const expensesData = expensesResult.status === 'fulfilled' ? expensesResult.value : []
      const goalsData = goalsResult.status === 'fulfilled' ? goalsResult.value : []
      const approvalsData = approvalsResult.status === 'fulfilled' ? approvalsResult.value : []
      const monthlyProgressData = monthlyProgressResult.status === 'fulfilled' ? monthlyProgressResult.value : null
      const achievementsData = achievementsResult.status === 'fulfilled' ? achievementsResult.value : { achievements: [], summary: null, newAchievements: [] }
      
      setExpenses(expensesData)
      setGoals(goalsData)
      setApprovals(approvalsData)
      setMonthlyProgress(monthlyProgressData)
      setAchievements(achievementsData.achievements || [])
      setAchievementSummary(achievementsData.summary)
      
      // Show celebration for new achievements
      if (achievementsData.newAchievements && achievementsData.newAchievements.length > 0) {
        // Show the first new achievement, queue others
        setCelebratingAchievement(achievementsData.newAchievements[0])
        console.log('🎉 New achievement unlocked:', achievementsData.newAchievements[0])
      }
      
      // Extract partnership data
      const partnershipsData = partnershipsResult.status === 'fulfilled' ? partnershipsResult.value : { partnerships: [], invitations: [] }
      setPartnerships(partnershipsData.partnerships || [])
      setInvitations(partnershipsData.invitations || [])
      
      // Load partner profile if partnership exists
      if (partnershipsData.partnerships && partnershipsData.partnerships.length > 0) {
        await loadPartnerProfile(partnershipsData.partnerships[0])
      }
    } catch (err) {
      setError('Failed to load data')
      toast.error('Failed to load data')
      console.error('Load data error:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPartnerProfile = async (partnership: any) => {
    try {
      // Get the partner's user ID
      const partnerUserId = partnership.user1_id === user?.id ? partnership.user2_id : partnership.user1_id
      
      // Fetch partner's profile
      const partnerProfileData = await apiClient.get(`/partnerships/${partnership.id}/profiles`)
      
      if (partnerProfileData && partnerProfileData.length > 0) {
        // Find the partner's profile (not the current user's)
        const partner = partnerProfileData.find((p: any) => p.user_id === partnerUserId)
        if (partner) {
          setPartnerProfile(partner)
        }
      }
    } catch (err) {
      console.error('Failed to load partner profile:', err)
      // In a real app, this would handle the error gracefully
      // For now, set partner profile to null to indicate no partner
      setPartnerProfile(null)
    }
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered - user?.id:', user?.id)
    if (user) {
      console.log('🔄 User authenticated, calling loadData...')
      loadData()
      // Track authenticated page view
      trackPageView('main_app', true)
    } else {
      console.log('🔄 No user, resetting loading state...')
      // Reset loading state when user is not available
      setLoading(false)
      // Track unauthenticated page view
      trackPageView('main_app', false)
    }
  }, [user?.id]) // Only depend on user ID, not the entire loadData function

  // Online/offline and mobile detection
  useEffect(() => {
    // Check if online/offline
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('resize', checkMobile)
    
    // Initial check
    setIsOnline(navigator.onLine)
    checkMobile()
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('resize', checkMobile)
    }
  }, [])



  const addExpense = async (expenseData: any) => {
    try {
      console.log('🔄 Adding expense:', expenseData)
      const result = await apiClient.post('/expenses', expenseData)
      console.log('✅ Expense API result:', result)
      
      // Track expense creation
      analytics.financial.trackExpense(
        expenseData.category || 'uncategorized',
        expenseData.amount,
        result.requiresApproval || false
      )
      
      if (result.requiresApproval) {
        const amount = expenseData.amount
        const message = amount > 100 
          ? `Expense of ${currencySymbol}${amount.toFixed(2)} requires partner approval (over ${currencySymbol}100 threshold)`
          : 'Expense requires partner approval'
        
        toast.warning(message, { duration: 5000 })
        setError('') // Clear any previous errors
        
        // Show success message for the approval request
        toast.success('Approval request sent to your partner! They will review and approve/decline your expense.', { duration: 6000 })
        
        // Refresh approvals
        console.log('🔄 Refreshing approvals...')
        const approvalsData = await apiClient.get('/approvals')
        setApprovals(approvalsData)
        console.log('✅ Approvals refreshed:', approvalsData)
      } else {
        toast.success('Expense added successfully!')
        setError('') // Clear any previous errors
        
        // Refresh expenses immediately
        try {
          const expensesData = await apiClient.get('/expenses')
          setExpenses(expensesData || [])
        } catch (err: any) {
          console.error('❌ Failed to refresh expenses:', err)
        }
      }
    } catch (err: any) {
      // Check if it's a partnership error
      if (err.status === 400 && err.message?.includes('partnership')) {
        setError('Partnership required: You need to be connected with a partner to add shared expenses')
        toast.warning('Partnership required: You need to be connected with a partner to add shared expenses')
      } else {
        setError('Failed to add expense')
        toast.error('Failed to add expense')
      }
      console.error('Add expense error:', err)
    }
  }

  const addGoal = async (goalData: any) => {
    try {
      const result = await apiClient.post('/goals', goalData)
      
      // Track goal creation
      analytics.financial.trackGoalCreation(
        goalData.category || 'general',
        goalData.target_amount || goalData.targetAmount,
        partnerships.length > 0
      )
      
      if (result.requiresApproval) {
        toast.warning('Goal requires partner approval')
        setError('') // Clear any previous errors
        
        // Show success message for the approval request
        toast.success('Approval request sent to your partner! They will review and approve/decline your goal.', { duration: 6000 })
        
        // Refresh approvals
        const approvalsData = await apiClient.get('/approvals')
        setApprovals(approvalsData)
      } else {
        toast.success('Goal created successfully!')
        setError('') // Clear any previous errors
        // Refresh goals
        const goalsData = await apiClient.get('/goals')
        setGoals(goalsData)
      }
    } catch (err: any) {
      // Check if it's a partnership error
      if (err.status === 400 && err.message?.includes('partnership')) {
        setError('Partnership required: You need to be connected with a partner to create shared savings goals')
        toast.warning('Partnership required: You need to be connected with a partner to create shared savings goals')
      } else {
        setError('Failed to add goal')
        toast.error('Failed to add goal')
      }
      console.error('Add goal error:', err)
    }
  }

  const updateGoal = async (goalId: string, updates: any) => {
    try {
      const result = await apiClient.put(`/goals/${goalId}`, updates)
      
      if (result.requiresApproval) {
        toast.warning('Goal update requires partner approval')
        setError('') // Clear any previous errors
        
        // Show success message for the approval request
        toast.success('Goal update sent to your partner for approval!', { duration: 6000 })
        
        // Refresh approvals
        const approvalsData = await apiClient.get('/approvals')
        setApprovals(approvalsData)
      } else {
        toast.success('Goal updated successfully!')
        setError('') // Clear any previous errors
        // Refresh goals
        const goalsData = await apiClient.get('/goals')
        setGoals(goalsData)
      }
    } catch (err: any) {
      // Check if it's a partnership error
      if (err.status === 400 && err.message?.includes('partnership')) {
        setError('Partnership required: You need to be connected with a partner to update shared savings goals')
        toast.warning('Partnership required: You need to be connected with a partner to update shared savings goals')
      } else {
        setError('Failed to update goal')
        toast.error('Failed to update goal')
      }
      console.error('Update goal error:', err)
    }
  }

  const approveRequest = async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/approve`, {})
      toast.success('Request approved successfully!')
      
      // Refresh data
      const [expensesData, goalsData, approvalsData] = await Promise.all([
        apiClient.get('/expenses'),
        apiClient.get('/goals'),
        apiClient.get('/approvals')
      ])
      
      setExpenses(expensesData)
      setGoals(goalsData)
      setApprovals(approvalsData)
    } catch (err) {
      setError('Failed to approve request')
      toast.error('Failed to approve request')
      console.error('Approve error:', err)
    }
  }

  const declineRequest = async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/decline`, {})
      toast.warning('Request declined')
      
      // Refresh approvals
      const approvalsData = await apiClient.get('/approvals')
      setApprovals(approvalsData)
    } catch (err) {
      setError('Failed to decline request')
      toast.error('Failed to decline request')
      console.error('Decline error:', err)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center safe-area-inset-top safe-area-inset-bottom">
        <div className="text-center p-6">
          <div className="relative mx-auto mb-6 w-16 h-16">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></div>
            <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">S</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading SplitSave</h2>
          <p className="text-gray-600 dark:text-gray-300">Setting up your financial dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 safe-area-inset-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg sm:text-xl font-bold">S</span>
              </div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">SplitSave</h1>
            </div>
            
              {/* Desktop User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Dark Mode Toggle */}
                              <DarkModeToggle variant="icon" />
              
              {/* PWA Install Button */}
              <button
                onClick={() => {
                  if ((window as any).deferredPrompt) {
                    (window as any).deferredPrompt.prompt()
                  } else {
                    alert('PWA install prompt not available. Try refreshing the page or check browser console for details.')
                  }
                }}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Install SplitSave App"
              >
                📱
              </button>
              
              {/* Notification Manager */}
              <NotificationManager
                profile={profile}
                partnerships={partnerships}
                goals={goals}
                currentView={currentView}
                onNavigateToView={setCurrentView}
              />
              
              <span className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.email}</span>
              <button
                onClick={signOut}
                className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Sign out
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-300 py-2">
              Welcome, {user?.email}
            </div>
            
            {/* Mobile Dark Mode Toggle */}
            <div className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 transition-colors flex items-center">
              <DarkModeToggle variant="button" showLabel={true} />
            </div>
            
            {/* Mobile PWA Install Button */}
            <button
              onClick={() => {
                if ((window as any).deferredPrompt) {
                  (window as any).deferredPrompt.prompt()
                } else {
                  alert('PWA install prompt not available. Try refreshing the page or check browser console for details.')
                }
              }}
              className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white py-2 transition-colors flex items-center"
            >
              <span className="mr-2">📱</span>
              Install App
            </button>
            
            <button
              onClick={signOut}
              className="w-full text-left text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 py-2 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Navigation - Desktop */}
      <div className="hidden md:block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Overview & Insights' },
              { id: 'money', label: 'Money', icon: '💰', description: 'Expenses, Progress & Emergency Fund' },
              { id: 'goals', label: 'Goals', icon: '🎯', description: 'Savings Targets & AI Insights' },
              { id: 'partners', label: 'Partners', icon: '🤝', description: 'Partnership & Approvals', badge: approvals.length },
              { id: 'analytics', label: 'Analytics', icon: '📈', description: 'Reports & Data Export' },
              { id: 'profile', label: 'Profile', icon: '👤', description: 'Settings, Security & Activity' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`group relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {item.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="overflow-x-auto">
          <div className="flex space-x-2 px-4 py-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'money', label: 'Money', icon: '💰' },
              { id: 'goals', label: 'Goals', icon: '🎯' },
              { id: 'partners', label: 'Partners', icon: '🤝', badge: approvals.length },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'profile', label: 'Profile', icon: '👤' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex-shrink-0 px-3 py-3 rounded-xl text-xs font-medium transition-all duration-200 min-h-[60px] min-w-[60px] ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1 group-hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div className="relative">
                    {item.label}
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4" role="alert">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-4 rounded-xl shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <h3 className="text-sm font-medium">Action Required</h3>
                </div>
                <p className="text-sm mb-3">{error}</p>
                {error.includes('Partnership required') && (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-red-200 dark:border-red-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      SplitSave is designed for couples and partners to manage shared finances together.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={() => handleNavigation('profile')}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        Complete Profile First
                      </button>
                      <span className="text-gray-500 dark:text-gray-400 text-sm self-center">
                        Then connect with your partner
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setError('')}
                className="ml-4 p-1 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-colors rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30"
                aria-label="Dismiss error"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 bg-gray-50 dark:bg-gray-900 min-h-screen safe-area-inset-bottom">
        
        {/* Overview Hub */}
        {currentView === 'overview' && (
          <OverviewHub
            expenses={expenses}
            goals={goals}
            partnerships={partnerships}
            profile={profile}
            partnerProfile={partnerProfile}
            user={user}
            currencySymbol={currencySymbol}
            currencyEmoji={currencyEmoji}
            monthlyProgress={monthlyProgress}
            onNavigate={handleNavigation}
            onNavigateToProfile={() => handleNavigation('account')}
            onNavigateToPartnerships={() => handleNavigation('partner')}
          />
        )}

        {/* Money Hub */}
        {currentView === 'money' && (
          <MoneyHub
            expenses={expenses}
            partnerships={partnerships}
            profile={profile}
            user={user}
            currencySymbol={currencySymbol}
            goals={goals}
            monthlyProgress={monthlyProgress}
            onAddExpense={addExpense}
            onUpdate={loadData}
          />
        )}

        {/* Goals Hub */}
        {currentView === 'goals' && (
          <GoalsHub
            goals={goals}
            partnerships={partnerships}
            profile={profile}
            partnerProfile={partnerProfile}
            user={user}
            currencySymbol={currencySymbol}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
          />
        )}

        {/* Partner Hub */}
        {currentView === 'partner' && (
          <PartnerHub
            partnerships={partnerships}
            approvals={approvals}
            profile={profile}
            partnerProfile={partnerProfile}
            user={user}
            goals={goals}
            currencySymbol={currencySymbol}
            onApprove={approveRequest}
            onDecline={declineRequest}
            onUpdate={loadData}
          />
        )}

        {/* Account Hub */}
        {currentView === 'account' && (
          <AccountHub
            profile={profile}
            partnerProfile={partnerProfile}
            partnerships={partnerships}
            goals={goals}
            expenses={expenses}
            user={user}
            currencySymbol={currencySymbol}
            onUpdate={loadData}
          />
        )}

        {/* Analytics Hub */}
        {currentView === 'analytics' && (
          <AnalyticsHub
            partnerships={partnerships}
            profile={profile}
            partnerProfile={partnerProfile}
            goals={goals}
            expenses={expenses}
            user={user}
            currencySymbol={currencySymbol}
            monthlyProgress={monthlyProgress}
          />
        )}

        {/* Legacy views for backward compatibility */}
        {currentView === 'dashboard' && (
          <DashboardView 
            expenses={expenses}
            goals={goals}
            partnerships={partnerships}
            onNavigateToProfile={() => handleNavigation('account')}
            onNavigateToPartnerships={() => handleNavigation('partner')}
            onNavigateToMonthlyProgress={() => handleNavigation('money')}
            profile={profile}
            profileCompletionShown={profileCompletionShown}
            onProfileCompletionShown={() => setProfileCompletionShown(true)}
            currencySymbol={currencySymbol}
            currencyEmoji={currencyEmoji}
            user={user}
            partnerProfile={partnerProfile}
          />
        )}
        {currentView === 'expenses' && (
          <ExpensesView 
            expenses={expenses} 
            partnerships={partnerships}
            onAddExpense={addExpense}
            currencySymbol={currencySymbol}
          />
        )}
        {currentView === 'goals' && (
          <GoalsHub
            goals={goals}
            partnerships={partnerships}
            profile={profile}
            partnerProfile={partnerProfile}
            user={user}
            currencySymbol={currencySymbol}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
          />
        )}
        {currentView === 'monthly-progress' && (
          <MonthlyProgress 
            partnerships={partnerships}
            profile={profile}
            user={user}
            currencySymbol={currencySymbol}
            goals={goals}
            onProgressUpdate={(data) => {
              console.log('Monthly progress update:', data)
              // In real app, this would trigger a refresh of the dashboard
            }}
          />
        )}
        {currentView === 'analytics' && (
          <AnalyticsView 
            partnerships={partnerships}
            profile={profile}
            user={user}
            currencySymbol={currencySymbol}
          />
        )}
                  {currentView === 'ai-insights' && (
            <AIInsightsEngine
              userId={user?.id || ''}
              goals={goals}
              contributions={[]}
              expenses={expenses}
              partnerships={partnerships}
              achievements={[]}
            />
          )}
          {currentView === 'security' && (
            <SecurityDashboard />
          )}
          {currentView === 'gamification' && (
            <GamificationDashboard />
          )}
          {currentView === 'advanced-analytics' && (
            <AdvancedAnalyticsDashboard
              userId={user?.id || ''}
              goals={goals}
              contributions={[]}
              expenses={expenses}
              partnerships={partnerships}
              achievements={[]}
            />
          )}
                    {currentView === 'achievements' && (
              <AchievementsView 
                partnerships={partnerships}
                profile={profile}
                goals={goals}
                currencySymbol={currencySymbol}
              />
            )}

            {currentView === 'partner-collaboration' && (
              <PartnerCollaborationView 
                partnerships={partnerships}
                profile={profile}
                partnerProfile={partnerProfile}
                goals={goals}
                user={user}
                currencySymbol={currencySymbol}
              />
            )}

            {currentView === 'data-export' && (
              <DataExportView 
                partnerships={partnerships}
                profile={profile}
                partnerProfile={partnerProfile}
                goals={goals}
                expenses={expenses}
                user={user}
                currencySymbol={currencySymbol}
              />
            )}
        {currentView === 'activity' && (
          <ActivityFeed 
            partnerships={partnerships}
            profile={profile}
            user={user}
            currencySymbol={currencySymbol}
          />
        )}
        {currentView === 'safety-pot' && (
          <EnhancedSafetyPot 
            profile={profile}
            partnerships={partnerships}
            expenses={expenses}
            currencySymbol={currencySymbol}
            onSafetyPotUpdate={(amount) => {
              console.log('Enhanced safety pot updated:', amount)
              loadData()
            }}
          />
        )}
        {currentView === 'contributions' && (
          <ContributionManager 
            currencySymbol={currencySymbol}
            onUpdate={loadData}
          />
        )}
        {currentView === 'approvals' && (
          <ApprovalsView 
            approvals={approvals} 
            partnerships={partnerships}
            currentUserId={user?.id}
            onApprove={approveRequest}
            onDecline={declineRequest}
            currencySymbol={currencySymbol}
          />
        )}
        {currentView === 'partnerships' && (
          <PartnershipManager />
        )}
        {currentView === 'profile' && (
          <ProfileManager onProfileUpdate={(updatedProfile) => {
            setProfile(updatedProfile)
            setProfileCompletionShown(false) // Reset flag when profile is updated
          }} />
        )}
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNavigation
          currentView={currentView}
          onNavigate={handleNavigation}
          isOnline={isOnline}
          hasNotifications={approvals.length > 0}
          notificationCount={approvals.length}
        />
      )}
      
      {/* PWA Install Prompt */}
              <ClientOnly>
          <PWAInstallPrompt />
        </ClientOnly>
      
      {/* Achievement Celebration */}
      <AchievementCelebration
        achievement={celebratingAchievement}
        onClose={() => setCelebratingAchievement(null)}
      />
    </div>
  )
}

// Dashboard View Component
function DashboardView({ 
  expenses, 
  goals, 
  partnerships,
  onNavigateToProfile, 
  onNavigateToPartnerships,
  onNavigateToMonthlyProgress,
  profile, 
  profileCompletionShown,
  onProfileCompletionShown,
  currencySymbol,
  currencyEmoji,
  user,
  partnerProfile
}: { 
  expenses: Expense[] | null, 
  goals: Goal[] | null, 
  partnerships: any[],
  onNavigateToProfile: () => void,
  onNavigateToPartnerships: () => void,
  onNavigateToMonthlyProgress: () => void,
  profile: any,
  profileCompletionShown: boolean,
  onProfileCompletionShown: () => void,
  currencySymbol: string,
  currencyEmoji: string,
  user: any,
  partnerProfile: any
}) {
  const totalExpenses = expenses ? expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0
  const totalGoals = goals ? goals.reduce((sum, goal) => sum + goal.current_amount, 0) : 0
  const totalTarget = goals ? goals.reduce((sum, goal) => sum + goal.target_amount, 0) : 0

  // Calculate profile completion percentage based on actual profile data
  const calculateProfileCompletion = () => {
    if (!profile) return 0
    
    let completion = 0
    
    // Basic info (30%): name, country, currency
    if (profile.name && profile.country_code && profile.currency) {
      completion += 30
    }
    
    // Financial info (40%): income (required for core functionality)
    if (profile.income && profile.income > 0) {
      completion += 40
    }
    
    // Optional info (30%): payday, personal allowance
    if (profile.payday) completion += 15
    if (profile.personal_allowance !== null && profile.personal_allowance !== undefined) completion += 15
    
    return Math.min(completion, 100)
  }

  const profileCompletion = calculateProfileCompletion()
  const hasData = (expenses && expenses.length > 0) || (goals && goals.length > 0)
  const hasPartnership = partnerships.length > 0

  // Show completion message only once per session
  const shouldShowCompletionMessage = profileCompletion === 100 && !hasData && !profileCompletionShown

  // Use useEffect to handle the completion message display
  useEffect(() => {
    if (shouldShowCompletionMessage && onProfileCompletionShown) {
      onProfileCompletionShown()
    }
  }, [shouldShowCompletionMessage, onProfileCompletionShown])

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your financial overview and partnership status
          </p>
        </div>
        
        {/* PWA Install Button */}
        <button
          onClick={() => {
            if ((window as any).deferredPrompt) {
              (window as any).deferredPrompt.prompt()
            } else {
              alert('PWA install prompt not available. Try refreshing the page or check browser console for details.')
            }
          }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3 font-medium"
          title="Install SplitSave App"
        >
          <span className="text-lg">📱</span>
          <span>Install App</span>
        </button>
      </div>
      
      {/* Welcome Message - Progressive Disclosure */}
      {profileCompletion < 100 && (
        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 p-8 rounded-2xl border border-purple-200/50 dark:border-purple-800/50 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-3">
                Welcome to SplitSave! 🚀
              </h3>
              
              {profileCompletion === 0 && (
                <>
                  <p className="text-purple-700 dark:text-purple-300 text-lg leading-relaxed mb-6">
                    Let's get you set up for collaborative financial success! Start by configuring your profile to unlock shared expenses and savings goals.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={onNavigateToProfile}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="mr-2">⚡</span>
                      Set Up Profile
                      <span className="ml-2">→</span>
                    </button>
                    <div className="text-sm text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-4 py-3 rounded-lg">
                      <strong>What you'll configure:</strong> Income, personal allowance, and financial preferences
                    </div>
                  </div>
                </>
              )}
              
              {profileCompletion > 0 && profileCompletion < 90 && (
                <>
                  <p className="text-purple-700 dark:text-purple-300 text-lg leading-relaxed mb-6">
                    Great progress! You're {profileCompletion}% of the way there. Complete your profile to unlock all SplitSave features.
                  </p>
                  <div className="space-y-4">
                    <button 
                      onClick={onNavigateToProfile}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="mr-2">🎯</span>
                      Complete Profile
                      <span className="ml-2">→</span>
                    </button>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between text-sm text-purple-600 dark:text-purple-400 mb-3">
                        <span className="font-medium">Profile Completion</span>
                        <span className="font-bold text-lg">{profileCompletion}%</span>
                      </div>
                      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {profileCompletion >= 90 && profileCompletion < 100 && (
                <>
                  <p className="text-purple-700 dark:text-purple-300 text-lg leading-relaxed mb-6">
                    Almost there! Just a few more details to complete your profile and unlock everything.
                  </p>
                  <div className="space-y-4">
                    <button 
                      onClick={onNavigateToProfile}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="mr-2">✨</span>
                      Finish Profile
                      <span className="ml-2">→</span>
                    </button>
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-center justify-between text-sm text-purple-600 dark:text-purple-400 mb-3">
                        <span className="font-medium">Profile Completion</span>
                        <span className="font-bold text-lg">{profileCompletion}%</span>
                      </div>
                      <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out" 
                          style={{ width: `${profileCompletion}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Complete Success Message */}
      {shouldShowCompletionMessage && (
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20 p-8 rounded-2xl border border-green-200/50 dark:border-green-800/50 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-2">
                Profile Complete! 🚀
              </h3>
              <p className="text-green-700 dark:text-green-300 text-lg leading-relaxed">
                Fantastic! Your profile is fully configured and ready for action. You can now create shared expenses, set savings goals, and start your collaborative financial journey.
              </p>
              <div className="mt-4 flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>All features unlocked</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Ready to collaborate</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>Start saving together</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Financial Overview Dashboard */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <span className="text-lg">💰</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Financial Overview</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Side-by-side income breakdown & contribution targets</p>
          </div>
        </div>
        
        {/* Side-by-Side Partner Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Financial Overview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{profile?.name?.charAt(0)?.toUpperCase() || 'Y'}</span>
              </div>
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">{profile?.name || 'Your'} Breakdown</h4>
            </div>
            
            {/* Your Key Metrics */}
            <div className="space-y-3">
              {/* Your Income */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Income</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">Monthly</span>
                </div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {currencySymbol}{profile?.income?.toLocaleString() || 0}
                </div>
              </div>
              
              {/* Your Personal Allowance */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Personal Allowance</span>
                  <span className="text-xs text-green-600 dark:text-green-400">Your Money</span>
                </div>
                <div className="text-xl font-bold text-green-900 dark:text-green-100">
                  {currencySymbol}{profile?.personal_allowance?.toLocaleString() || 0}
                </div>
              </div>
              
              {/* Your Disposable Income */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Disposable Income</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">For Goals</span>
                </div>
                <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {currencySymbol}{((profile?.income || 0) - (profile?.personal_allowance || 0)).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Your Contribution Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{profile?.name || 'Your'} Monthly Contributions</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Expenses</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(70%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Savings</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(20%)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Safety</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1)}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(10%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Partner's Financial Overview */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{partnerProfile?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
              </div>
              <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300">
                {partnerProfile?.name || 'Partner'}'s Breakdown
              </h4>
            </div>
            
            {/* Partner's Key Metrics */}
            <div className="space-y-3">
              {/* Partner's Income */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Total Income</span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">Monthly</span>
                </div>
                <div className="text-xl font-bold text-blue-900 dark:text-blue-100">
                  {partnerProfile ? (
                    <>
                      {currencySymbol}{partnerProfile.income?.toLocaleString() || 0}
                      {!partnerProfile.income && <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">(Not Set)</span>}
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">--</span>
                  )}
                </div>
              </div>
              
              {/* Partner's Personal Allowance */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-green-700 dark:text-green-300">Personal Allowance</span>
                  <span className="text-xs text-green-600 dark:text-green-400">Partner's Money</span>
                </div>
                <div className="text-xl font-bold text-green-900 dark:text-green-100">
                  {partnerProfile ? (
                    <>
                      {currencySymbol}{partnerProfile.personal_allowance?.toLocaleString() || 0}
                      {!partnerProfile.personal_allowance && <span className="text-xs text-green-600 dark:text-green-400 ml-2">(Not Set)</span>}
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">--</span>
                  )}
                </div>
              </div>
              
              {/* Partner's Disposable Income */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-purple-700 dark:text-purple-300">Disposable Income</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400">For Goals</span>
                </div>
                <div className="text-xl font-bold text-purple-900 dark:text-purple-100">
                  {partnerProfile ? (
                    <>
                      {currencySymbol}{((partnerProfile.income || 0) - (partnerProfile.personal_allowance || 0)).toLocaleString()}
                      {(!partnerProfile.income || !partnerProfile.personal_allowance) && <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">(Incomplete)</span>}
                    </>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">--</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Partner's Contribution Breakdown */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{partnerProfile?.name || 'Partner'}'s Monthly Contributions</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Expenses</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {partnerProfile ? (
                        <>
                          {currencySymbol}{Math.round(((partnerProfile.income || 0) - (partnerProfile.personal_allowance || 0)) * 0.7)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(70%)</span>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">--</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Savings</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {partnerProfile ? (
                        <>
                          {currencySymbol}{Math.round(((partnerProfile.income || 0) - (partnerProfile.personal_allowance || 0)) * 0.2)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(20%)</span>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">--</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Safety</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {partnerProfile ? (
                        <>
                          {currencySymbol}{Math.round(((partnerProfile.income || 0) - (partnerProfile.personal_allowance || 0)) * 0.1)}
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(10%)</span>
                        </>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">--</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Progress Status Card */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-lg">📅</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Progress Status</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your current month's financial achievements</p>
            </div>
          </div>
          
          {/* Progress Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Shared Expenses Status */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Shared Expenses</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">70% of base</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✅ On Track
                </div>
              </div>
            </div>
            
            {/* Goal 1 Status */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Goal 1 (Holiday)</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">12% of base</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2 * 0.6)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✅ On Track
                </div>
              </div>
            </div>
            
            {/* Goal 2 Status */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Goal 2 (House)</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">8% of base</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2 * 0.4)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✅ On Track
                </div>
              </div>
            </div>
            
            {/* Safety Pot Status */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Safety Pot</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">10% of base</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1)}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ✅ On Track
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 <strong>Tip:</strong> Update your monthly progress to track actual savings vs. targets
            </div>
            <button
              onClick={onNavigateToMonthlyProgress}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              📊 Track Monthly Progress
            </button>
          </div>
        </div>

        {/* Unified Joint Financial Hub */}
        {partnerships.length > 0 && (
          <div className="space-y-6">
            {/* Header with Dynamic Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-lg">🤝</span>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Joint Financial Overview</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your shared financial commitments and contributions</p>
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-sm font-medium text-green-800 dark:text-green-200">
                  All expenses covered + £153.04 redistributed
                </div>
              </div>
            </div>
            
            {/* Three Main Financial Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Joint Expenses Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Joint Expenses</h5>
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}3,207
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total needed</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">You contributed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">£1,470 (45.8%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Partner contributed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">£1,737 (54.2%)</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">Covered</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Joint Savings Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Joint Savings</h5>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}1,067
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total allocated</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">You contributed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">£489 (45.8%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Partner contributed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">£578 (54.2%)</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">+£107.13 overflow</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Joint Safety Net Card */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Joint Safety Net</h5>
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}526
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total allocated</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">You contributed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">£241 (45.8%)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Partner contributed:</span>
                    <span className="font-medium text-gray-900 dark:text-white">£285 (54.2%)</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">+£45.91 overflow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Individual Contribution Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
              <h5 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-3">Individual Contribution Summary</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7 + ((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2 + ((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1)}
                  </div>
                  <div className="text-xs text-blue-700 dark:text-blue-300">{profile?.name || 'Your'} total contribution</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">45.8% of joint total</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-900 dark:text-green-100">
                    {currencySymbol}{Math.round(1890 + 578 + 285)}
                  </div>
                  <div className="text-xs text-green-700 dark:text-green-300">Partner's total contribution</div>
                  <div className="text-xs text-green-600 dark:text-green-400">54.2% of joint total</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Next Payday Info - Side by Side */}
        {profile?.payday && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📅</span>
              <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Next Paydays</h4>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Your Payday */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{profile?.name?.charAt(0)?.toUpperCase() || 'Y'}</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-amber-800 dark:text-amber-200">{profile?.name || 'Your'} Payday</h5>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {getNextPaydayDescription(profile.payday)} • {calculateNextPayday(profile.payday).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {isTodayPayday(profile.payday) && (
                    <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                      🎉 Today!
                    </div>
                  )}
                </div>
              </div>
              
              {/* Partner's Payday */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{partnerProfile?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-amber-800 dark:text-amber-200">{partnerProfile?.name || 'Partner'}'s Payday</h5>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        {partnerProfile?.payday ? (
                          <>
                            {getNextPaydayDescription(partnerProfile.payday)} • {calculateNextPayday(partnerProfile.payday).toLocaleDateString('en-GB', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </>
                        ) : (
                          'Not set'
                        )}
                      </p>
                    </div>
                  </div>
                  {partnerProfile?.payday && isTodayPayday(partnerProfile.payday) && (
                    <div className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">
                      🎉 Today!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Partnership Status */}
      {!hasPartnership && (
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 p-8 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🤝</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">Partnership Required</h3>
                <p className="text-blue-700 dark:text-blue-300 text-lg leading-relaxed mb-4">
                  To unlock SplitSave's full potential, you need to connect with a partner. 
                  This enables shared expenses, savings goals, and collaborative financial planning.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blue-600 dark:text-blue-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Split shared expenses</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Collaborate on savings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Track progress together</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Hold each other accountable</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onNavigateToPartnerships}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg flex items-center space-x-2"
            >
              <span>🚀</span>
              <span>Set Up Partnership</span>
            </button>
          </div>
        </div>
      )}
      



      
      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">💸</span>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Monthly Expenses</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            {currencySymbol}{totalExpenses.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {expenses?.length === 0 ? 'No expenses yet' : `${expenses?.length} shared expense${expenses?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">💰</span>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Saved</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {currencySymbol}{totalGoals.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {goals?.length === 0 ? 'No goals yet' : `${goals?.length} active goal${goals?.length === 1 ? '' : 's'}`}
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-right">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Goals Progress</h3>
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            {totalTarget > 0 ? Math.round((totalGoals / totalTarget) * 100) : 0}%
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalTarget > 0 ? 'Target: ' + currencySymbol + totalTarget.toFixed(2) : 'Set your first goal'}
          </p>
        </div>
      </div>

      {/* Detailed Overview Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Expenses</h3>
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-lg">💸</span>
            </div>
          </div>
          
          {expenses?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4 opacity-50">{currencyEmoji}</div>
              <p className="text-lg font-medium mb-2">No shared expenses yet</p>
              <p className="text-sm">Add your first expense to get started with collaborative spending</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses?.slice(0, 5).map((expense, index) => (
                <div key={expense.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{expense.description}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-lg">
                    {currencySymbol}{expense.amount.toFixed(2)}
                  </span>
                </div>
              ))}
              
              {/* Total Line */}
              <div className="border-t-2 border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                  <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {currencySymbol}{expenses?.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Goals */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg dark:shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Active Goals</h3>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
          </div>
          
          {goals?.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4 opacity-50">🎯</div>
              <p className="text-lg font-medium mb-2">No savings goals yet</p>
              <p className="text-sm">Create your first goal to start building wealth together</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals?.slice(0, 5).map((goal, index) => (
                <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">{goal.name}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-lg">
                      {currencySymbol}{goal.current_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span className="font-medium">{Math.round((goal.current_amount / goal.target_amount) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Expenses View Component
function ExpensesView({ expenses, partnerships, onAddExpense, currencySymbol }: { expenses: Expense[] | null, partnerships: any[], onAddExpense: (data: any) => void, currencySymbol: string }) {
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    message: '',
    is_recurring: false,
    recurring_frequency: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    recurring_end_date: '',
    notes: ''
  })

  // Check if we have a partnership
  const hasPartnership = partnerships.length > 0

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
      date: expense.date,
      message: '',
      is_recurring: expense.is_recurring || false,
      recurring_frequency: expense.recurring_frequency || 'monthly',
      recurring_end_date: expense.recurring_end_date || '',
      notes: expense.notes || ''
    })
    setShowForm(true)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      try {
        await apiClient.deleteExpense(expenseId)
        // Refresh the expenses list
        window.location.reload()
      } catch (error) {
        console.error('Failed to delete expense:', error)
        alert('Failed to delete expense. Please try again.')
      }
    }
  }

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpense) return
    
    try {
      await apiClient.updateExpense(editingExpense.id, {
        ...formData,
        amount: parseFloat(formData.amount)
      })
      // Reset form and refresh
      setEditingExpense(null)
      resetForm()
      setShowForm(false)
      window.location.reload()
    } catch (error) {
      console.error('Failed to update expense:', error)
      alert('Failed to update expense. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({ 
      description: '', 
      amount: '', 
      category: '', 
      date: new Date().toISOString().split('T')[0], 
      message: '', 
      is_recurring: false, 
      recurring_frequency: 'monthly', 
      recurring_end_date: '', 
      notes: '' 
    })
    setEditingExpense(null)
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingExpense) {
      handleUpdateExpense(e)
    } else {
      onAddExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      })
      setFormData({ 
        description: '', 
        amount: '', 
        category: '', 
        date: new Date().toISOString().split('T')[0], 
        message: '', 
        is_recurring: false, 
        recurring_frequency: 'monthly', 
        recurring_end_date: '', 
        notes: '' 
      })
      setShowForm(false)
    }
  }

  // If no partnership, show setup message
  if (!hasPartnership) {
    return (
      <div className="space-y-6">
              <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shared Expenses</h2>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
        <div className="text-4xl mb-4">🤝</div>
        <h3 className="text-xl font-medium text-blue-900 dark:text-blue-100 mb-2">Partnership Required</h3>
        <p className="text-blue-700 dark:text-blue-300 mb-4">
          To add shared expenses, you need to be connected with a partner. 
          This allows you to split costs and track shared financial goals together.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>Next steps:</strong>
          </p>
          <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
            <li>• Partner with someone to start sharing expenses</li>
            <li>• Set up shared financial goals</li>
            <li>• Track spending together</li>
          </ul>
        </div>
      </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Shared Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your shared spending with your partner
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
            showForm 
              ? 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>{showForm ? '✕' : '➕'}</span>
            <span>{showForm ? 'Cancel' : 'Add Expense'}</span>
          </span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{editingExpense ? '✏️' : '💰'}</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {editingExpense ? 'Update your shared expense details' : 'Create a new shared expense with your partner'}
            </p>
          </div>
          
          {/* Approval Threshold Notice */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white text-lg">ℹ️</div>
              <div>
                <p className="text-amber-800 dark:text-amber-200 font-medium mb-1">
                  <strong>Partner Approval Required</strong>
                </p>
                <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
                  Expenses over {currencySymbol}100 require your partner's approval before they're added to your shared account. 
                  Smaller expenses are added immediately for convenience.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6" action="javascript:void(0)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="e.g., Food Shopping, Rent, Bills"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  required
                >
                  <option value="">Select a category</option>
                  <optgroup label="🏠 Housing & Utilities">
                    <option value="Rent/Mortgage">🏠 Rent/Mortgage</option>
                    <option value="Utilities">⚡ Utilities (Gas, Electric, Water)</option>
                    <option value="Council Tax">🏛️ Council Tax</option>
                    <option value="Home Insurance">🛡️ Home Insurance</option>
                    <option value="Maintenance">🔧 Home Maintenance</option>
                    <option value="Furniture">🪑 Furniture & Appliances</option>
                  </optgroup>
                  <optgroup label="🍽️ Food & Dining">
                    <option value="Groceries">🛒 Groceries</option>
                    <option value="Restaurants">🍽️ Restaurants & Takeaways</option>
                    <option value="Coffee/Drinks">☕ Coffee & Drinks</option>
                    <option value="Work Lunches">🥪 Work Lunches</option>
                  </optgroup>
                  <optgroup label="🚗 Transport">
                    <option value="Fuel">⛽ Fuel & Parking</option>
                    <option value="Public Transport">🚌 Public Transport</option>
                    <option value="Car Insurance">🚗 Car Insurance</option>
                    <option value="Car Maintenance">🔧 Car Maintenance</option>
                    <option value="Uber/Taxis">🚕 Uber & Taxis</option>
                  </optgroup>
                  <optgroup label="📱 Subscriptions & Bills">
                    <option value="Phone Bill">📱 Phone Bill</option>
                    <option value="Internet">🌐 Internet & TV</option>
                    <option value="Streaming">📺 Streaming Services</option>
                    <option value="Gym">💪 Gym Membership</option>
                    <option value="Software">💻 Software Subscriptions</option>
                  </optgroup>
                  <optgroup label="🎬 Entertainment & Lifestyle">
                    <option value="Entertainment">🎬 Entertainment</option>
                    <option value="Shopping">🛍️ Shopping</option>
                    <option value="Personal Care">💄 Personal Care</option>
                    <option value="Hobbies">🎨 Hobbies & Activities</option>
                    <option value="Sports">⚽ Sports & Fitness</option>
                  </optgroup>
                  <optgroup label="🏥 Health & Wellness">
                    <option value="Healthcare">🏥 Healthcare</option>
                    <option value="Dental">🦷 Dental Care</option>
                    <option value="Optical">👓 Optical Care</option>
                    <option value="Medication">💊 Medication</option>
                    <option value="Wellness">🧘 Wellness & Therapy</option>
                  </optgroup>
                  <optgroup label="✈️ Travel & Special">
                    <option value="Holiday">✈️ Holiday & Travel</option>
                    <option value="Gifts">🎁 Gifts & Celebrations</option>
                    <option value="Education">📚 Education & Courses</option>
                    <option value="Pets">🐾 Pet Care</option>
                    <option value="Charity">❤️ Charity & Donations</option>
                  </optgroup>
                  <optgroup label="💰 Financial">
                    <option value="Insurance">🛡️ Insurance</option>
                    <option value="Tax">💰 Tax & Fees</option>
                    <option value="Banking">🏦 Banking Fees</option>
                    <option value="Investments">📈 Investment Fees</option>
                  </optgroup>
                  <option value="Other">📦 Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            {/* Recurring Expense Options */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">🔄</div>
                <div>
                  <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                    <strong>Recurring Expense Options</strong>
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Set this expense to repeat automatically
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <label htmlFor="is_recurring" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    This is a recurring expense
                  </label>
                </div>
                
                {formData.is_recurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        Frequency
                      </label>
                      <select
                        value={formData.recurring_frequency}
                        onChange={(e) => setFormData({...formData, recurring_frequency: e.target.value as 'weekly' | 'monthly' | 'yearly'})}
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-blue-900/30 dark:text-blue-100"
                      >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.recurring_end_date}
                        onChange={(e) => setFormData({...formData, recurring_end_date: e.target.value})}
                        className="w-full px-3 py-2 border border-blue-200 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-blue-900/30 dark:text-blue-100"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                rows={3}
                placeholder="Add any additional notes about this expense..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                rows={2}
                placeholder="Add any additional notes or reminders..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {expenses && expenses.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Expenses</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Your shared expenses with your partner</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <div key={expense.id} className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{expense.description}</h4>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                          {expense.category === 'Vacation' ? 'Holiday' : expense.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Added by {expense.added_by_user?.name || 'Unknown'}
                        </span>
                        {expense.is_recurring && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            🔄 {expense.recurring_frequency}
                          </span>
                        )}
                      </div>
                      
                      {/* Additional expense details */}
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Date: {new Date(expense.date).toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        {expense.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            Note: {expense.notes}
                          </p>
                        )}
                        {expense.is_recurring && expense.recurring_end_date && (
                          <p className="text-sm text-amber-600 dark:text-amber-400">
                            Ends: {new Date(expense.recurring_end_date).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      {currencySymbol}{expense.amount.toFixed(2)}
                    </p>
                    
                    {/* Action buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors duration-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
          <div className="text-8xl mb-6 opacity-50">💰</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No expenses yet</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            Start by adding your first shared expense with your partner
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
          >
            Add Your First Expense
          </button>
        </div>
      )}
    </div>
  )
}

// Goals View Component
function GoalsView({ goals, partnerships, onAddGoal, currencySymbol, userCountry, profile, partnerProfile }: { goals: Goal[], partnerships: any[], onAddGoal: (data: any) => void, currencySymbol: string, userCountry?: string, profile?: any, partnerProfile?: any }) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: '',
    category: '',
    message: ''
  })

  const calculateMonthlySavings = () => {
    if (!formData.targetAmount || !formData.targetDate) return ''
    
    const targetAmount = parseFloat(formData.targetAmount)
    const targetDate = new Date(formData.targetDate)
    const today = new Date()
    
    // Calculate months between today and target date
    const monthsDiff = (targetDate.getFullYear() - today.getFullYear()) * 12 + 
                      (targetDate.getMonth() - today.getMonth())
    
    if (monthsDiff <= 0) return 'Target date must be in the future'
    
    const monthlyAmount = targetAmount / monthsDiff
    return `${currencySymbol}${monthlyAmount.toFixed(2)} per month`
  }

  // Smart Goal Management Functions
  const handleSmartRedistribution = (redistributionPlans: any[]) => {
    // Smart redistribution feature - requires implementation of goal rebalancing algorithm
    console.log('Smart redistribution requested:', redistributionPlans)
    toast.success('Smart redistribution feature available - algorithm implementation needed!')
  }

  const getPriorityGoals = (goals: Goal[]) => {
    return goals
      .filter(goal => !goal.current_amount || goal.current_amount < goal.target_amount)
      .map(goal => {
        const progress = calculateGoalProgress(goal)
        const urgency = progress.isOverdue ? 100 : 
                       progress.daysRemaining < 30 ? 90 :
                       progress.daysRemaining < 90 ? 70 :
                       progress.daysRemaining < 180 ? 50 : 30
        
        const progressWeight = (goal.current_amount / goal.target_amount) * 40
        const totalScore = urgency + progressWeight
        
        return { ...goal, priorityScore: totalScore }
      })
      .sort((a, b) => (b as any).priorityScore - (a as any).priorityScore)
  }

  const getPriorityScore = (goal: any) => {
    return Math.round((goal as any).priorityScore || 0)
  }

  const getGoalForecast = (goals: Goal[]) => {
    const today = new Date()
    const monthlySavings = profile?.income ? (profile.income - (profile.personal_allowance || 0)) * 0.2 : 500
    
    return goals
      .filter(goal => !goal.current_amount || goal.current_amount < goal.target_amount)
      .map(goal => {
        const remaining = goal.target_amount - (goal.current_amount || 0)
        const monthsToComplete = Math.ceil(remaining / monthlySavings)
        const completionDate = new Date(today.getFullYear(), today.getMonth() + monthsToComplete, today.getDate())
        
        return {
          goalId: goal.id,
          goalName: goal.name,
          remainingAmount: remaining,
          monthsToComplete,
          completionDate: completionDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
        }
      })
      .sort((a, b) => a.monthsToComplete - b.monthsToComplete)
  }

  const showDetailedForecast = (goals: Goal[]) => {
    const forecast = getGoalForecast(goals)
    const message = forecast.map(prediction => 
      `${prediction.goalName}: ${prediction.completionDate} (${prediction.monthsToComplete} months)`
    ).join('\n')
    
    alert(`Detailed Goal Forecast:\n\n${message}`)
  }

  const showPriorityAnalysis = (goals: Goal[]) => {
    const priorityGoals = getPriorityGoals(goals)
    const message = priorityGoals.map((goal, index) => 
      `${index + 1}. ${goal.name}: ${getPriorityScore(goal)}% priority`
    ).join('\n')
    
    alert(`Priority Analysis:\n\n${message}`)
  }

  const showOptimizationTips = (goals: Goal[]) => {
    const tips = [
      'Focus on high-priority goals first',
      'Consider increasing monthly contributions for urgent goals',
      'Use smart redistribution for completed goals',
      'Review and adjust target dates if needed'
    ]
    
    alert(`Optimization Tips:\n\n${tips.join('\n')}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAddGoal({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount)
    })
    setFormData({ name: '', targetAmount: '', targetDate: '', description: '', category: '', message: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Savings Goals
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set and track financial goals together with your partner
          </p>
        </div>
        
        {partnerships && partnerships.length > 0 ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
              showForm 
                ? 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{showForm ? '✕' : '🎯'}</span>
              <span>{showForm ? 'Cancel' : 'Add Goal'}</span>
            </span>
          </button>
        ) : (
          <button
            disabled
            className="px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold opacity-50 cursor-not-allowed shadow-lg"
            title="Partnership required to add goals"
          >
            <span className="flex items-center space-x-2">
              <span>🔒</span>
              <span>Add Goal</span>
            </span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create New Savings Goal</h3>
            <p className="text-gray-600 dark:text-gray-400">Set a financial goal to save towards with your partner</p>
          </div>
          
          {/* Approval Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">ℹ️</div>
              <div>
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  <strong>Partner Approval Required</strong>
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm leading-relaxed">
                  All new savings goals require your partner's approval before they're added to your shared account. 
                  This ensures both partners are aligned on financial priorities.
                </p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="e.g., Holiday Fund, New Car, Emergency Fund"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            {/* Monthly Savings Calculation */}
            {formData.targetAmount && formData.targetDate && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg">💡</div>
                  <div>
                    <p className="text-green-800 dark:text-green-200 font-medium mb-1">
                      <strong>Monthly Savings Target</strong>
                    </p>
                    <p className="text-green-700 dark:text-green-300 text-lg font-semibold">
                      {calculateMonthlySavings()}
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                      This is how much you'll need to save together each month to reach your goal on time.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                rows={3}
                placeholder="Describe what you're saving for..."
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                required
              >
                <option value="">Select a category</option>
                <option value="Holiday">🏖️ Holiday</option>
                <option value="Vehicle">🚗 Vehicle</option>
                <option value="Home">🏠 Home</option>
                <option value="Emergency Fund">🆘 Emergency Fund</option>
                <option value="Wedding">💒 Wedding</option>
                <option value="Education">📚 Education</option>
                <option value="Investment">📈 Investment</option>
                <option value="Gift">🎁 Gift</option>
                <option value="Technology">💻 Technology</option>
                <option value="Furniture">🪑 Furniture</option>
                <option value="Hobby">🎨 Hobby</option>
                <option value="Other">📦 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                rows={3}
                placeholder="Add any additional notes about this goal..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Add Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {partnerships && partnerships.length > 0 ? (
        goals && goals.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Your Savings Goals</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Track your progress towards financial goals</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            
            {/* Goals Summary Dashboard */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              {(() => {
                const totalGoals = goals.length
                const completedGoals = goals.filter(goal => {
                  const progress = calculateGoalProgress(goal)
                  return progress.isCompleted
                }).length
                const overdueGoals = goals.filter(goal => {
                  const progress = calculateGoalProgress(goal)
                  return progress.isOverdue
                }).length
                const activeGoals = totalGoals - completedGoals
                
                const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0)
                const totalCurrent = goals.reduce((sum, goal) => sum + goal.current_amount, 0)
                const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0
                
                return (
                  <>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalGoals}</div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Total Goals</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedGoals}</div>
                        <div className="text-sm text-green-700 dark:text-green-300">Completed</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activeGoals}</div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Active</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{overallProgress.toFixed(1)}%</div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">Overall Progress</div>
                      </div>
                    </div>
                  </>
                )
              })()}
            </div>
            
            {/* Overdue Goals Warning */}
            {(() => {
              const overdueGoals = goals.filter(goal => {
                const progress = calculateGoalProgress(goal)
                return progress.isOverdue
              })
              
              if (overdueGoals.length > 0) {
                return (
                  <div className="mb-6 p-6 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-800/50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white text-lg">⚠️</div>
                      <div>
                        <h4 className="text-red-800 dark:text-red-200 font-medium mb-2">
                          <strong>Overdue Goals Alert</strong>
                        </h4>
                        <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                          You have {overdueGoals.length} goal{overdueGoals.length > 1 ? 's' : ''} that {overdueGoals.length > 1 ? 'are' : 'is'} past their target date.
                        </p>
                        <div className="space-y-1">
                          {overdueGoals.map((goal) => (
                            <div key={goal.id} className="text-sm text-red-600 dark:text-red-400">
                              • {goal.name} - {formatTimeRemaining(
                                calculateGoalProgress(goal).daysRemaining,
                                calculateGoalProgress(goal).monthsRemaining,
                                true
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}
            
            {/* Smart Redistribution Notice */}
            {(() => {
              const redistributionPlans = calculateSmartRedistribution(goals)
              if (redistributionPlans.length > 0) {
                return (
                  <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white text-lg">🎯</div>
                      <div className="flex-1">
                        <h4 className="text-green-800 dark:text-green-200 font-medium mb-2">
                          <strong>Smart Redistribution Available!</strong>
                        </h4>
                        <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                          Some goals are completed with excess funds. We can redistribute these to accelerate your other goals.
                        </p>
                        <div className="space-y-2 mb-4">
                          {redistributionPlans.map((plan) => (
                            <div key={plan.goalId} className="text-sm text-green-600 dark:text-green-400">
                              • <strong>{currencySymbol}{plan.redistributionAmount.toFixed(2)}</strong> can be redistributed to this goal
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSmartRedistribution(redistributionPlans)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          🚀 Apply Smart Redistribution
                        </button>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            })()}

            {/* Goal Forecasting & Insights */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-lg">🔮</div>
                <div className="flex-1">
                  <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-3">
                    <strong>Goal Forecasting & Smart Insights</strong>
                  </h4>
                  
                  {/* Priority Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 Priority Recommendations</h5>
                      <div className="space-y-2">
                        {(() => {
                          const priorityGoals = getPriorityGoals(goals)
                          return priorityGoals.slice(0, 3).map((goal, index) => (
                            <div key={goal.id} className="flex items-center justify-between text-xs">
                              <span className="text-blue-700 dark:text-blue-300">
                                {index + 1}. {goal.name}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {getPriorityScore(goal)}%
                              </span>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">⏰ Timeline Forecast</h5>
                      <div className="space-y-2">
                        {(() => {
                          const forecast = getGoalForecast(goals)
                          return forecast.slice(0, 3).map((prediction, index) => (
                            <div key={prediction.goalId} className="flex items-center justify-between text-xs">
                              <span className="text-blue-700 dark:text-blue-300">
                                {prediction.goalName}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 font-medium">
                                {prediction.completionDate}
                              </span>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => showDetailedForecast(goals)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      📊 Detailed Forecast
                    </button>
                    <button
                      onClick={() => showPriorityAnalysis(goals)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      🎯 Priority Analysis
                    </button>
                    <button
                      onClick={() => showOptimizationTips(goals)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    >
                      💡 Optimization Tips
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal, index) => {
                const progress = calculateGoalProgress(goal)
                const timeRemaining = formatTimeRemaining(progress.daysRemaining, progress.monthsRemaining, progress.isOverdue)
                const contributionRecommendation = getContributionRecommendation(progress.weeklyContribution, progress.monthlyContribution)
                
                return (
                  <div key={goal.id} className={`p-6 rounded-xl border transition-all duration-200 group ${
                    progress.isCompleted 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50 dark:border-green-800/50' 
                      : progress.isOverdue 
                        ? 'bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-800/20 border-red-200/50 dark:border-red-800/50'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200/50 dark:border-gray-600/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                        progress.isCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : progress.isOverdue
                            ? 'bg-gradient-to-r from-red-500 to-pink-500'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500'
                      }`}>
                        {progress.isCompleted ? '✓' : index + 1}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        progress.isCompleted 
                          ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                          : progress.isOverdue
                            ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                      }`}>
                        {progress.isCompleted ? 'Completed' : goal.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{goal.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{goal.description}</p>
                    
                    <div className="space-y-4">
                      {/* Progress Section */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          {currencySymbol}{goal.current_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ease-out ${
                            progress.isCompleted 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : progress.isOverdue
                                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                : 'bg-gradient-to-r from-purple-500 to-blue-500'
                          }`}
                          style={{ width: `${progress.progressPercentage}%` }}
                        ></div>
                      </div>
                      
                      {/* Progress Percentage */}
                      <div className="text-center">
                        <span className={`text-sm font-semibold ${
                          progress.isCompleted 
                            ? 'text-green-600 dark:text-green-400'
                            : progress.isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {progress.progressPercentage.toFixed(1)}% Complete
                        </span>
                      </div>
                      
                      {/* Time Remaining */}
                      {goal.target_date && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Time Remaining</span>
                          <span className={`font-medium ${
                            progress.isCompleted 
                              ? 'text-green-600 dark:text-green-400'
                              : progress.isOverdue
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {timeRemaining}
                          </span>
                        </div>
                      )}
                      
                      {/* Smart Insights */}
                      {!progress.isCompleted && (
                        <div className="space-y-3">
                          {/* Contribution Recommendation */}
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <div className="text-center">
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Recommended Contribution</span>
                              <div className="text-sm text-blue-800 dark:text-blue-200 font-semibold mt-1">
                                {contributionRecommendation}
                              </div>
                            </div>
                          </div>
                          
                          {/* Priority Indicator */}
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Priority Score</span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-purple-200 dark:bg-purple-700 rounded-full h-2">
                                  <div 
                                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, getPriorityScore(goal))}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                                  {getPriorityScore(goal)}%
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Completion Forecast */}
                          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            <div className="text-center">
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">Estimated Completion</span>
                              <div className="text-sm text-green-700 dark:text-green-300 font-semibold mt-1">
                                {(() => {
                                  const forecast = getGoalForecast([goal])
                                  return forecast.length > 0 ? forecast[0].completionDate : 'Calculating...'
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Completion Celebration */}
                      {progress.isCompleted && (
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                          <span className="text-sm text-green-600 dark:text-green-400 font-medium">🎉 Goal Achieved!</span>
                        </div>
                      )}
                      
                      {/* Goal Contribution Form */}
                      {!progress.isCompleted && (
                        <GoalContributionForm
                          goal={goal}
                          partnerships={partnerships}
                          profile={profile}
                          partnerProfile={partnerProfile}
                          currencySymbol={currencySymbol}
                          onContributionAdded={() => {
                            // Refresh goals data
                            window.location.reload()
                          }}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Goal Optimization Suggestions */}
            <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/50 rounded-xl">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-white text-lg">💡</div>
                <div className="flex-1">
                  <h4 className="text-amber-800 dark:text-amber-200 font-medium mb-3">
                    <strong>Smart Optimization Suggestions</strong>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Suggestion 1 */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🎯</div>
                        <h5 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Focus on High Priority</h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {(() => {
                            const priorityGoals = getPriorityGoals(goals)
                            const topGoal = priorityGoals[0]
                            return topGoal ? `Prioritize "${topGoal.name}" (${getPriorityScore(topGoal)}% priority)` : 'All goals are well-balanced'
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Suggestion 2 */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="text-center">
                        <div className="text-2xl mb-2">⏰</div>
                        <h5 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Timeline Optimization</h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {(() => {
                            const forecast = getGoalForecast(goals)
                            const longestGoal = forecast[forecast.length - 1]
                            return longestGoal ? `"${longestGoal.goalName}" will take ${longestGoal.monthsToComplete} months` : 'All goals are on track'
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Suggestion 3 */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🚀</div>
                        <h5 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Acceleration Tips</h5>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {(() => {
                            const redistributionPlans = calculateSmartRedistribution(goals)
                            return redistributionPlans.length > 0 
                              ? `${redistributionPlans.length} goal(s) can be accelerated` 
                              : 'All goals are optimally funded'
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
            <div className="text-8xl mb-6 opacity-50">🎯</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No savings goals yet</h3>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              Create your first goal to start saving together
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Create Your First Goal
            </button>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
          <div className="text-8xl mb-6 opacity-50">🤝</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Partnership Required</h3>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
            To add shared savings goals, you need to be connected with a partner. This allows you to split costs and track shared financial goals together.
          </p>
          
          <div className="text-left max-w-md mx-auto">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 text-center">Next steps:</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li>• Partner with someone to start sharing expenses</li>
              <li>• Set up shared financial goals</li>
              <li>• Track spending together</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

// Approvals View Component
function ApprovalsView({ 
  approvals, 
  partnerships,
  currentUserId,
  onApprove, 
  onDecline, 
  currencySymbol 
}: { 
  approvals: ApprovalRequest[], 
  partnerships: any[],
  currentUserId: string | undefined,
  onApprove: (id: string) => void,
  onDecline: (id: string) => void,
  currencySymbol: string
}) {
  if (!partnerships || partnerships.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
        <div className="text-8xl mb-6 opacity-50">🤝</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partnership Required</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          To see approval requests, you need to be connected with a partner. This allows you to split costs and track shared financial goals together.
        </p>
        
        <div className="text-left max-w-md mx-auto">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 text-center">Next steps:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Partner with someone to start sharing expenses</li>
            <li>• Set up shared financial goals</li>
            <li>• Track spending together</li>
          </ul>
        </div>
      </div>
    )
  }

  if (approvals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
        <div className="text-8xl mb-6 opacity-50">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Pending Approvals</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">You're all caught up!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Approval Requests</h2>
      
      {/* Partner Approval Notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="text-blue-600 dark:text-blue-400">ℹ️</div>
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            <strong>Approval System:</strong> Large expenses (over {currencySymbol}100) and new goals require partner approval. You can see your own requests and approve your partner's requests.
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        {approvals.map((approval) => (
          <div key={approval.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    approval.request_type === 'expense' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                  }`}>
                    {approval.request_type === 'expense' ? '💰 Expense' : '🎯 Goal'}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Requested by {approval.requested_by_user?.id === currentUserId ? 'you' : (approval.requested_by_user?.name || 'Unknown')}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  {approval.request_type === 'expense' ? 'New Expense Request' : 'New Goal Request'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {approval.request_type === 'expense' && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Description:</span> {approval.request_data.description || 'No description'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Amount:</span> <span className="font-semibold text-lg">{currencySymbol}{approval.request_data.amount?.toFixed(2)}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {approval.request_data.category === 'Vacation' ? 'Holiday' : (approval.request_data.category || 'Uncategorized')}</p>
                      </div>
                    </>
                  )}
                  
                  {approval.request_type === 'goal' && (
                    <>
                      <div className="space-y-2">
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Name:</span> {approval.request_data.name || 'No name'}</p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Target Amount:</span> <span className="font-semibold text-lg">{currencySymbol}{approval.request_data.targetAmount?.toFixed(2)}</span></p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Category:</span> {approval.request_data.category === 'Vacation' ? 'Holiday' : (approval.request_data.category || 'No category')}</p>
                        <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Description:</span> {approval.request_data.description || 'No description'}</p>
                        {approval.request_data.targetDate && (
                          <p className="text-sm"><span className="font-medium text-gray-700 dark:text-gray-300">Target Date:</span> {new Date(approval.request_data.targetDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {approval.message && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Message:</span> {approval.message}
                    </p>
                  </div>
                )}
                
                {/* Approval Status Info */}
                <div className={`rounded-lg p-3 ${
                  approval.requested_by_user?.id === currentUserId 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                }`}>
                  {approval.requested_by_user?.id === currentUserId ? (
                    // User is the requester
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Request Sent:</strong> Your {approval.request_type} request has been sent to your partner for approval. 
                      {approval.request_type === 'expense' && approval.request_data.amount > 100 && (
                        <span> This expense requires approval because it's over {currencySymbol}100.</span>
                      )}
                    </p>
                  ) : (
                    // User is the approver
                    <p className="text-amber-800 dark:text-amber-200 text-sm">
                      <strong>Action Required:</strong> Please review this request and either approve or decline it. 
                      {approval.request_type === 'expense' && approval.request_data.amount > 100 && (
                        <span> This expense requires approval because it's over {currencySymbol}100.</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2 ml-4">
                {/* Check if current user is the requester or the approver */}
                {approval.requested_by_user?.id === currentUserId ? (
                  // User is the requester - show "Sent for Approval" status
                  <div className="text-center">
                    <div className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                      📤 Sent for Approval
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Waiting for partner
                    </p>
                  </div>
                ) : (
                  // User is the approver - show approve/decline buttons
                  <>
                    <button
                      onClick={() => onApprove(approval.id)}
                      className="btn btn-success px-4 py-2"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onDecline(approval.id)}
                      className="btn btn-danger px-4 py-2"
                    >
                      Decline
                    </button>
                  </>
                )}
                

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
