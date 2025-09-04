'use client'

import { useState, useEffect, useCallback } from 'react'

interface MonthlySalaryTrackerProps {
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
  onSalaryUpdate: (data: any) => void
}

export function MonthlySalaryTracker({
  partnerships,
  profile,
  user,
  currencySymbol,
  onSalaryUpdate
}: MonthlySalaryTrackerProps) {
  // Utility function to round monetary values to 2 decimal places
  const roundMoney = (amount: number) => Math.round(amount * 100) / 100
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    month: '',
    year: '',
    actualSalary: '',
    extraIncome: '',
    extraIncomeSource: '',
    expensesContributed: '',
    savingsContributed: '',
    safetyNetContributed: ''
  })
  const [currentMonth, setCurrentMonth] = useState('')
  const [currentYear, setCurrentYear] = useState('')
  const [monthlyData, setMonthlyData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'tracking'>('overview')

  const activePartnership = partnerships.find(p => p.status === 'active')

  useEffect(() => {
    const now = new Date()
    const month = now.toLocaleString('default', { month: 'long' })
    const year = now.getFullYear().toString()
    
    setCurrentMonth(month)
    setCurrentYear(year)
    setFormData(prev => ({
      ...prev,
      month,
      year,
      actualSalary: profile?.income?.toString() || '0' // Auto-populate with expected salary
    }))
  }, [profile])

  // Calculate next payday for a given user
  const getNextPayday = (payday: number) => {
    const today = new Date()
    const currentDay = today.getDate()
    
    if (currentDay >= payday) {
      // Payday has passed this month, get next month's payday
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, payday)
      return nextMonth
    } else {
      // Payday is this month
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), payday)
      return thisMonth
    }
  }

  // Calculate days until payday
  const getDaysUntilPayday = (payday: number) => {
    const nextPayday = getNextPayday(payday)
    const today = new Date()
    const diffTime = nextPayday.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Check if it's payday (first few days of month)
  const isPayday = () => {
    const today = new Date()
    const dayOfMonth = today.getDate()
    return dayOfMonth <= 7 // First week of month
  }

  // Check if user needs to complete monthly tracking
  const needsMonthlyTracking = () => {
    if (!monthlyData) return true
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    const currentYear = new Date().getFullYear().toString()
    return monthlyData.month !== currentMonth || monthlyData.year !== currentYear
  }

  // Payday notification
  const PaydayNotification = () => {
    if (!isPayday() || !needsMonthlyTracking()) return null

    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💰</div>
            <div>
              <h4 className="font-semibold text-green-800">It&apos;s Payday Week!</h4>
              <p className="text-sm text-green-700">
                Time to track your monthly salary and contributions for accountability.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tracking')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Track This Month
          </button>
        </div>
      </div>
    )
  }

  // Payday Tracker Component
  const PaydayTracker = () => {
    // Mock payday dates - in real app, these would come from user profiles
    const yourPayday = 25 // 25th of each month
    const partnerPayday = 17 // 17th of each month
    
    const yourNextPayday = getNextPayday(yourPayday)
    const partnerNextPayday = getNextPayday(partnerPayday)
    const daysUntilYourPayday = getDaysUntilPayday(yourPayday)
    const daysUntilPartnerPayday = getDaysUntilPayday(partnerPayday)

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <span className="mr-2">📅</span>
          Next Payday Tracker
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Your Next Payday */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="font-semibold text-blue-800 dark:text-blue-100 mb-2 flex items-center">
              <span className="mr-2">👤</span>
              Your Next Payday
            </h5>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {daysUntilYourPayday === 0 ? 'Today!' : `In ${daysUntilYourPayday} days`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {yourNextPayday.toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                {daysUntilYourPayday === 0 ? '🎉 Payday!' : '⏰ Coming soon'}
              </div>
            </div>
          </div>
          
          {/* Partner's Next Payday */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h5 className="font-semibold text-green-800 dark:text-green-100 mb-2 flex items-center">
              <span className="mr-2">👥</span>
              Partner&apos;s Next Payday
            </h5>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {daysUntilPartnerPayday === 0 ? 'Today!' : `In ${daysUntilPartnerPayday} days`}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {partnerNextPayday.toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                {daysUntilPartnerPayday === 0 ? '🎉 Payday!' : '⏰ Coming soon'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Coordination Reminder */}
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-600 dark:text-yellow-400">💡</span>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Coordination Reminder:</p>
              <p>Plan your contributions together! When both partners get paid, complete your monthly tracking to stay accountable.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Simplified Accountability Summary (for dashboard)
  const AccountabilitySummary = () => {
    if (!monthlyData) return null

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Monthly Accountability Summary
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Your Status */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <h5 className="font-semibold text-blue-800 dark:text-blue-100 mb-2">You ✅</h5>
            <div className="text-sm space-y-1">
              <p><strong>Salary:</strong> {currencySymbol}{monthlyData.actualSalary}</p>
              {monthlyData.extraIncome > 0 && (
                <p><strong>Extra:</strong> {currencySymbol}{monthlyData.extraIncome}</p>
              )}
              <p><strong>Status:</strong> <span className="text-green-600 dark:text-green-400">All buckets: On target</span></p>
            </div>
          </div>
          
          {/* Partner Status */}
          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
            <h5 className="font-semibold text-green-800 mb-2">Partner ⏳</h5>
            <div className="text-sm space-y-1 text-gray-600">
              <p>Waiting for partner to complete monthly tracking</p>
              <p className="text-xs text-gray-500">This will show their salary and contributions once completed</p>
            </div>
          </div>
        </div>

        {/* Partner Performance Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">🤝</span>
            Partner Performance Summary
          </h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">You:</p>
              <p className="text-green-600">Expenses: On Target</p>
              <p className="text-green-600">Savings: On Target</p>
              <p className="text-green-600">Safety Net: On Target</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Partner:</p>
              <p className="text-red-600">Expenses: Under Target</p>
              <p className="text-green-600">Savings: On Target</p>
              <p className="text-green-600">Safety Net: On Target</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Calculate expected contributions based on profile and form data
  const calculateExpectedContributions = useCallback(() => {
    if (!profile || !activePartnership) return null

    // Use actual salary from form, or fall back to profile
    const actualSalary = parseFloat(formData.actualSalary) || profile.income || 0
    
    // Auto-calculate extra income based on difference from expected salary
    const expectedSalary = profile.income || 0
    const autoExtraIncome = actualSalary > expectedSalary ? actualSalary - expectedSalary : 0
    
    // Update form data with auto-calculated extra income
    if (autoExtraIncome > 0 && !formData.extraIncome) {
      setFormData(prev => ({ ...prev, extraIncome: autoExtraIncome.toString() }))
    }
    
    const totalIncome = actualSalary
    const extraIncome = parseFloat(formData.extraIncome) || autoExtraIncome
    
    // For now, use mock partner data - in real app, fetch from API
    const partnerIncome = 3000 // Mock data
    const partnerPersonalAllowance = 400
    
    // IMPORTANT: Expenses stay FIXED based on base salary only (no extra income)
    const baseSalary = profile.income || 0
    const baseDisposableIncome = baseSalary - (profile.personal_allowance || 0)
    const partnerDisposableIncome = partnerIncome - partnerPersonalAllowance
    const totalBaseDisposableIncome = baseDisposableIncome + partnerDisposableIncome

    if (totalBaseDisposableIncome <= 0) return null

    const userBaseShare = baseDisposableIncome / totalBaseDisposableIncome

    // Calculate base monthly allocations (70% expenses, 20% savings, 10% safety net)
    // EXPENSES STAY FIXED based on base salary only
    let totalMonthlyExpenses = 1206.96 // Fixed amount - no extra income affects this
    let totalMonthlySavings = totalBaseDisposableIncome * 0.2
    let totalMonthlySafetyNet = totalBaseDisposableIncome * 0.1

    // Cap expenses at actual amount needed
    const actualExpensesNeeded = 1206.96
    const expensesOverflow = totalMonthlyExpenses - actualExpensesNeeded
    
    if (expensesOverflow > 0) {
      // Cap expenses and redistribute overflow to savings and safety net
      totalMonthlyExpenses = actualExpensesNeeded
      totalMonthlySavings += roundMoney(expensesOverflow * 0.7)
      totalMonthlySafetyNet += roundMoney(expensesOverflow * 0.3)
    }

    // Base contributions (from base salary only - no extra income)
    const baseExpenses = totalMonthlyExpenses * userBaseShare
    const baseSavings = totalMonthlySavings * userBaseShare
    const baseSafetyNet = totalMonthlySafetyNet * userBaseShare
    
    // Extra income goes ONLY to savings and safety net (proportionally split)
    const extraIncomeSavings = extraIncome * 0.7 // 70% of extra to savings
    const extraIncomeSafetyNet = extraIncome * 0.3 // 30% of extra to safety net

    return {
      expenses: baseExpenses, // Fixed - no extra income affects expenses
      savings: baseSavings + extraIncomeSavings, // Base + extra income
      safetyNet: baseSafetyNet + extraIncomeSafetyNet, // Base + extra income
      userShare: userBaseShare,
      totalMonthlyExpenses,
      totalMonthlySavings,
      totalMonthlySafetyNet,
      expensesOverflow,
      baseExpenses,
      baseSavings,
      baseSafetyNet,
      extraIncomeSavings,
      extraIncomeSafetyNet
    }
  }, [profile, activePartnership, formData.actualSalary, formData.extraIncome])

  const [expectedContributions, setExpectedContributions] = useState<any>(null)

  // Recalculate expected contributions when form data changes
  useEffect(() => {
    const newExpectedContributions = calculateExpectedContributions()
    setExpectedContributions(newExpectedContributions)
  }, [formData.actualSalary, formData.extraIncome, calculateExpectedContributions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // In real app, save to database
      const salaryData = {
        ...formData,
        userId: user.id,
        partnershipId: activePartnership.id,
        timestamp: new Date().toISOString(),
        expectedContributions,
        actualContributions: {
          expenses: parseFloat(formData.expensesContributed) || 0,
          savings: parseFloat(formData.savingsContributed) || 0,
          safetyNet: parseFloat(formData.safetyNetContributed) || 0
        }
      }

      // Mock API call - replace with real endpoint
      console.log('Saving salary data:', salaryData)
      
      // Update local state
      setMonthlyData(salaryData)
      setShowForm(false)
      
      // Notify parent component
      onSalaryUpdate(salaryData)
      
      // Show success message
      alert('Monthly salary tracking completed! Your accountability log has been updated.')
      
    } catch (error) {
      console.error('Error saving salary data:', error)
      alert('Error saving salary data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getContributionStatus = (actual: number, expected: number) => {
    if (actual >= expected) return 'on-target'
    if (actual >= expected * 0.8) return 'close'
    return 'under-target'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-target': return 'text-green-600 bg-green-50 border-green-200'
      case 'close': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'under-target': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-target': return '✅'
      case 'close': return '⚠️'
      case 'under-target': return '❌'
      default: return '📊'
    }
  }

  if (!activePartnership || !profile) return null

  return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-700 flex items-center">
          <span className="mr-2">💰</span>
          Monthly Salary Tracker
        </h3>
        
        {!monthlyData && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Track This Month
          </button>
        )}
      </div>

      {/* Payday Notification */}
      <PaydayNotification />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tracking'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Monthly Tracking
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' ? (
        <div>
          {/* Payday Tracker - Always Show */}
          <PaydayTracker />
          
          {/* Current Month Status */}
          {monthlyData ? (
            <AccountabilitySummary />
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Track Your Monthly Progress Together</h4>
              <p className="text-sm text-gray-600 mb-4">
                Complete your monthly salary tracking to see accountability summaries and keep each other on track.
                <br />
                <span className="text-blue-600 font-medium">Full transparency builds trust and ensures fair contributions!</span>
              </p>
              <button
                onClick={() => setActiveTab('tracking')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Start Monthly Tracking
              </button>
            </div>
          )}
        </div>
      ) : (
        showForm && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Month/Year Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={formData.month}
                  onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Month</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2025"
                  required
                />
              </div>
            </div>

            {/* Salary Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Actual Salary Received {currencySymbol} (Pre-filled)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.actualSalary}
                            onChange={(e) => {
                              const newSalary = e.target.value
                              const expectedSalary = profile?.income || 0
                              const extraIncome = parseFloat(newSalary) > expectedSalary ? parseFloat(newSalary) - expectedSalary : 0
                              
                              setFormData(prev => ({ 
                                ...prev, 
                                actualSalary: newSalary,
                                extraIncome: extraIncome > 0 ? extraIncome.toString() : '0'
                              }))
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            required
                          />
                          <p className="text-xs text-blue-600 mt-1">
                            <strong>Pre-filled with expected salary:</strong> {currencySymbol}{profile?.income || 0}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Adjust this amount if your actual salary differs
                          </p>
                        </div>
              
                                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Extra Income {currencySymbol} (Auto-calculated)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={formData.extraIncome}
                            onChange={(e) => setFormData(prev => ({ ...prev, extraIncome: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0.00"
                            readOnly={parseFloat(formData.actualSalary) > (profile?.income || 0)}
                          />
                          {parseFloat(formData.actualSalary) > (profile?.income || 0) && (
                            <p className="text-xs text-green-600 mt-1">
                              Auto-calculated from salary difference
                            </p>
                          )}
                        </div>
            </div>

            {parseFloat(formData.extraIncome) > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source of Extra Income
                </label>
                <input
                  type="text"
                  value={formData.extraIncomeSource}
                  onChange={(e) => setFormData(prev => ({ ...prev, extraIncomeSource: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bonus, overtime, side hustle, etc."
                />
              </div>
            )}

                    {/* Comprehensive Partner Income Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
            <span className="mr-2">🤝</span>
            Partner Income Breakdown & Proportional Split
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Your Complete Breakdown */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-blue-200 dark:border-blue-600">
              <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center">
                <span className="mr-2">👤</span>
                You - Complete Breakdown
              </h5>
              
              <div className="space-y-3">
                {/* Income Section */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h6 className="font-medium text-blue-800 mb-2">Income Details</h6>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p><strong>Expected Salary:</strong></p>
                      <p className="text-gray-600">{currencySymbol}{profile?.income || 0}</p>
                    </div>
                    <div>
                      <p><strong>Actual Salary:</strong></p>
                      <p className="text-blue-600 font-medium">{currencySymbol}{formData.actualSalary || profile?.income || 0}</p>
                    </div>
                    <div>
                      <p><strong>Extra Income:</strong></p>
                      <p className="text-green-600 font-medium">{currencySymbol}{formData.extraIncome || '0.00'}</p>
                    </div>
                    <div>
                      <p><strong>Total Income:</strong></p>
                      <p className="text-blue-800 font-bold">{currencySymbol}{((parseFloat(formData.actualSalary) || profile?.income || 0) + (parseFloat(formData.extraIncome) || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Allowance & Disposable */}
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h6 className="font-medium text-blue-800 mb-2">Personal Allowance & Disposable</h6>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p><strong>Personal Allowance:</strong></p>
                      <p className="text-gray-600">{currencySymbol}{profile?.personal_allowance || 0}</p>
                    </div>
                    <div>
                      <p><strong>Disposable Income:</strong></p>
                      <p className="text-blue-800 font-bold">{currencySymbol}{((parseFloat(formData.actualSalary) || profile?.income || 0) + (parseFloat(formData.extraIncome) || 0) - (profile?.personal_allowance || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Proportional Share */}
                {expectedContributions && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h6 className="font-medium text-blue-800 mb-2">Your Proportional Share</h6>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-800">
                        {(expectedContributions.userShare * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">of total disposable income</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Partner's Complete Breakdown */}
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-green-200 dark:border-green-600">
              <h5 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center">
                <span className="mr-2">👥</span>
                Partner - Complete Breakdown
              </h5>
              
              <div className="space-y-3">
                {/* Income Section */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <h6 className="font-medium text-green-800 mb-2">Income Details</h6>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p><strong>Expected Salary:</strong></p>
                      <p className="text-gray-600">{currencySymbol}3000</p>
                    </div>
                    <div>
                      <p><strong>Actual Salary:</strong></p>
                      <p className="text-green-600 font-medium">{currencySymbol}3000</p>
                    </div>
                    <div>
                      <p><strong>Extra Income:</strong></p>
                      <p className="text-green-600 font-medium">{currencySymbol}0.00</p>
                    </div>
                    <div>
                      <p><strong>Total Income:</strong></p>
                      <p className="text-green-800 font-bold">{currencySymbol}3000.00</p>
                    </div>
                  </div>
                </div>
                
                {/* Allowance & Disposable */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <h6 className="font-medium text-green-800 mb-2">Personal Allowance & Disposable</h6>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p><strong>Personal Allowance:</strong></p>
                      <p className="text-gray-600">{currencySymbol}400</p>
                    </div>
                    <div>
                      <p><strong>Disposable Income:</strong></p>
                      <p className="text-green-800 font-bold">{currencySymbol}2600.00</p>
                    </div>
                  </div>
                </div>
                
                {/* Proportional Share */}
                {expectedContributions && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h6 className="font-medium text-green-800 mb-2">Partner&apos;s Proportional Share</h6>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-800">
                        {((1 - expectedContributions.userShare) * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">of total disposable income</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Total Combined Income Summary */}
          {expectedContributions && (
            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <h6 className="font-medium text-purple-800 mb-3 flex items-center">
                <span className="mr-2">📊</span>
                Total Combined Financial Picture
              </h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Total Combined Income</p>
                  <p className="text-xl font-bold text-purple-800">
                    {currencySymbol}{((parseFloat(formData.actualSalary) || profile?.income || 0) + (parseFloat(formData.extraIncome) || 0) + 3000).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Both partners combined</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Total Personal Allowances</p>
                  <p className="text-xl font-bold text-purple-800">
                    {currencySymbol}{((profile?.personal_allowance || 0) + 400).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Both partners combined</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Total Disposable Income</p>
                  <p className="text-xl font-bold text-purple-800">
                    {currencySymbol}{((parseFloat(formData.actualSalary) || profile?.income || 0) + (parseFloat(formData.extraIncome) || 0) - (profile?.personal_allowance || 0) + 2600).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Available for shared expenses & savings</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Collaborative Transparency Note */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h6 className="font-medium text-yellow-800 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              Why This Transparency Matters
            </h6>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>• <strong>Fairness:</strong> Both partners can see exactly how contributions are calculated</p>
              <p>• <strong>Accountability:</strong> Clear visibility of income and personal allowances</p>
              <p>• <strong>Collaboration:</strong> Understanding each other&apos;s financial situation builds trust</p>
              <p>• <strong>Motivation:</strong> Seeing the proportional split encourages honest sharing</p>
            </div>
          </div>
        </div>

        {/* Integrated Financial Overview & Contributions */}
        {expectedContributions && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Complete Financial Overview & Monthly Contributions
            </h4>
            
            {/* Partner Financial Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Your Financial Picture */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <span className="mr-2">👤</span>
                  Your Financial Picture
                </h5>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-blue-200 dark:border-blue-600">
                    <h6 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Income & Allowance</h6>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Base Salary:</p>
                        <p className="font-medium text-blue-600">{currencySymbol}{profile?.income || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Extra Income:</p>
                        <p className="font-medium text-green-600">{currencySymbol}{formData.extraIncome || '0.00'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Personal Allowance:</p>
                        <p className="font-medium text-red-600">-{currencySymbol}{profile?.personal_allowance || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Disposable Income:</p>
                        <p className="font-bold text-blue-800">{currencySymbol}{((parseFloat(formData.actualSalary) || profile?.income || 0) + (parseFloat(formData.extraIncome) || 0) - (profile?.personal_allowance || 0)).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-blue-200 dark:border-blue-600">
                    <h6 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Your Monthly Contributions</h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expenses:</span>
                        <span className="font-medium text-blue-600">{currencySymbol}{expectedContributions.baseExpenses?.toFixed(2) || expectedContributions.expenses.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Savings:</span>
                        <span className="font-medium text-purple-600">{currencySymbol}{expectedContributions.savings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Safety Net:</span>
                        <span className="font-medium text-orange-600">{currencySymbol}{expectedContributions.safetyNet.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-blue-700">Total Monthly:</span>
                          <span className="text-blue-700">{currencySymbol}{(expectedContributions.baseExpenses + expectedContributions.savings + expectedContributions.safetyNet).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Partner's Financial Picture */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-semibold text-green-800 mb-3 flex items-center">
                  <span className="mr-2">👥</span>
                  Partner&apos;s Financial Picture
                </h5>
                
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-green-200 dark:border-green-600">
                    <h6 className="font-medium text-green-800 dark:text-green-200 mb-2">Income & Allowance</h6>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Base Salary:</p>
                        <p className="font-medium text-green-600">{currencySymbol}3000</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Extra Income:</p>
                        <p className="font-medium text-green-600">{currencySymbol}0.00</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Personal Allowance:</p>
                        <p className="font-medium text-red-600">-{currencySymbol}400</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Disposable Income:</p>
                        <p className="font-bold text-green-800">{currencySymbol}2600.00</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-green-200 dark:border-green-600">
                    <h6 className="font-medium text-green-800 dark:text-green-200 mb-2">Partner&apos;s Monthly Contributions</h6>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expenses:</span>
                        <span className="font-medium text-blue-600">{currencySymbol}{(expectedContributions.totalMonthlyExpenses * (1 - expectedContributions.userShare)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Savings:</span>
                        <span className="font-medium text-purple-600">{currencySymbol}{((expectedContributions.totalMonthlySavings * (1 - expectedContributions.userShare)) + (parseFloat(formData.extraIncome || '0') * 0.7 * (1 - expectedContributions.userShare))).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Safety Net:</span>
                        <span className="text-orange-600">{currencySymbol}{((expectedContributions.totalMonthlySafetyNet * (1 - expectedContributions.userShare)) + (parseFloat(formData.extraIncome || '0') * 0.3 * (1 - expectedContributions.userShare))).toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-green-700">Total Monthly:</span>
                          <span className="text-green-700">{currencySymbol}{((expectedContributions.totalMonthlyExpenses * (1 - expectedContributions.userShare)) + ((expectedContributions.totalMonthlySavings * (1 - expectedContributions.userShare)) + (parseFloat(formData.extraIncome || '0') * 0.7 * (1 - expectedContributions.userShare))) + ((expectedContributions.totalMonthlySafetyNet * (1 - expectedContributions.userShare)) + (parseFloat(formData.extraIncome || '0') * 0.3 * (1 - expectedContributions.userShare)))).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Combined Summary & Smart Allocation */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center">
                <span className="mr-2">🤝</span>
                Combined Monthly Summary
              </h5>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Expenses</p>
                  <p className="text-lg font-bold text-blue-600">{currencySymbol}{expectedContributions.totalMonthlyExpenses.toFixed(2)}</p>
                  <p className="text-xs text-blue-600">Fixed monthly amount</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Savings</p>
                  <p className="text-lg font-bold text-purple-600">{currencySymbol}{expectedContributions.totalMonthlySavings.toFixed(2)}</p>
                  <p className="text-xs text-purple-600">Goals & investments</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Total Safety Net</p>
                  <p className="text-lg font-bold text-orange-600">{currencySymbol}{expectedContributions.totalMonthlySafetyNet.toFixed(2)}</p>
                  <p className="text-xs text-orange-600">Emergency fund</p>
                </div>
              </div>
              
              {/* Extra Income Impact - Integrated */}
              {parseFloat(formData.extraIncome) > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h6 className="font-medium text-green-800 mb-2 flex items-center">
                    <span className="mr-2">💰</span>
                    Extra Income Smart Allocation
                  </h6>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Total Extra Income:</p>
                      <p className="font-bold text-green-600">{currencySymbol}{formData.extraIncome}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Allocation Strategy:</p>
                      <p className="text-purple-600">70% to Savings: {currencySymbol}{expectedContributions.extraIncomeSavings?.toFixed(2) || '0.00'}</p>
                      <p className="text-orange-600">30% to Safety Net: {currencySymbol}{expectedContributions.extraIncomeSafetyNet?.toFixed(2) || '0.00'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    <strong>Smart Design:</strong> Your monthly expenses stay fixed at {currencySymbol}{expectedContributions.baseExpenses?.toFixed(2) || expectedContributions.expenses.toFixed(2)}. 
                    Extra income builds wealth through savings and security through safety net.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

            {/* Actual Contributions - Auto-populated */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-700">Confirm Your Contributions</h4>
              <p className="text-sm text-gray-600">
                These amounts are pre-filled based on your expected contributions. Adjust if needed:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expenses {currencySymbol}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.expensesContributed || expectedContributions?.expenses.toFixed(2) || '0.00'}
                    onChange={(e) => setFormData(prev => ({ ...prev, expensesContributed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected: {currencySymbol}{expectedContributions?.baseExpenses?.toFixed(2) || expectedContributions?.expenses.toFixed(2)}</p>
                  <p className="text-xs text-blue-600">Fixed from base salary only</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Savings {currencySymbol}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.savingsContributed || expectedContributions?.savings.toFixed(2) || '0.00'}
                    onChange={(e) => setFormData(prev => ({ ...prev, savingsContributed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected: {currencySymbol}{expectedContributions?.savings.toFixed(2)}</p>
                  <div className="text-xs text-gray-600">
                    <p>Base: {currencySymbol}{expectedContributions?.baseSavings?.toFixed(2) || '0.00'}</p>
                    {expectedContributions?.extraIncomeSavings > 0 && (
                      <p className="text-green-600">+ Extra: {currencySymbol}{expectedContributions?.extraIncomeSavings.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Safety Net {currencySymbol}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.safetyNetContributed || expectedContributions?.safetyNet.toFixed(2) || '0.00'}
                    onChange={(e) => setFormData(prev => ({ ...prev, safetyNetContributed: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Expected: {currencySymbol}{expectedContributions?.safetyNet.toFixed(2)}</p>
                  <div className="text-xs text-gray-600">
                    <p>Base: {currencySymbol}{expectedContributions?.baseSafetyNet?.toFixed(2) || '0.00'}</p>
                    {expectedContributions?.extraIncomeSavings > 0 && (
                      <p className="text-green-600">+ Extra: {currencySymbol}{expectedContributions?.extraIncomeSafetyNet?.toFixed(2) || '0.00'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Confirm Monthly Contributions'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )
      )}

      {/* Motivation Message */}
      {!monthlyData && !showForm && (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🎯</div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">Track Your Monthly Progress Together</h4>
          <p className="text-sm text-gray-600 mb-4">
            Your salary is pre-filled with your expected amount. Simply adjust if needed and confirm your contributions.
            <br />
            <span className="text-blue-600 font-medium">Full transparency builds trust and ensures fair contributions!</span>
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            Start Monthly Tracking
          </button>
        </div>
      )}
    </div>
  )
}
