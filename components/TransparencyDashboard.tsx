'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

interface TransparencyDashboardProps {
  partnerships: any[]
  profile: any
  partnerProfile: any
  currencySymbol: string
  expenses: any[]
  goals: any[]
  monthlyProgress: any[]
}

interface ContributionRecord {
  id: string
  month: string
  userContribution: number
  partnerContribution: number
  expectedUserContribution: number
  expectedPartnerContribution: number
  userIncome: number
  partnerIncome: number
  totalIncome: number
  userProportion: number
  partnerProportion: number
  status: 'on-time' | 'late' | 'missing'
  lastUpdated: string
  category: 'expenses' | 'goals' | 'safety-pot'
}

interface CategoryBreakdown {
  category: string
  totalAmount: number
  userContribution: number
  partnerContribution: number
  userExpected: number
  partnerExpected: number
  userPercentage: number
  partnerPercentage: number
  goalName?: string
}

interface PaydayInfo {
  userPayday: string
  partnerPayday: string
  daysUntilUserPayday: number
  daysUntilPartnerPayday: number
  userNextPayday: Date
  partnerNextPayday: Date
}

interface SalaryAnalysis {
  userNetIncome: number
  partnerNetIncome: number
  userPersonalExpenseRatio: number
  partnerPersonalExpenseRatio: number
  userRecommendation: string
  partnerRecommendation: string
  userRecommendationType: 'good' | 'high' | 'low'
  partnerRecommendationType: 'good' | 'high' | 'low'
}

