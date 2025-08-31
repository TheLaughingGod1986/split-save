'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { MonthlyContributionRecorder } from './MonthlyContributionRecorder'

interface MonthlyProgressProps {
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
  onProgressUpdate?: (data: any) => void
}

interface MonthlyProgressData {
  month: string
  expectedSalary: number
  actualSalary: number
  extraIncome: number
  sharedExpensesContributed: number
  goal1Saved: number
  goal2Saved: number
  safetyPotSaved: number
  notes: string
  submittedAt: string
}

export function MonthlyProgress({
  partnerships,
  profile,
  user,
  currencySymbol,
  onProgressUpdate
}: MonthlyProgressProps) {
  const [currentMonth, setCurrentMonth] = useState('')
  const [isPayday, setIsPayday] = useState(false)
  const [showProgressForm, setShowProgressForm] = useState(false)
  const [monthlyData, setMonthlyData] = useState<MonthlyProgressData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paydayReminder, setPaydayReminder] = useState<string>('')
  const [streakCount, setStreakCount] = useState(0)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementMessage, setAchievementMessage] = useState('')

  // Form state
  const [expectedSalary, setExpectedSalary] = useState(0)
  const [actualSalary, setActualSalary] = useState(0)
  const [extraIncome, setExtraIncome] = useState(0)
  const [sharedExpensesContributed, setSharedExpensesContributed] = useState(0)
  const [goal1Saved, setGoal1Saved] = useState(0)
  const [goal2Saved, setGoal2Saved] = useState(0)
  const [safetyPotSaved, setSafetyPotSaved] = useState(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (profile?.income) {
      setExpectedSalary(profile.income)
      setActualSalary(profile.income)
      
      // Calculate initial contributions based on base salary
      const baseSalary = profile.income
      const disposableIncome = baseSalary - (profile.personal_allowance || 0)
      
      // Initial contributions from base salary
      const requiredSharedExpenses = disposableIncome * 0.7
      const requiredSavings = disposableIncome * 0.2
      const requiredSafetyNet = disposableIncome * 0.1
      
      setSharedExpensesContributed(requiredSharedExpenses)
      setGoal1Saved(requiredSavings * 0.6) // 60% of savings to goal 1
      setGoal2Saved(requiredSavings * 0.4) // 40% of savings to goal 2
      setSafetyPotSaved(requiredSafetyNet)
    }
    
    const now = new Date()
    const monthYear = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    setCurrentMonth(monthYear)
    
    // Check if it's payday
    checkIfPayday()
    
    // Load existing monthly data
    loadMonthlyProgress()
  }, [profile])

  // Update form fields when actual salary changes (only on initial load)
  useEffect(() => {
    if (actualSalary > 0 && actualSalary === expectedSalary) {
      const recommendations = getDynamicRecommendations(actualSalary)
      if (recommendations) {
        setSharedExpensesContributed(recommendations.sharedExpenses)
        setGoal1Saved(recommendations.goal1)
        setGoal2Saved(recommendations.goal2)
        setSafetyPotSaved(recommendations.safetyPot)
      }
    }
  }, [expectedSalary]) // Only run when expected salary changes, not actual salary

  const checkIfPayday = () => {
    if (!profile?.payday) return
    
    const today = new Date()
    const payday = new Date(profile.payday)
    
    // Get current month's payday
    const currentMonthPayday = new Date(today.getFullYear(), today.getMonth(), payday.getDate())
    
    // Check if today is payday (within 1 day tolerance)
    const diffTime = Math.abs(today.getTime() - currentMonthPayday.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 1) {
      setIsPayday(true)
      setShowProgressForm(true)
      setPaydayReminder('🎉 It\'s payday! Time to update your monthly progress!')
    } else if (diffDays <= 3) {
      // Show reminder 3 days before payday
      setPaydayReminder(`📅 Payday is coming up in ${diffDays} days!`)
    } else if (diffDays <= 7) {
      // Show gentle reminder a week before
      setPaydayReminder(`💡 Payday reminder: ${diffDays} days to go`)
    }
  }

  const loadMonthlyProgress = async () => {
    try {
      // In a real app, this would fetch from monthly progress API
      // For now, check if we have data for current month
      const now = new Date()
      const currentMonthYear = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      
      if (currentMonthYear !== currentMonth) {
        // This is a new month, no data yet
        setMonthlyData(null)
      } else {
        // Check if we have data for current month
        setMonthlyData(null)
      }
      
      // Load streak from API
      await loadStreak()
    } catch (error) {
      console.error('Failed to load monthly progress:', error)
    }
  }

  const loadStreak = async () => {
    try {
      // In a real app, this would fetch from streak API
      // For now, set to 0 until real data is implemented
      setStreakCount(0)
    } catch (error) {
      console.error('Failed to load streak:', error)
      setStreakCount(0)
    }
  }



  const showAchievementToast = (message: string) => {
    setAchievementMessage(message)
    setShowAchievement(true)
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowAchievement(false)
      setAchievementMessage('')
    }, 5000)
  }

  const calculateExtraIncome = (actual: number, expected: number) => {
    const extra = Math.max(0, actual - expected)
    setExtraIncome(extra)
    
    if (extra > 0) {
      // Redistribute extra income proportionally to savings and safety net
      const extraToSavings = extra * 0.8 // 80% to savings
      const extraToSafety = extra * 0.2 // 20% to safety net
      
      // Add to existing amounts
      setGoal1Saved(prev => prev + (extraToSavings * 0.6)) // 60% of extra savings to goal 1
      setGoal2Saved(prev => prev + (extraToSavings * 0.4)) // 40% of extra savings to goal 2
      setSafetyPotSaved(prev => prev + extraToSafety)
    }
  }

  const getRequiredAmounts = () => {
    if (!profile?.income) return null
    
    const baseSalary = profile.income
    const disposableIncome = baseSalary - (profile.personal_allowance || 0)
    
    return {
      sharedExpenses: disposableIncome * 0.7,
      goal1: disposableIncome * 0.2 * 0.6,
      goal2: disposableIncome * 0.2 * 0.4,
      safetyPot: disposableIncome * 0.1
    }
  }

  const getDynamicRecommendations = (actualSalary: number) => {
    if (!profile?.income) return null
    
    // Prevent negative calculations - salary cannot be less than expected
    if (actualSalary < profile.income) {
      return null // Return null to indicate invalid salary
    }
    
    // FIXED: Shared expenses are based on BASE salary (profile.income), not actual salary
    const baseDisposableIncome = profile.income - (profile.personal_allowance || 0)
    
    // Base recommendations from BASE salary (fixed) - these are your MANUAL savings targets
    const baseRecommendations = {
      sharedExpenses: Math.round(baseDisposableIncome * 0.7), // FIXED: Always based on base salary
      goal1: Math.round(baseDisposableIncome * 0.2 * 0.6),   // FIXED: Always based on base salary
      goal2: Math.round(baseDisposableIncome * 0.2 * 0.4),   // FIXED: Always based on base salary
      safetyPot: Math.round(baseDisposableIncome * 0.1)       // FIXED: Always based on base salary
    }
    
    return baseRecommendations
  }

  // NEW: Get recommended savings amounts that include extra income distribution
  const getRecommendedSavings = (actualSalary: number) => {
    if (!profile?.income) return null
    
    const baseRecommendations = getDynamicRecommendations(actualSalary)
    if (!baseRecommendations) return null
    
    // Start with base recommendations
    const recommendedSavings = { ...baseRecommendations }
    
    // If actual salary is higher than expected, add extra income distribution to recommendations
    if (actualSalary > profile.income) {
      const extraIncome = actualSalary - profile.income
      const extraDisposable = extraIncome * 0.8 // 80% of extra goes to savings
      
      // Add extra income distribution to savings goals and safety net
      recommendedSavings.goal1 += Math.round(extraDisposable * 0.6)
      recommendedSavings.goal2 += Math.round(extraDisposable * 0.4)
      recommendedSavings.safetyPot += Math.round(extraIncome * 0.2)
    }
    
    return recommendedSavings
  }

  const getClearTargets = (actualSalary: number) => {
    const recommendations = getDynamicRecommendations(actualSalary)
    if (!recommendations) return null
    
    // Clear, simple targets - no confusing aspirational numbers
    return {
      sharedExpenses: recommendations.sharedExpenses,
      goal1: recommendations.goal1,
      goal2: recommendations.goal2,
      safetyPot: recommendations.safetyPot
    }
  }

  const getExtraIncomeBreakdown = (extraAmount: number) => {
    if (extraAmount <= 0) return null
    
    return {
      goal1: Math.round(extraAmount * 0.48), // 48% of extra to goal 1
      goal2: Math.round(extraAmount * 0.32), // 32% of extra to goal 2
      safetyPot: Math.round(extraAmount * 0.20) // 20% of extra to safety pot
    }
  }

  const getContributionStatus = (actual: number, target: number) => {
    // FIXED: Only compare against base target, not total recommended amount
    if (actual >= target * 1.1) return 'over-achieved' // NEW: Reward for saving 10%+ more
    if (actual >= target) return 'on-track'
    if (actual >= target * 0.9) return 'close'
    return 'under'
  }

  const getContributionMessage = (actual: number, target: number, category: string) => {
    if (actual >= target * 1.1) {
      const overage = actual - target
      return `🎉 Over-achieved! You saved ${currencySymbol}${overage} more than target for ${category}`
    }
    
    if (actual >= target) return null
    
    const shortfall = target - actual
    if (actual >= target * 0.9) {
      return `⚠️ Close to target - need ${currencySymbol}${shortfall} more for ${category}`
    } else {
      return `❌ Under target - need ${currencySymbol}${shortfall} more for ${category}`
    }
  }

  const getContributionColor = (status: string) => {
    switch (status) {
      case 'over-achieved': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
      case 'on-track': return 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
      case 'close': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-green-300'
      case 'under': return 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
      default: return 'border-gray-300 dark:border-gray-600'
    }
  }

  const validateSalary = (salary: number) => {
    if (!profile?.income) return { isValid: false, message: 'Profile not loaded' }
    
    if (salary < profile.income) {
      return { 
        isValid: false, 
        message: `Salary cannot be less than expected amount (${currencySymbol}${profile.income})` 
      }
    }
    
    if (salary === profile.income) {
      return { 
        isValid: true, 
        message: 'Salary matches expected amount - no extra income to distribute' 
      }
    }
    
    if (salary > profile.income) {
      const extra = salary - profile.income
      return { 
        isValid: true, 
        message: `Extra income: ${currencySymbol}${extra} will be distributed to savings goals` 
      }
    }
    
    return { isValid: true, message: '' }
  }

  const handleSalaryChange = (newSalary: number) => {
    // Allow typing by setting the value immediately
    setActualSalary(newSalary)
    
    // Only validate and show messages if it's a valid final value
    if (newSalary >= (profile?.income || 0)) {
      calculateExtraIncome(newSalary, expectedSalary)
      
      // Update form fields with new recommendations (including extra income distribution)
      const recommendations = getRecommendedSavings(newSalary)
      if (recommendations) {
        setSharedExpensesContributed(recommendations.sharedExpenses)
        setGoal1Saved(recommendations.goal1)
        setGoal2Saved(recommendations.goal2)
        setSafetyPotSaved(recommendations.safetyPot)
      }
      
      // Show success message for extra income
      if (newSalary > (profile?.income || 0)) {
        const extra = newSalary - (profile?.income || 0)
        toast.success(`Extra income: £${extra} will be distributed to savings goals`)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const progressData: MonthlyProgressData = {
        month: currentMonth,
        expectedSalary,
        actualSalary,
        extraIncome,
        sharedExpensesContributed,
        goal1Saved,
        goal2Saved,
        safetyPotSaved,
        notes,
        submittedAt: new Date().toISOString()
      }

      // Save to backend API
      try {
        const response = await fetch('/api/monthly-progress', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
          },
          body: JSON.stringify({
            month: currentMonth,
            notes,
            goalsProgress: {
              actualSalary,
              extraIncome,
              sharedExpensesContributed,
              goal1Saved,
              goal2Saved,
              safetyPotSaved
            }
          })
        })

        if (!response.ok) {
          throw new Error('Failed to save monthly progress')
        }

        console.log('✅ Monthly progress saved to database')
      } catch (error) {
        console.error('❌ Failed to save monthly progress:', error)
        toast.error('Failed to save progress to database')
        return
      }
      
      setMonthlyData(progressData)
      setShowProgressForm(false)
      setIsPayday(false)
      setPaydayReminder('')
      
      // Show achievements
      if (extraIncome > 0) {
        showAchievementToast(`💰 Bonus! Extra income of ${currencySymbol}${extraIncome} automatically distributed to savings!`)
      }
      
      toast.success('Monthly progress saved! 🎉')
      
      if (onProgressUpdate) {
        onProgressUpdate(progressData)
      }
    } catch (error) {
      toast.error('Failed to save progress')
      console.error('Error saving monthly progress:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProgressStatus = () => {
    if (!monthlyData) return 'pending'
    
    // Check if all recommended amounts are met
    const recommendations = getDynamicRecommendations(monthlyData.actualSalary)
    if (!recommendations) return 'pending'
    
    const sharedExpensesMet = monthlyData.sharedExpensesContributed >= recommendations.sharedExpenses
    const goal1Met = monthlyData.goal1Saved >= recommendations.goal1
    const goal2Met = monthlyData.goal2Saved >= recommendations.goal2
    const safetyPotMet = monthlyData.safetyPotSaved >= recommendations.safetyPot
    
    if (sharedExpensesMet && goal1Met && goal2Met && safetyPotMet) {
      return 'completed'
    } else if (sharedExpensesMet) {
      return 'partial'
    } else {
      return 'pending'
    }
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'partial': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30'
    }
  }

  const getProgressIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅'
      case 'partial': return '⚠️'
      default: return '⏳'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Progress</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your monthly financial achievements</p>
        </div>
        
        {paydayReminder && (
          <div className={`px-4 py-2 rounded-lg border text-sm font-medium ${
            isPayday 
              ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
              : 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
          }`}>
            {paydayReminder}
          </div>
        )}
      </div>

      {/* Streak & Achievement Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Monthly Streak</div>
              <div className="text-2xl font-bold">{streakCount} months</div>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">This Month</div>
              <div className="text-2xl font-bold">{monthlyData ? '✅ Complete' : '⏳ Pending'}</div>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>
      </div>

      {/* Current Month Status */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentMonth} Progress
          </h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(getProgressStatus())}`}>
            {getProgressIcon(getProgressStatus())} {getProgressStatus().charAt(0).toUpperCase() + getProgressStatus().slice(1)}
          </div>
        </div>

        {monthlyData ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}{monthlyData.actualSalary.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Actual Salary</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}{monthlyData.sharedExpensesContributed.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Shared Expenses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}{(monthlyData.goal1Saved + monthlyData.goal2Saved).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currencySymbol}{monthlyData.safetyPotSaved.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Safety Pot</div>
              </div>
            </div>
            
            {monthlyData.extraIncome > 0 && (
              <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-center text-sm text-green-800 dark:text-green-200">
                  🎉 Extra Income: {currencySymbol}{monthlyData.extraIncome} was automatically distributed to savings & safety net
                </div>
              </div>
            )}
            
            {/* Update Progress Button */}
            <div className="text-center mt-4">
              <button
                onClick={() => setShowProgressForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
              >
                ✏️ Update Progress
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">No progress data for {currentMonth} yet</div>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowProgressForm(true)
                  // Smooth scroll to the Income Reality section after a brief delay
                  setTimeout(() => {
                    const incomeSection = document.getElementById('income-reality-section')
                    if (incomeSection) {
                      incomeSection.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                      })
                    }
                  }, 100) // Small delay to ensure form is rendered
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                📝 Start Tracking This Month
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Track your salary, extra income, and financial targets
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Financial Reality Check Form */}
      {showProgressForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              📊 Financial Reality Check - {currentMonth}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your actual financial outcomes vs. targets
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Income Section */}
            <div id="income-reality-section" className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">💰 Income Reality</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Expected Salary (from profile)
                  </label>
                  <div className="px-3 py-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-900 dark:text-blue-100 font-medium">
                    {currencySymbol}{expectedSalary.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Actual Salary Received
                  </label>
                  <input
                    type="number"
                    value={actualSalary}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === '') return // Allow empty input for typing
                      
                      const actual = Number(value)
                      if (!isNaN(actual)) {
                        handleSalaryChange(actual)
                      }
                    }}
                    min={profile?.income || 0}
                    step="1"
                    className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-blue-800 dark:text-white cursor-text"
                    placeholder="Enter actual salary"
                    required
                  />
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Minimum: {currencySymbol}{profile?.income || 0}
                  </div>
                </div>
              </div>
              
              {extraIncome > 0 && (
                <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-sm text-green-800 dark:text-green-200">
                    🎉 Extra Income: {currencySymbol}{extraIncome} (automatically distributed to savings & safety net)
                  </div>
                </div>
              )}
              
              {actualSalary === expectedSalary && (
                <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    ℹ️ Salary matches expected amount - using standard contribution targets
                  </div>
                </div>
              )}
            </div>

            {/* Shared Expenses Section */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">🏠 Shared Expenses</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                    What You Need to Contribute
                  </label>
                  {getClearTargets(actualSalary) ? (
                    <div className="px-3 py-2 bg-purple-100 dark:bg-purple-800 rounded-lg text-purple-900 dark:text-purple-100 font-medium">
                      {currencySymbol}{getClearTargets(actualSalary)?.sharedExpenses.toFixed(0) || '0'}
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-red-100 dark:bg-red-800 rounded-lg text-red-900 dark:text-red-100 font-medium">
                      Enter valid salary first
                    </div>
                  )}
                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                    70% of your base salary disposable income (fixed)
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-800 dark:text-purple-200 mb-2">
                    What You Actually Contributed
                  </label>
                  <input
                    type="number"
                    value={sharedExpensesContributed}
                    onChange={(e) => setSharedExpensesContributed(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      getContributionColor(getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0))
                    }`}
                    placeholder="Enter amount contributed"
                    required
                  />
                  {getContributionMessage(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0, 'Shared Expenses') && (
                    <div className={`text-xs mt-1 ${
                      getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0) === 'close'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {getContributionMessage(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0, 'Shared Expenses')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Savings Reality Section */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">🎯 What You Need to Save</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Goal 1 (Holiday)
                    </label>
                    {getClearTargets(actualSalary) ? (
                      <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                        <span className="font-medium">Base Target:</span> {currencySymbol}{getClearTargets(actualSalary)?.goal1.toFixed(0) || '0'}
                        {getRecommendedSavings(actualSalary) && getRecommendedSavings(actualSalary)!.goal1 > getClearTargets(actualSalary)!.goal1 && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            + {currencySymbol}{getRecommendedSavings(actualSalary)!.goal1 - getClearTargets(actualSalary)!.goal1} extra income
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                        <span className="font-medium">Target:</span> Enter valid salary first
                      </div>
                    )}
                    <input
                      type="number"
                      value={goal1Saved}
                      onChange={(e) => setGoal1Saved(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getContributionColor(getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0))
                      }`}
                      placeholder={`Recommended: ${currencySymbol}${getRecommendedSavings(actualSalary)?.goal1.toFixed(0) || getClearTargets(actualSalary)?.goal1.toFixed(0) || '0'}`}
                      required
                    />
                    {getContributionMessage(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0, 'Goal 1') && (
                      <div className={`text-xs mt-1 ${
                        getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0) === 'close'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getContributionMessage(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0, 'Goal 1')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Goal 2 (House)
                    </label>
                    {getClearTargets(actualSalary) ? (
                      <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                        <span className="font-medium">Base Target:</span> {currencySymbol}{getClearTargets(actualSalary)?.goal2.toFixed(0) || '0'}
                        {getRecommendedSavings(actualSalary) && getRecommendedSavings(actualSalary)!.goal2 > getClearTargets(actualSalary)!.goal2 && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            + {currencySymbol}{getRecommendedSavings(actualSalary)!.goal2 - getClearTargets(actualSalary)!.goal2} extra income
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                        <span className="font-medium">Target:</span> Enter valid salary first
                      </div>
                    )}
                    <input
                      type="number"
                      value={goal2Saved}
                      onChange={(e) => setGoal2Saved(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getContributionColor(getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0))
                      }`}
                      placeholder={`Recommended: ${currencySymbol}${getRecommendedSavings(actualSalary)?.goal2.toFixed(0) || getClearTargets(actualSalary)?.goal2.toFixed(0) || '0'}`}
                      required
                    />
                    {getContributionMessage(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0, 'Goal 2') && (
                      <div className={`text-xs mt-1 ${
                        getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0) === 'close'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getContributionMessage(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0, 'Goal 2')}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                      Safety Pot
                    </label>
                    {getClearTargets(actualSalary) ? (
                      <div className="text-sm text-green-600 dark:text-green-400 mb-2">
                        <span className="font-medium">Base Target:</span> {currencySymbol}{getClearTargets(actualSalary)?.safetyPot.toFixed(0) || '0'}
                        {getRecommendedSavings(actualSalary) && getRecommendedSavings(actualSalary)!.safetyPot > getClearTargets(actualSalary)!.safetyPot && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            + {currencySymbol}{getRecommendedSavings(actualSalary)!.safetyPot - getClearTargets(actualSalary)!.safetyPot} extra income
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-600 dark:text-red-400 mb-2">
                        <span className="font-medium">Target:</span> Enter valid salary first
                      </div>
                    )}
                    <input
                      type="number"
                      value={safetyPotSaved}
                      onChange={(e) => setSafetyPotSaved(Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        getContributionColor(getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0))
                      }`}
                      placeholder={`Recommended: ${currencySymbol}${getRecommendedSavings(actualSalary)?.safetyPot.toFixed(0) || getClearTargets(actualSalary)?.safetyPot.toFixed(0) || '0'}`}
                      required
                    />
                    {getContributionMessage(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0, 'Safety Pot') && (
                      <div className={`text-xs mt-1 ${
                        getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0) === 'close'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {getContributionMessage(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0, 'Safety Pot')}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Clear Extra Income Distribution */}
                {extraIncome > 0 && (
                  <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      💰 <strong>Extra Income Distribution:</strong> Your extra {currencySymbol}{extraIncome} is automatically added to your savings:
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div className="text-center">
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          +{currencySymbol}{getExtraIncomeBreakdown(extraIncome)?.goal1.toFixed(0) || '0'}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">Goal 1 (48%)</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          +{currencySymbol}{getExtraIncomeBreakdown(extraIncome)?.goal2.toFixed(0) || '0'}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">Goal 2 (32%)</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-900 dark:text-blue-100">
                          +{currencySymbol}{getExtraIncomeBreakdown(extraIncome)?.safetyPot.toFixed(0) || '0'}
                        </div>
                        <div className="text-blue-700 dark:text-blue-300">Safety Pot (20%)</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-center">
                      💡 <strong>Note:</strong> You only need to manually save the base amounts above. Extra income is automatically distributed!
                    </div>
                  </div>
                )}

                {/* Accountability Summary */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    📊 <span className="ml-2">Monthly Accountability Summary</span>
                  </h5>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    💡 Status is based on your base targets only. Extra income is automatically distributed as a bonus!
                  </div>
                  
                  <div className="space-y-2">
                    {/* Shared Expenses Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Shared Expenses:</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0) === 'over-achieved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0) === 'on-track'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0) === 'close'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                          {getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0) === 'over-achieved' ? '🏆 Over-Achieved!' : 
                           getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0) === 'on-track' ? '✅ On Track' : 
                           getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0) === 'close' ? '⚠️ Close' : '❌ Under Target'}
                        </span>
                      </div>
                    </div>

                    {/* Goal 1 Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Goal 1 (Holiday):</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0) === 'over-achieved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0) === 'on-track'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0) === 'close'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                          {getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0) === 'over-achieved' ? '🏆 Over-Achieved!' : 
                           getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0) === 'on-track' ? '✅ On Track' : 
                           getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0) === 'close' ? '⚠️ Close' : '❌ Under Target'}
                        </span>
                      </div>
                    </div>

                    {/* Goal 2 Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Goal 2 (House):</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0) === 'over-achieved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0) === 'on-track'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0) === 'close'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                          {getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0) === 'over-achieved' ? '🏆 Over-Achieved!' : 
                           getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0) === 'on-track' ? '✅ On Track' : 
                           getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0) === 'close' ? '⚠️ Close' : '❌ Under Target'}
                        </span>
                      </div>
                    </div>

                    {/* Safety Pot Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Safety Pot:</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0) === 'over-achieved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0) === 'on-track'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0) === 'close'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }`}>
                          {getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0) === 'over-achieved' ? '🏆 Over-Achieved!' : 
                           getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0) === 'on-track' ? '✅ On Track' : 
                           getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0) === 'close' ? '⚠️ Close' : '❌ Under Target'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Over-Achievement Celebration */}
                  {(() => {
                    const overAchievedCount = [
                      getContributionStatus(sharedExpensesContributed, getClearTargets(actualSalary)?.sharedExpenses || 0),
                      getContributionStatus(goal1Saved, getClearTargets(actualSalary)?.goal1 || 0),
                      getContributionStatus(goal2Saved, getClearTargets(actualSalary)?.goal2 || 0),
                      getContributionStatus(safetyPotSaved, getClearTargets(actualSalary)?.safetyPot || 0)
                    ].filter(status => status === 'over-achieved').length
                    
                    if (overAchievedCount >= 2) {
                      return (
                        <div className="mt-3 p-3 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                          <div className="text-sm text-emerald-800 dark:text-emerald-200 text-center">
                            🎉 <strong>Fantastic Work!</strong> You've over-achieved in {overAchievedCount} categories this month! 
                            Your financial discipline is inspiring! 🌟
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

                  {/* Partner Accountability Notice */}
                  <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="text-sm text-orange-800 dark:text-orange-200">
                      👥 <strong>Partner Accountability:</strong> Your partner will see this summary and can help you stay on track with your financial goals.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Any additional notes about this month's financial reality..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Saving Reality Check...' : '💾 Save Financial Reality Check'}
              </button>
              <button
                type="button"
                onClick={() => setShowProgressForm(false)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Monthly Contribution Recorder */}
      <MonthlyContributionRecorder
        partnerships={partnerships}
        profile={profile}
        partnerProfile={null} // This would need to be passed from parent
        currencySymbol={currencySymbol}
        onContributionRecorded={() => {
          // Refresh data when contribution is recorded
          loadMonthlyProgress()
          if (onProgressUpdate) onProgressUpdate({})
        }}
      />

      {/* Progress History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Progress History
        </h3>
        
        <div className="space-y-3">
          {/* Demo history items - replace with real data */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">✅</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">December 2024</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">All targets met</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-lg">⚠️</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">November 2024</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Partial targets met</div>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Toast */}
      {showAchievement && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-semibold">Achievement Unlocked!</div>
              <div className="text-sm opacity-90">{achievementMessage}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
