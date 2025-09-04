'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'
import { supabase } from '@/lib/supabase'

// Import components
import { OverviewHub } from './OverviewHub'
import { GoalsHub } from './GoalsHub'
import { AccountHub } from './AccountHub'
import { AnalyticsView } from './AnalyticsView'
import { NotificationManager } from './NotificationManager'
import { NotificationDropdown } from './NotificationDropdown'
import { MobileNavigation } from './MobileNavigation'
import { MobileLayout } from './MobileLayout'
import { ErrorBoundary } from './ErrorBoundary'
import { MoneyHub } from './MoneyHub'
import { MonthlyContributionRecorder } from './MonthlyContributionRecorder'
import { PartnerHub } from './PartnerHub'
import { LoadingScreen, useLoadingScreen } from './LoadingScreen'
import { AuthForm } from './AuthForm'
import { ProfileManager } from './ProfileManager'

// Import types
import type { Expense, Goal, Partnership, Profile, Approval } from '@/types'

export function SplitsaveApp() {
  const [currentView, setCurrentView] = useState('overview')
  const [navigationParams, setNavigationParams] = useState<any>({})
  const [user, setUser] = useState<any>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // State management
  const [expenses, setExpenses] = useState<Expense[] | null>(null)
  const [goals, setGoals] = useState<Goal[] | null>(null)
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [approvals, setApprovals] = useState<Approval[]>([])
  const [monthlyProgress, setMonthlyProgress] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Derive partner profile from partnerships
  const partnerProfile = useMemo(() => {
    if (!partnerships || partnerships.length === 0 || !user) return null
    
    const activePartnership = partnerships.find(p => p.status === 'active')
    if (!activePartnership) return null
    
    // Determine which user is the partner
    const partnerUserId = activePartnership.user1_id === user.id ? activePartnership.user2_id : activePartnership.user1_id
    const partnerUser = activePartnership.user1_id === user.id ? activePartnership.user2 : activePartnership.user1
    
    // Extract partner profile data from the enhanced partnership data
    const partnerProfileData = (partnerUser as any)?.user_profiles?.[0] || {}
    
    // Return partner profile from partnership data
    return {
      id: partnerUserId,
      user_id: partnerUserId,
      name: partnerUser?.name || 'Partner',
      email: partnerUser?.email || 'partner@example.com',
      country_code: partnerProfileData.country_code || 'GB',
      currency: partnerProfileData.currency || 'GBP',
      income: partnerProfileData.income || null,
      payday: partnerProfileData.payday || null,
      personal_allowance: partnerProfileData.personal_allowance || null,
      partnership_id: activePartnership.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }, [partnerships, user])
  const [profileCompletionShown, setProfileCompletionShown] = useState(false)

  // Check if profile is complete enough to show dashboard
  const isProfileComplete = useMemo(() => {
    if (!profile) {
      return false
    }
    
    // Check essential fields (matching ProfileManager logic)
    const hasName = profile.name && profile.name.trim().length > 0
    const hasIncome = profile.income && profile.income > 0
    const hasPayday = profile.payday && profile.payday.toString().trim().length > 0
    const hasCountry = profile.country_code && profile.country_code.trim().length > 0
    
    // Currency is auto-set based on country, so we don't need to check it explicitly
    const isComplete = hasName && hasIncome && hasPayday && hasCountry
    
    if (isComplete) {
      console.log('✅ Profile complete - showing dashboard')
    }
    
    return isComplete
  }, [profile])

  // Currency and localization - only show currency when profile is complete
  const currencySymbol = !profile || !isProfileComplete ? '£' : // Don't show currency until profile is complete
                        profile.currency === 'USD' ? '$' : 
                        profile.currency === 'EUR' ? '€' : 
                        profile.currency === 'GBP' ? '£' : 
                        profile.currency === 'CAD' ? 'C$' :
                        profile.currency === 'AUD' ? 'A$' :
                        profile.currency === 'JPY' ? '¥' :
                        profile.currency === 'INR' ? '₹' :
                        profile.currency === 'BRL' ? 'R$' :
                        profile.currency === 'MXN' ? '$' :
                        profile.currency === 'SGD' ? 'S$' :
                        profile.currency === 'NZD' ? 'NZ$' :
                        profile.currency || '£' // Fallback to GBP
  
  const currencyEmoji = !profile || !isProfileComplete ? '🇬🇧' : // Don't show emoji until profile is complete
                       profile.currency === 'USD' ? '🇺🇸' : 
                       profile.currency === 'EUR' ? '🇪🇺' : 
                       profile.currency === 'GBP' ? '🇬🇧' : 
                       profile.currency === 'CAD' ? '🇨🇦' :
                       profile.currency === 'AUD' ? '🇦🇺' :
                       profile.currency === 'JPY' ? '🇯🇵' :
                       profile.currency === 'INR' ? '🇮🇳' :
                       profile.currency === 'BRL' ? '🇧🇷' :
                       profile.currency === 'MXN' ? '🇲🇽' :
                       profile.currency === 'SGD' ? '🇸🇬' :
                       profile.currency === 'NZD' ? '🇳🇿' :
                       profile.currency ? '🌍' : '🇬🇧' // Fallback to UK flag
  

  
  // Loading screen hook
  const { isLoading: showLoadingScreen, progress, message, updateProgress, finishLoading } = useLoadingScreen()
  
  // Additional failsafe for loading state
  useEffect(() => {
    const loadingFailsafe = setTimeout(() => {
      if (loading) {
        console.log('Loading state stuck, forcing to false')
        setLoading(false)
      }
    }, 3000)
    
    return () => clearTimeout(loadingFailsafe)
  }, [loading])

  // Navigation handler
  const handleNavigation = useCallback((view: string, params: any = {}) => {
    setCurrentView(view)
    setNavigationParams(params)
  }, [])

  // Theme toggle handler
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])



  // Sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
    } catch (error) {
      console.error('Sign out error:', error)
    }
    
    // Clear local state
    setUser(null)
    setExpenses([])
    setGoals([])
    setPartnerships([])
    setProfile(null)
    setApprovals([])
    setMonthlyProgress(null)
    setCurrentView('overview')
    toast.success('Signed out successfully!')
  }, [])

  // Data fetching functions
  const fetchExpenses = useCallback(async () => {
    try {
      const response = await apiClient.get('/expenses')
      setExpenses(response.data || [])
    } catch (err) {
      console.error('Error fetching expenses:', err)
      setExpenses([])
    }
  }, [])

  const fetchGoals = useCallback(async () => {
    try {
      const response = await apiClient.get('/goals')
      setGoals(response.data || [])
    } catch (err) {
      console.error('Error fetching goals:', err)
      setGoals([])
    }
  }, [])

  const fetchPartnerships = useCallback(async () => {
    try {
      const response = await apiClient.get('/partnerships')
      setPartnerships(response.data || [])
    } catch (err) {
      console.error('Error fetching partnerships:', err)
      setPartnerships([])
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/profile')
      const profileData = response.data || response
      setProfile(profileData)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setProfile(null)
    }
  }, [])

  const fetchApprovals = useCallback(async () => {
    try {
      const response = await apiClient.get('/approvals')
      setApprovals(response.data || [])
    } catch (err) {
      console.error('Error fetching approvals:', err)
      setApprovals([])
    }
  }, [])

  const fetchMonthlyProgress = useCallback(async () => {
    try {
      const response = await apiClient.get('/monthly-progress')
      setMonthlyProgress(response.data)
    } catch (err) {
      console.error('Error fetching monthly progress:', err)
      setMonthlyProgress(null)
    }
  }, [])

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      updateProgress(10, 'Syncing expense data...')
      await fetchExpenses()
      
      updateProgress(25, 'Loading savings goals...')
      await fetchGoals()
      
      updateProgress(40, 'Connecting partnerships...')
      await fetchPartnerships()
      
      updateProgress(60, 'Loading profile settings...')
      await fetchProfile()
      
      updateProgress(80, 'Checking pending approvals...')
      await fetchApprovals()
      
      updateProgress(90, 'Analyzing monthly progress...')
      await fetchMonthlyProgress()
      
      updateProgress(100, 'Preparing your dashboard...')
      finishLoading()
      
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data. Please try again.')
      setLoading(false)
    }
  }, [fetchExpenses, fetchGoals, fetchPartnerships, fetchProfile, fetchApprovals, fetchMonthlyProgress, updateProgress, finishLoading])

  // Profile update handler
  const handleProfileUpdate = useCallback((updatedProfile: any) => {
    console.log('🔄 Profile updated:', updatedProfile)
    setProfile(updatedProfile)
    // Only refresh data if profile actually changed
    if (JSON.stringify(updatedProfile) !== JSON.stringify(profile)) {
      loadData()
    }
  }, [loadData, profile])

  // Add goal handler
  const addGoal = useCallback(async (data: any) => {
    try {
      const response = await apiClient.post('/goals', data)
      if (response.data) {
        setGoals(prev => prev ? [...prev, response.data] : [response.data])
        toast.success('Goal added successfully!')
        // No need to refresh data - local state is already updated
      }
    } catch (err) {
      console.error('Error adding goal:', err)
      toast.error('Failed to add goal. Please try again.')
    }
  }, [])

  // Update goal handler
  const updateGoal = useCallback(async (goalId: string, updates: any) => {
    try {
      console.log('🔄 Updating goal:', goalId, 'with updates:', updates)
      console.log('🔄 Priority in updates:', updates.priority, 'type:', typeof updates.priority)
      const response = await apiClient.put(`/goals/${goalId}`, updates)
      console.log('📡 API response:', response.data)
      console.log('📡 Priority in response:', response.data?.priority, 'type:', typeof response.data?.priority)
      
      if (response.data) {
        setGoals(prev => {
          const updated = prev ? prev.map(goal => 
            goal.id === goalId ? { ...goal, ...response.data } : goal
          ) : [response.data]
          console.log('🎯 Updated goals state:', updated)
          console.log('🎯 Priority in updated goal:', updated.find(g => g.id === goalId)?.priority)
          return updated
        })
        toast.success('Goal updated successfully!')
        // No need to refresh data - local state is already updated
      }
    } catch (err) {
      console.error('Error updating goal:', err)
      toast.error('Failed to update goal. Please try again.')
    }
  }, [])

  // Achievement unlock handler
  const handleAchievementUnlocked = useCallback((achievement: any) => {
    toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`)
  }, [])

  const handleAddExpense = useCallback(async (expense: any) => {
    try {
      const response = await apiClient.post('/expenses', expense)
      if (response.data?.requiresApproval) {
        toast.success('Expense submitted for approval!')
        // Only refresh data if approval is required to show the approval request
        await loadData()
      } else if (response.data) {
        setExpenses(prev => prev ? [...prev, response.data] : [response.data])
        toast.success('Expense added successfully!')
        // No need to refresh data - local state is already updated
      }
    } catch (error) {
      console.error('Error adding expense:', error)
        toast.error('Failed to add expense')
      }
  }, [loadData])

  // Lightweight update function for expenses (no loading screen)
  const handleExpenseUpdate = useCallback(async () => {
    try {
      // Only fetch expenses, not all data
      await fetchExpenses()
    } catch (error) {
      console.error('Error updating expenses:', error)
    }
  }, [])

  const handleApprove = useCallback(async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/approve`, {})
      toast.success('Approval processed successfully!')
      loadData()
    } catch (error) {
      console.error('Error approving:', error)
      toast.error('Failed to process approval')
    }
  }, [loadData])

  const handleDecline = useCallback(async (approvalId: string) => {
    try {
      await apiClient.post(`/approvals/${approvalId}/decline`, {})
      toast.success('Approval declined successfully!')
      loadData()
    } catch (error) {
      console.error('Error declining:', error)
      toast.error('Failed to process decline')
    }
  }, [loadData])

  const handleContributionRecorded = useCallback(() => {
    toast.success('Contribution recorded successfully!')
    loadData()
  }, [loadData])

  // Initialize theme from localStorage and detect mobile
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    
    setIsDarkMode(shouldUseDark)
    if (shouldUseDark) {
      document.documentElement.classList.add('dark')
      } else {
      document.documentElement.classList.remove('dark')
    }

    // Detect mobile devices
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      const isSafari = /safari/i.test(userAgent) && !/chrome/i.test(userAgent)
      
      console.log('🔍 Mobile detection:', {
        userAgent,
        isMobileDevice,
        isSmallScreen,
        isSafari,
        windowWidth: window.innerWidth,
        finalIsMobile: isMobileDevice || isSmallScreen
      })
      
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check for existing session on mount
  useEffect(() => {
    console.log('🔄 SplitsaveApp: Starting authentication check')
    
    const checkSession = async () => {
      try {
        console.log('🔍 Checking for existing session...')
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📊 Session check result:', { hasSession: !!session, hasUser: !!session?.user })
        
        if (session?.user) {
          console.log('✅ User found in session:', session.user.id)
          setUser(session.user)
          setLoading(true)
          
          // Simplified loading - no minimum time requirement
          try {
            await loadData()
          } catch (error) {
            console.warn('Data loading failed, continuing with empty data:', error)
          } finally {
            setLoading(false)
          }
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Session check error:', error)
        setLoading(false)
      }
    }
    
    checkSession()
    
    // Failsafe: Force loading to false after 5 seconds (reduced from 10)
    const failsafeTimeout = setTimeout(() => {
      console.log('Failsafe timeout: forcing loading to false')
      setLoading(false)
    }, 5000)
    
    return () => clearTimeout(failsafeTimeout)
  }, []) // Remove loadData and loading from dependencies to prevent infinite loops



  // Show loading state
  if (loading || showLoadingScreen) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          {/* Enhanced loading animation */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 border-r-purple-400 animate-spin"></div>
              <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
            </div>
            </div>
            
          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            SplitSave
          </h1>
          <p className="text-white/80 text-lg mb-2">
            Building your AI-powered financial dashboard...
          </p>
          <p className="text-white/60 text-sm">
            Analyzing your financial patterns and optimizing your savings strategy
          </p>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
  return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
              <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
            Retry
              </button>
            </div>
      </div>
    )
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
        <AuthForm onAuthSuccess={setUser} />
          </div>
    )
  }

  // Show profile completion screen if profile is incomplete
  if (!isProfileComplete) {
    console.log('🚫 Showing profile completion screen - profile incomplete')
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Complete Your Profile
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Let's set up your financial profile so we can provide you with the best experience
            </p>
        </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <ProfileManager onProfileUpdate={handleProfileUpdate} />
      </div>
      </div>
      </div>
    )
  }

  console.log('✅ Profile complete - showing dashboard')

  // Main content components
  const mainContent = (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
        {/* Desktop Navigation - Only show on desktop */}
        {!isMobile && (
          <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2 mr-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">S</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">SplitSave</span>
            </div>
            
                {/* Navigation Links - Responsive */}
                <div className="hidden md:flex items-center space-x-1">
            <button
                    onClick={() => handleNavigation('overview')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'overview'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Dashboard
            </button>
            <button
                    onClick={() => handleNavigation('expenses')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'expenses'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Money
            </button>
            <button
                    onClick={() => handleNavigation('goals')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'goals'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Goals
            </button>
              <button
                    onClick={() => handleNavigation('partnerships')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'partnerships'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Partners
              </button>
              <button
                    onClick={() => handleNavigation('analytics')}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === 'analytics'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    Analytics
              </button>
          </div>
                
        </div>
              <div className="flex items-center space-x-2">
                {/* User Info - Show Name */}
                <div className="hidden md:block">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {profile?.name || 'User'}
                  </span>
      </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1">
                      <button
                    onClick={() => handleNavigation('account')}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Settings"
                      >
                    ⚙️
                      </button>
                  <NotificationDropdown 
                    userId={user?.id || ''}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  />
                  <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Toggle Theme"
                  >
                    🌙
                  </button>
                    </div>
                
                {/* Sign Out - Compact */}
                <div className="border-l border-gray-200 dark:border-gray-600 pl-2">
              <button
                    onClick={handleSignOut}
                    className="px-2 py-1 rounded-md text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                    Sign out
              </button>
            </div>
          </div>
        </div>
          </div>
        </nav>
        )}

        
        {/* Main Content */}
        <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isMobile ? 'py-2' : 'py-4 sm:py-6'}`}>
          <div className={isMobile ? 'py-2' : 'py-4 sm:py-6'}>
            <ErrorBoundary>
        {currentView === 'overview' && (
          <OverviewHub
                  expenses={expenses || []}
                  goals={goals || []}
            partnerships={partnerships}
                  monthlyProgress={monthlyProgress}
            profile={profile}
            partnerProfile={partnerProfile}
            user={user}
            currencySymbol={currencySymbol}
            currencyEmoji={currencyEmoji}
            onNavigate={handleNavigation}
            onNavigateToProfile={() => handleNavigation('account')}
                  onNavigateToPartnerships={() => handleNavigation('partnerships')}
                  onSafetyPotUpdate={() => {
                    console.log('🔍 Dashboard: Safety pot update callback triggered')
                  }}
          />
        )}
              {currentView === 'expenses' && (
          <MoneyHub
                  expenses={expenses || []}
            partnerships={partnerships}
            profile={profile}
            user={user}
            currencySymbol={currencySymbol}
                  goals={goals || []}
                  monthlyProgress={monthlyProgress}
                  onAddExpense={handleAddExpense}
                  onUpdate={handleExpenseUpdate}
                  navigationParams={navigationParams}
                />
              )}
        {currentView === 'goals' && (
          <GoalsHub
                  goals={goals || []}
            partnerships={partnerships}
            onAddGoal={addGoal}
                  onUpdateGoal={updateGoal}
            currencySymbol={currencySymbol}
            profile={profile}
            partnerProfile={partnerProfile}
            user={user}
                />
              )}
              {currentView === 'monthly-progress' && (
                <MonthlyContributionRecorder
            partnerships={partnerships}
            profile={profile}
            partnerProfile={partnerProfile}
            currencySymbol={currencySymbol}
                  onContributionRecorded={handleContributionRecorded}
          />
        )}
              {currentView === 'partnerships' && (
                <PartnerHub
              partnerships={partnerships}
                  approvals={approvals || []}
              profile={profile}
              partnerProfile={partnerProfile}
            user={user}
                  goals={goals || []}
            currencySymbol={currencySymbol}
                  onApprove={handleApprove}
                  onDecline={handleDecline}
                  onUpdate={loadData}
                  initialTab={navigationParams.initialTab}
          />
        )}
        {currentView === 'analytics' && (
          <AnalyticsView 
            partnerships={partnerships}
            profile={profile}
            user={user}
            currencySymbol={currencySymbol}
                  monthlyProgress={monthlyProgress}
                  goals={goals || []}
                />
              )}
              {currentView === 'account' && (
                <AccountHub
                profile={profile}
                partnerProfile={partnerProfile}
                  partnerships={partnerships}
                  goals={goals || []}
                  expenses={expenses || []}
                user={user}
                currencySymbol={currencySymbol}
                  onUpdate={fetchProfile}
                  navigationParams={navigationParams}
              />
            )}
            </ErrorBoundary>
          </div>
        </main>

        {/* Notification Manager */}
        <NotificationManager
                profile={profile}
            partnerships={partnerships}
          goals={goals || []}
            approvals={approvals} 
          currentView={currentView}
          onNavigateToView={handleNavigation}
          onAchievementUnlocked={handleAchievementUnlocked}
        />

    </div>
    </ErrorBoundary>
  )

  console.log('🔄 SplitsaveApp render:', {
    isMobile,
    currentView,
    hasUser: !!user,
    loading,
    error
  })

  return (
    <ErrorBoundary>
      {isMobile ? (
        <MobileLayout
          currentView={currentView}
          onNavigate={handleNavigation}
          isOnline={true}
          hasNotifications={approvals && approvals.length > 0}
          notificationCount={approvals ? approvals.length : 0}
          user={user}
          profile={profile}
          onSignOut={handleSignOut}
          onToggleTheme={toggleTheme}
        >
          {mainContent}
        </MobileLayout>
      ) : (
        mainContent
      )}
    </ErrorBoundary>
  )
}