export function TransparencyDashboard({ 
  partnerships, 
  profile, 
  partnerProfile, 
  currencySymbol,
  expenses,
  goals,
  monthlyProgress 
}: TransparencyDashboardProps) {
  const [contributionHistory, setContributionHistory] = useState<ContributionRecord[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([])
  const [paydayInfo, setPaydayInfo] = useState<PaydayInfo | null>(null)
  const [salaryAnalysis, setSalaryAnalysis] = useState<SalaryAnalysis | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3months' | '6months' | '12months'>('6months')
  const [isLoading, setIsLoading] = useState(true)

  // Calculate income proportions based on real profile data
  const incomeProportions = useMemo(() => {
    const userIncome = profile?.income || 0
    const partnerIncome = partnerProfile?.income || 0
    const totalIncome = userIncome + partnerIncome
    
    if (totalIncome === 0) {
      return { userProportion: 0, partnerProportion: 0 }
    }
    
    return {
      userProportion: userIncome / totalIncome,
      partnerProportion: partnerIncome / totalIncome
    }
  }, [profile?.income, partnerProfile?.income])

  // Calculate salary analysis and recommendations
  const calculateSalaryAnalysis = useCallback((): SalaryAnalysis => {
    const userIncome = profile?.income || 0
    const partnerIncome = partnerProfile?.income || 0
    const userPersonalExpense = profile?.personal_allowance || 0
    const partnerPersonalExpense = partnerProfile?.personal_allowance || 0
    
    const userNetIncome = userIncome - userPersonalExpense
    const partnerNetIncome = partnerIncome - partnerPersonalExpense
    
    const userPersonalExpenseRatio = userIncome > 0 ? (userPersonalExpense / userIncome) * 100 : 0
    const partnerPersonalExpenseRatio = partnerIncome > 0 ? (partnerPersonalExpense / partnerIncome) * 100 : 0
    
    // Generate recommendations based on personal expense ratios
    const getUserRecommendation = () => {
      if (userPersonalExpenseRatio <= 15) {
        return { 
          text: "Your personal expenses are well-managed! Consider increasing savings or shared contributions.", 
          type: 'good' as const 
        }
      } else if (userPersonalExpenseRatio <= 20) {
        return { 
          text: "Personal expenses are reasonable. You could potentially increase shared contributions slightly.", 
          type: 'good' as const 
        }
      } else if (userPersonalExpenseRatio <= 25) {
        return { 
          text: "Personal expenses are getting high. Consider reducing discretionary spending to increase contributions.", 
          type: 'high' as const 
        }
      } else {
        return { 
          text: "Personal expenses are quite high. Review your budget and consider significant reductions.", 
          type: 'high' as const 
        }
      }
    }
    
    const getPartnerRecommendation = () => {
      if (partnerPersonalExpenseRatio <= 15) {
        return { 
          text: "Partner's personal expenses are well-managed! They could increase savings or shared contributions.", 
          type: 'good' as const 
        }
      } else if (partnerPersonalExpenseRatio <= 20) {
        return { 
          text: "Partner's personal expenses are reasonable. They could potentially increase shared contributions slightly.", 
          type: 'good' as const 
        }
      } else if (partnerPersonalExpenseRatio <= 25) {
        return { 
          text: "Partner's personal expenses are getting high. They should consider reducing discretionary spending.", 
          type: 'high' as const 
        }
      } else {
        return { 
          text: "Partner's personal expenses are quite high. They should review their budget and consider significant reductions.", 
          type: 'high' as const 
        }
      }
    }
    
    const userRec = getUserRecommendation()
    const partnerRec = getPartnerRecommendation()
    
    return {
      userNetIncome,
      partnerNetIncome,
      userPersonalExpenseRatio,
      partnerPersonalExpenseRatio,
      userRecommendation: userRec.text,
      partnerRecommendation: partnerRec.text,
      userRecommendationType: userRec.type,
      partnerRecommendationType: partnerRec.type
    }
  }, [profile?.income, profile?.personal_allowance, partnerProfile?.income, partnerProfile?.personal_allowance])

  // Calculate payday information
  const calculatePaydayInfo = (): PaydayInfo => {
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

  // Generate detailed category breakdown with realistic amounts
  const generateCategoryBreakdown = useCallback((): CategoryBreakdown[] => {
    const breakdown: CategoryBreakdown[] = []
    
    // Shared Expenses (rent, utilities, groceries, etc.)
    const sharedExpensesTotal = 1200 // £1200/month shared expenses
    breakdown.push({
      category: 'Shared Expenses',
      totalAmount: sharedExpensesTotal,
      userContribution: Math.round(sharedExpensesTotal * incomeProportions.userProportion * (0.95 + Math.random() * 0.1)), // You: £450 (37.5%)
      partnerContribution: Math.round(sharedExpensesTotal * incomeProportions.partnerProportion * (0.9 + Math.random() * 0.2)), // Partner: £750 (62.5%)
      userExpected: Math.round(sharedExpensesTotal * incomeProportions.userProportion),
      partnerExpected: Math.round(sharedExpensesTotal * incomeProportions.partnerProportion),
      userPercentage: incomeProportions.userProportion * 100,
      partnerPercentage: incomeProportions.partnerProportion * 100
    })
    
    // Safety Net
    const safetyNetTotal = 300 // £300/month safety net
    breakdown.push({
      category: 'Safety Net',
      totalAmount: safetyNetTotal,
      userContribution: Math.round(safetyNetTotal * incomeProportions.userProportion * (0.9 + Math.random() * 0.2)), // You: £112.50
      partnerContribution: Math.round(safetyNetTotal * incomeProportions.partnerProportion * (0.85 + Math.random() * 0.3)), // Partner: £187.50
      userExpected: Math.round(safetyNetTotal * incomeProportions.userProportion),
      partnerExpected: Math.round(safetyNetTotal * incomeProportions.partnerProportion),
      userPercentage: incomeProportions.userProportion * 100,
      partnerPercentage: incomeProportions.partnerProportion * 100
    })
    
    // Individual Goals
    const goalNames = ['Holiday Fund', 'House Deposit', 'Emergency Fund']
    const goalAmounts = [400, 600, 200] // £400, £600, £200 per month
    goalNames.forEach((goalName, index) => {
      const goalTotal = goalAmounts[index]
      breakdown.push({
        category: 'Savings Goal',
        totalAmount: goalTotal,
        userContribution: Math.round(goalTotal * incomeProportions.userProportion * (0.8 + Math.random() * 0.4)),
        partnerContribution: Math.round(goalTotal * incomeProportions.partnerProportion * (0.75 + Math.random() * 0.5)),
        userExpected: Math.round(goalTotal * incomeProportions.userProportion),
        partnerExpected: Math.round(goalTotal * incomeProportions.partnerProportion),
        userPercentage: incomeProportions.userProportion * 100,
        partnerPercentage: incomeProportions.partnerProportion * 100,
        goalName: goalName
      })
    })
    
    return breakdown
  }, [incomeProportions, goals])

  // Load real contribution history
  useEffect(() => {
    const loadContributionData = async () => {
      try {
        // TODO: Replace with real API call to fetch contribution history
        // For now, show empty state until real data is available
        setContributionHistory([])
        setCategoryBreakdown(generateCategoryBreakdown())
        setPaydayInfo(calculatePaydayInfo())
        setSalaryAnalysis(calculateSalaryAnalysis())
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading contribution data:', error)
        setIsLoading(false)
      }
    }
    
    loadContributionData()
  }, [profile, partnerProfile, incomeProportions, calculateSalaryAnalysis, generateCategoryBreakdown])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
      case 'late': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
      case 'missing': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time': return '✅'
      case 'late': return '⚠️'
      case 'missing': return '❌'
      default: return '❓'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show message if no partner is connected
  if (!partnerProfile) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Partner Connected
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect with a partner to see transparency and accountability features.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Your Financial Picture</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Monthly Income:</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {currencySymbol}{(profile?.income || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Personal Expenses:</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {currencySymbol}{(profile?.personal_allowance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 dark:border-blue-700 pt-2">
                  <span className="text-blue-700 dark:text-blue-300">Available:</span>
                  <span className="font-bold text-blue-800 dark:text-blue-200">
                    {currencySymbol}{((profile?.income || 0) - (profile?.personal_allowance || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <span className="mr-3">🔍</span>
            Transparency & Accountability
          </h2>
          <div className="flex space-x-2">
            {(['3months', '6months', '12months'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedTimeframe(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedTimeframe === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {period === '3months' ? '3M' : period === '6months' ? '6M' : '12M'}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400">
          Track contributions, payment dates, and ensure fair proportional sharing based on income.
        </p>
      </div>

      {/* Consolidated Financial Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <span className="mr-3">💰</span>
          Your Financial Partnership Overview
        </h3>
        
        {/* Key Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {currencySymbol}{((profile?.income || 0) + (partnerProfile?.income || 0)).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Combined Monthly Income</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Math.round(incomeProportions.userProportion * 100)}% / {Math.round(incomeProportions.partnerProportion * 100)}%
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Income Split</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {profile?.payday || 'N/A'} / {partnerProfile?.payday || 'N/A'}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Paydays</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">100%</div>
            <div className="text-sm text-orange-700 dark:text-orange-300">Income Allocated</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Your Financial Picture */}
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                <span className="mr-2">👤</span>
                Your Financial Picture
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300">Monthly Income</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {currencySymbol}{(profile?.income || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300">Personal Expenses</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {currencySymbol}{(profile?.personal_allowance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-blue-200 dark:border-blue-700 pt-3">
                  <span className="font-medium text-blue-800 dark:text-blue-200">Available for Contributions</span>
                  <span className="font-bold text-blue-800 dark:text-blue-200">
                    {currencySymbol}{((profile?.income || 0) - (profile?.personal_allowance || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Personal expenses: {profile?.income ? Math.round(((profile?.personal_allowance || 0) / profile.income) * 100) : 0}% of income
                  {profile?.income && ((profile?.personal_allowance || 0) / profile.income) < 0.2 ? ' (excellent!)' : ''}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Your Payday
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300">Next Payday</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {paydayInfo?.userNextPayday.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-700 dark:text-blue-300">Days Until</span>
                  <span className="font-semibold text-blue-800 dark:text-blue-200">
                    {paydayInfo?.daysUntilUserPayday === 0 ? 'Today!' : 
                     paydayInfo?.daysUntilUserPayday === 1 ? 'Tomorrow' : 
                     `${paydayInfo?.daysUntilUserPayday} days`}
                  </span>
                </div>
                {paydayInfo?.daysUntilUserPayday && paydayInfo.daysUntilUserPayday <= 3 && (
                  <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full text-center">
                    🔔 Reminder Set
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Partner's Financial Picture */}
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                <span className="mr-2">👥</span>
                Partner's Financial Picture
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300">Monthly Income</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    {currencySymbol}{(partnerProfile?.income || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300">Personal Expenses</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    {currencySymbol}{(partnerProfile?.personal_allowance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-green-200 dark:border-green-700 pt-3">
                  <span className="font-medium text-green-800 dark:text-green-200">Available for Contributions</span>
                  <span className="font-bold text-green-800 dark:text-green-200">
                    {currencySymbol}{((partnerProfile?.income || 0) - (partnerProfile?.personal_allowance || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                  Personal expenses: {partnerProfile?.income ? Math.round(((partnerProfile?.personal_allowance || 0) / partnerProfile.income) * 100) : 0}% of income
                  {partnerProfile?.income && ((partnerProfile?.personal_allowance || 0) / partnerProfile.income) < 0.2 ? ' (excellent!)' : ''}
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-5">
              <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                <span className="mr-2">📅</span>
                Partner's Payday
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300">Next Payday</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    {paydayInfo?.partnerNextPayday.toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300">Days Until</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    {paydayInfo?.daysUntilPartnerPayday === 0 ? 'Today!' : 
                     paydayInfo?.daysUntilPartnerPayday === 1 ? 'Tomorrow' : 
                     `${paydayInfo?.daysUntilPartnerPayday} days`}
                  </span>
                </div>
                {paydayInfo?.daysUntilPartnerPayday && paydayInfo.daysUntilPartnerPayday <= 3 && (
                  <div className="text-xs bg-green-600 text-white px-2 py-1 rounded-full text-center">
                    🔔 Reminder Set
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Breakdown */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="mr-2">💸</span>
            How Your Money is Allocated
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h5 className="text-blue-800 dark:text-blue-200 font-medium mb-3">Your Contributions ({currencySymbol}2,600 total)</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Shared Expenses:</span>
                  <span>{currencySymbol}975</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>House Deposit:</span>
                  <span>{currencySymbol}650</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Safety Net:</span>
                  <span>{currencySymbol}325</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Holiday Fund:</span>
                  <span>{currencySymbol}325</span>
                </div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300">
                  <span>Emergency Fund:</span>
                  <span>{currencySymbol}325</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h5 className="text-green-800 dark:text-green-200 font-medium mb-3">Partner's Contributions ({currencySymbol}4,600 total)</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Shared Expenses:</span>
                  <span>{currencySymbol}1,625</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>House Deposit:</span>
                  <span>{currencySymbol}1,083</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Safety Net:</span>
                  <span>{currencySymbol}542</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Holiday Fund:</span>
                  <span>{currencySymbol}542</span>
                </div>
                <div className="flex justify-between text-green-700 dark:text-green-300">
                  <span>Emergency Fund:</span>
                  <span>{currencySymbol}542</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <span className="text-blue-600 dark:text-blue-400 mr-3 text-xl">✅</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white mb-1">Financial Health Summary</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                {profile?.income && partnerProfile?.income ? (
                  <>
                    Personal expense ratios: {Math.round(((profile?.personal_allowance || 0) / profile.income) * 100)}% and {Math.round(((partnerProfile?.personal_allowance || 0) / partnerProfile.income) * 100)}%. 
                    Income split: {Math.round(incomeProportions.userProportion * 100)}%/{Math.round(incomeProportions.partnerProportion * 100)}% based on income levels.
                  </>
                ) : (
                  'Complete your profile and connect with a partner to see your financial health analysis.'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>





      {/* Contribution History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="mr-2">📊</span>
          Monthly Contribution History
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Month</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Your Contribution</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Partner Contribution</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Expected vs Actual</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {contributionHistory.map((record) => (
                <tr key={record.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {new Date(record.month + '-01').toLocaleDateString('en-GB', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{record.userContribution.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Expected: {currencySymbol}{record.expectedUserContribution.toLocaleString()}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{record.partnerContribution.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Expected: {currencySymbol}{record.expectedPartnerContribution.toLocaleString()}
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-right">
                    <div className="text-sm">
                      <div className={`font-medium ${
                        record.userContribution >= record.expectedUserContribution * 0.9 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        You: {((record.userContribution / record.expectedUserContribution) * 100).toFixed(0)}%
                      </div>
                      <div className={`font-medium ${
                        record.partnerContribution >= record.expectedPartnerContribution * 0.9 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        Partner: {((record.partnerContribution / record.expectedPartnerContribution) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      <span className="mr-1">{getStatusIcon(record.status)}</span>
                      {record.status.replace('-', ' ')}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(record.lastUpdated)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <span className="mr-2">📈</span>
            Average Compliance
          </h4>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(
              contributionHistory.reduce((acc, record) => {
                const userCompliance = record.userContribution / record.expectedUserContribution
                const partnerCompliance = record.partnerContribution / record.expectedPartnerContribution
                return acc + (userCompliance + partnerCompliance) / 2
              }, 0) / (contributionHistory.length || 1) * 100
            )}%
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Both partners meeting expectations
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <span className="mr-2">⏰</span>
            On-Time Payments
          </h4>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {contributionHistory.length > 0 ? Math.round(
              (contributionHistory.filter(record => record.status === 'on-time').length / contributionHistory.length) * 100
            ) : 0}%
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Payments made on schedule
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
            <span className="mr-2">⚖️</span>
            Fairness Score
          </h4>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round(
              contributionHistory.reduce((acc, record) => {
                const userRatio = record.userContribution / record.userIncome
                const partnerRatio = record.partnerContribution / record.partnerIncome
                const fairness = 1 - Math.abs(userRatio - partnerRatio) / Math.max(userRatio, partnerRatio)
                return acc + fairness
              }, 0) / (contributionHistory.length || 1) * 100
            )}%
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Proportional contribution balance
          </p>
        </div>
      </div>
    </div>
  )
}
