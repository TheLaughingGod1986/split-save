'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { formatCurrency } from '@/lib/monthly-progress-utils'

interface AnalyticsData {
  summary: {
    totalNetWorth: number
    monthlySavingsRate: number
    goalProgressRate: number
    partnerContributionRatio: number
    financialHealthScore: number
    riskAssessment: 'low' | 'medium' | 'high'
  }
  trends: {
    monthly: Array<{ month: string; income: number; expenses: number; savings: number }>
    quarterly: Array<{ quarter: string; netWorth: number; goalProgress: number }>
    yearly: Array<{ year: string; totalSavings: number; totalExpenses: number }>
  }
  categories: {
    expenses: Array<{ category: string; amount: number; percentage: number; trend: 'up' | 'down' | 'stable' }>
    savings: Array<{ goal: string; current: number; target: number; progress: number; priority: string }>
    income: Array<{ source: string; amount: number; frequency: string; reliability: number }>
  }
  insights: {
    topPerformingGoals: Array<{ name: string; progress: number; efficiency: number }>
    spendingOptimization: Array<{ category: string; potentialSavings: number; recommendations: string[] }>
    partnerPerformance: Array<{ metric: string; score: number; trend: 'improving' | 'stable' | 'declining' }>
  }
  forecasts: {
    nextMonth: { expenses: number; savings: number; netWorth: number }
    nextQuarter: { goalCompletions: number; expectedSavings: number }
    nextYear: { projectedNetWorth: number; goalAchievementRate: number }
  }
}

interface AdvancedAnalyticsDashboardProps {
  userId: string
  goals: any[]
  contributions: any[]
  expenses: any[]
  partnerships: any[]
  achievements: any[]
}

export function AdvancedAnalyticsDashboard({
  userId,
  goals,
  contributions,
  expenses,
  partnerships,
  achievements
}: AdvancedAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly')
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'trends' | 'categories' | 'insights' | 'forecasts'>('overview')
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
    end: new Date()
  })





  const calculateNetWorth = useCallback((): number => {
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    return totalContributions - totalExpenses
  }, [contributions, expenses])

  const calculateMonthlySavingsRate = useCallback((): number => {
    const monthlyIncome: number = 5000 // Mock income - would come from user profile
    const monthlyExpenses = expenses
      .filter(e => new Date(e.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .reduce((sum, e) => sum + e.amount, 0)
    
    if (monthlyIncome === 0) return 0
    return ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
  }, [expenses])

  const calculateGoalProgressRate = useCallback((): number => {
    if (goals.length === 0) return 0
    
    const totalProgress = goals.reduce((sum, goal) => {
      const progress = goal.current_amount / goal.target_amount
      return sum + progress
    }, 0)
    
    return (totalProgress / goals.length) * 100
  }, [goals])



  const calculatePartnerContributionRatio = useCallback((): number => {
    if (partnerships.length === 0) return 0
    
    const totalPartnerContributions = partnerships.reduce((sum, partnership) => {
      return sum + (partnership.total_contributions || 0)
    }, 0)
    
    const totalMyContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    
    if (totalMyContributions === 0) return 0
    return (totalPartnerContributions / totalMyContributions) * 100
  }, [partnerships, contributions])

  const calculateFinancialHealthScore = useCallback((monthlySavingsRate: number, goalProgressRate: number): number => {
    let score = 100
    
    // Deduct for low savings rate
    if (monthlySavingsRate < 20) score -= 20
    else if (monthlySavingsRate < 30) score -= 10
    
    // Deduct for low goal progress
    if (goalProgressRate < 50) score -= 25
    else if (goalProgressRate < 75) score -= 15
    
    // Deduct for high expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    if (totalExpenses > totalContributions * 2) score -= 20
    
    // Add for achievements
    const achievementBonus = Math.min(20, achievements.length * 2)
    score += achievementBonus
    
    return Math.max(0, Math.min(100, score))
  }, [expenses, contributions, achievements])

  const assessRiskLevel = useCallback((monthlySavingsRate: number, goalProgressRate: number, financialHealthScore: number): 'low' | 'medium' | 'high' => {
    const savingsRate = monthlySavingsRate
    const goalProgress = goalProgressRate
    const healthScore = financialHealthScore
    
    if (savingsRate >= 30 && goalProgress >= 75 && healthScore >= 80) return 'low'
    if (savingsRate >= 20 && goalProgress >= 50 && healthScore >= 60) return 'medium'
    return 'high'
  }, [])

  const generateTrendData = useCallback(() => {
    const monthly = []
    const quarterly = []
    const yearly = []
    
    // Generate monthly data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
      const monthKey = date.toISOString().slice(0, 7)
      
      const monthExpenses = expenses
        .filter(e => e.created_at?.startsWith(monthKey))
        .reduce((sum, e) => sum + e.amount, 0)
      
      const monthContributions = contributions
        .filter(c => c.created_at?.startsWith(monthKey))
        .reduce((sum, c) => sum + c.amount, 0)
      
      const monthIncome: number = 5000 // Mock income
      const monthSavings = monthIncome - monthExpenses
      
      monthly.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthSavings
      })
    }
    
    // Generate quarterly data
    for (let i = 3; i >= 0; i--) {
      const quarter = Math.ceil((new Date().getMonth() + 1) / 3) - i
      const year = new Date().getFullYear()
      
      quarterly.push({
        quarter: `Q${quarter} ${year}`,
        netWorth: Math.random() * 10000 + 5000, // Mock data
        goalProgress: Math.random() * 100 // Mock data
      })
    }
    
    // Generate yearly data
    for (let i = 2; i >= 0; i--) {
      const year = new Date().getFullYear() - i
      
      yearly.push({
        year: year.toString(),
        totalSavings: Math.random() * 50000 + 20000, // Mock data
        totalExpenses: Math.random() * 30000 + 15000 // Mock data
      })
    }
    
    return { monthly, quarterly, yearly }
  }, [expenses, contributions])

  const generateCategoryData = useCallback(() => {
    // Expense categories
    const expenseCategories = ['Housing', 'Transportation', 'Food', 'Entertainment', 'Utilities', 'Healthcare']
    const expenses = expenseCategories.map(category => ({
      category,
      amount: Math.random() * 1000 + 200,
      percentage: Math.random() * 30 + 10,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
    }))
    
    // Savings goals
    const savings = goals.map(goal => ({
      goal: goal.name,
      current: goal.current_amount || 0,
      target: goal.target_amount,
      progress: goal.current_amount ? (goal.current_amount / goal.target_amount) * 100 : 0,
      priority: goal.priority || 'medium'
    }))
    
    // Income sources
    const income = [
      { source: 'Primary Job', amount: 5000, frequency: 'monthly', reliability: 95 },
      { source: 'Side Hustle', amount: 800, frequency: 'monthly', reliability: 70 },
      { source: 'Investments', amount: 300, frequency: 'monthly', reliability: 85 }
    ]
    
    return { expenses, savings, income }
  }, [goals])

  const generateInsights = useCallback(() => {
    // Top performing goals
    const topPerformingGoals = goals
      .filter(g => g.current_amount > 0)
      .map(goal => ({
        name: goal.name,
        progress: goal.current_amount ? (goal.current_amount / goal.target_amount) * 100 : 0,
        efficiency: Math.random() * 100 + 50 // Mock efficiency score
      }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 3)
    
    // Spending optimization opportunities
    const spendingOptimization = [
      {
        category: 'Entertainment',
        potentialSavings: 150,
        recommendations: ['Cancel unused subscriptions', 'Use free alternatives', 'Set monthly limits']
      },
      {
        category: 'Food',
        potentialSavings: 200,
        recommendations: ['Meal prep more', 'Buy in bulk', 'Use coupons']
      }
    ]
    
    // Partner performance metrics
    const partnerPerformance = [
      { metric: 'Contribution Consistency', score: 85, trend: 'improving' as const },
      { metric: 'Communication', score: 90, trend: 'stable' as const },
      { metric: 'Goal Alignment', score: 78, trend: 'improving' as const }
    ]
    
    return { topPerformingGoals, spendingOptimization, partnerPerformance }
  }, [goals])

  const generateForecasts = useCallback(() => {
    return {
      nextMonth: {
        expenses: Math.random() * 3000 + 2000,
        savings: Math.random() * 2000 + 1000,
        netWorth: Math.random() * 15000 + 10000
      },
      nextQuarter: {
        goalCompletions: Math.floor(Math.random() * 3) + 1,
        expectedSavings: Math.random() * 8000 + 5000
      },
      nextYear: {
        projectedNetWorth: Math.random() * 50000 + 30000,
        goalAchievementRate: Math.random() * 40 + 60
      }
    }
  }, [])

  const generateAnalyticsData = useCallback(async (): Promise<AnalyticsData> => {
    // Calculate summary metrics
    const totalNetWorth = calculateNetWorth()
    const monthlySavingsRate = calculateMonthlySavingsRate()
    const goalProgressRate = calculateGoalProgressRate()
    const partnerContributionRatio = calculatePartnerContributionRatio()
    const financialHealthScore = calculateFinancialHealthScore(monthlySavingsRate, goalProgressRate)
    const riskAssessment = assessRiskLevel(monthlySavingsRate, goalProgressRate, financialHealthScore)

    // Generate trend data
    const trends = generateTrendData()

    // Generate category breakdowns
    const categories = generateCategoryData()

    // Generate insights
    const insights = generateInsights()

    // Generate forecasts
    const forecasts = generateForecasts()

    return {
      summary: {
        totalNetWorth,
        monthlySavingsRate,
        goalProgressRate,
        partnerContributionRatio,
        financialHealthScore,
        riskAssessment
      },
      trends,
      categories,
      insights,
      forecasts
    }
  }, [assessRiskLevel, calculateFinancialHealthScore, calculateGoalProgressRate, calculateMonthlySavingsRate, calculateNetWorth, calculatePartnerContributionRatio, generateCategoryData, generateForecasts, generateInsights, generateTrendData])

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Generate comprehensive analytics data
      const data = await generateAnalyticsData()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error loading analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [generateAnalyticsData])

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-red-600 dark:text-red-400'
    }
    return colors[risk] || 'text-gray-600 dark:text-gray-400'
  }

  const getRiskBgColor = (risk: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'bg-green-100 dark:bg-green-900/20',
      medium: 'bg-yellow-100 dark:bg-yellow-900/20',
      high: 'bg-red-100 dark:bg-red-900/20'
    }
    return colors[risk] || 'bg-gray-100 dark:bg-gray-700'
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    const icons = {
      up: '📈',
      down: '📉',
      stable: '➡️'
    }
    return icons[trend] || '➡️'
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    const colors = {
      up: 'text-green-600 dark:text-green-400',
      down: 'text-red-600 dark:text-red-400',
      stable: 'text-gray-600 dark:text-gray-400'
    }
    return colors[trend] || 'text-gray-600 dark:text-gray-400'
  }

  // Load analytics data when component mounts or dependencies change
  useEffect(() => {
    loadAnalyticsData()
  }, [loadAnalyticsData])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">📊</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Advanced Analytics Dashboard</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl block mb-2">📊</span>
          <p>No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold">Advanced Analytics Dashboard</h1>
            <p className="text-blue-100">Comprehensive financial insights and performance metrics</p>
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📅 Date Range
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setDateRange({
                start: new Date(new Date().getFullYear(), new Date().getMonth() - 11, 1),
                end: new Date()
              })}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30"
            >
              Last 12 Months
            </button>
            <button
              onClick={() => setDateRange({
                start: new Date(new Date().getFullYear(), 0, 1),
                end: new Date()
              })}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm hover:bg-blue-200 dark:hover:bg-blue-900/30"
            >
              This Year
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end.toISOString().split('T')[0]}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'trends', label: 'Trends', icon: '📈' },
            { id: 'categories', label: 'Categories', icon: '🏷️' },
            { id: 'insights', label: 'Insights', icon: '💡' },
            { id: 'forecasts', label: 'Forecasts', icon: '🔮' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedMetric(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedMetric === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {selectedMetric === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(analyticsData.summary.totalNetWorth)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Net Worth</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">📈</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analyticsData.summary.monthlySavingsRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings Rate</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {analyticsData.summary.goalProgressRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Goal Progress Rate</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">🤝</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {analyticsData.summary.partnerContributionRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Partner Contribution Ratio</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">🏥</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {analyticsData.summary.financialHealthScore}/100
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Financial Health Score</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="text-3xl mb-2">⚠️</div>
              <div className={`text-2xl font-bold ${getRiskColor(analyticsData.summary.riskAssessment)}`}>
                {analyticsData.summary.riskAssessment.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Risk Assessment</div>
            </div>
          </div>

          {/* Financial Health Gauge */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🏥 Financial Health Assessment
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
                  <div 
                    className={`h-4 rounded-full transition-all duration-500 ${
                      analyticsData.summary.financialHealthScore >= 80 ? 'bg-green-500' :
                      analyticsData.summary.financialHealthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${analyticsData.summary.financialHealthScore}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-2">
                  <span>Poor</span>
                  <span>Fair</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  analyticsData.summary.financialHealthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                  analyticsData.summary.financialHealthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {analyticsData.summary.financialHealthScore}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {selectedMetric === 'trends' && (
        <div className="space-y-6">
          {/* Timeframe Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex space-x-2">
              {[
                { id: 'monthly', label: 'Monthly' },
                { id: 'quarterly', label: 'Quarterly' },
                { id: 'yearly', label: 'Yearly' }
              ].map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTimeframe === timeframe.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                💰 Income vs Expenses
              </h3>
              <div className="space-y-3">
                {analyticsData.trends[selectedTimeframe].slice(-6).map((item, index) => {
                  const isMonthly = 'month' in item;
                  const isQuarterly = 'quarter' in item;
                  const isYearly = 'year' in item;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>{isMonthly ? item.month : isQuarterly ? item.quarter : item.year}</span>
                        <span>Net: {isMonthly ? formatCurrency(item.income - item.expenses) : 
                              isQuarterly ? formatCurrency(item.netWorth) : 
                              formatCurrency(item.totalSavings - item.totalExpenses)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex-1 bg-green-100 dark:bg-green-900/20 rounded h-2">
                          <div 
                            className="bg-green-500 h-2 rounded"
                            style={{ width: `${Math.min(100, (isMonthly ? item.income : 6000) / 6000 * 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex-1 bg-red-100 dark:bg-red-900/20 rounded h-2">
                          <div 
                            className="bg-red-500 h-2 rounded"
                            style={{ width: `${Math.min(100, (isMonthly ? item.expenses : 3000) / 6000 * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span>Income: {isMonthly ? formatCurrency(item.income) : 'N/A'}</span>
                        <span>Expenses: {isMonthly ? formatCurrency(item.expenses) : 'N/A'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Net Worth Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📈 Net Worth Trend
              </h3>
              <div className="space-y-3">
                {analyticsData.trends[selectedTimeframe].slice(-6).map((item, index) => {
                  const isMonthly = 'month' in item;
                  const isQuarterly = 'quarter' in item;
                  const isYearly = 'year' in item;
                  
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {isMonthly ? item.month : isQuarterly ? item.quarter : item.year}
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded"
                            style={{ width: `${Math.min(100, (isMonthly ? (item.income - item.expenses) : 
                                  isQuarterly ? item.netWorth : 
                                  (item.totalSavings - item.totalExpenses)) / 15000 * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(isMonthly ? (item.income - item.expenses) : 
                                        isQuarterly ? item.netWorth : 
                                        (item.totalSavings - item.totalExpenses))}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {selectedMetric === 'categories' && (
        <div className="space-y-6">
          {/* Expense Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💸 Expense Categories
            </h3>
            <div className="space-y-3">
              {analyticsData.categories.expenses.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`text-lg ${getTrendColor(category.trend)}`}>
                      {getTrendIcon(category.trend)}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(category.amount)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {category.percentage.toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Savings Goals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Savings Goals Progress
            </h3>
            <div className="space-y-3">
              {analyticsData.categories.savings.map((goal, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {goal.goal}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      goal.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200' :
                      goal.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' :
                      'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                    }`}>
                      {typeof goal.priority === 'string' ? goal.priority.toUpperCase() : 'MEDIUM'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progress: {goal.progress.toFixed(1)}%</span>
                    <span>{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedMetric === 'insights' && (
        <div className="space-y-6">
          {/* Top Performing Goals */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🏆 Top Performing Goals
            </h3>
            <div className="space-y-3">
              {analyticsData.insights.topPerformingGoals.map((goal, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {goal.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {goal.progress.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Efficiency: {goal.efficiency.toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spending Optimization */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Spending Optimization Opportunities
            </h3>
            <div className="space-y-3">
              {analyticsData.insights.spendingOptimization.map((opportunity, index) => (
                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-900 dark:text-blue-200">
                      {opportunity.category}
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      Save {formatCurrency(opportunity.potentialSavings)}/month
                    </span>
                  </div>
                  <div className="space-y-1">
                    {opportunity.recommendations.map((rec, recIndex) => (
                      <div key={recIndex} className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-300">
                        <span>•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Forecasts Tab */}
      {selectedMetric === 'forecasts' && (
        <div className="space-y-6">
          {/* Next Month Forecast */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔮 Next Month Forecast
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(analyticsData.forecasts.nextMonth.expenses)}
                </div>
                <div className="text-sm text-red-700 dark:text-red-300">Expected Expenses</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(analyticsData.forecasts.nextMonth.savings)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Expected Savings</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(analyticsData.forecasts.nextMonth.netWorth)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Projected Net Worth</div>
              </div>
            </div>
          </div>

          {/* Long-term Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                📅 Next Quarter Outlook
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {analyticsData.forecasts.nextQuarter.goalCompletions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Goals Expected to Complete</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(analyticsData.forecasts.nextQuarter.expectedSavings)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Expected Total Savings</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🎯 Next Year Projections
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(analyticsData.forecasts.nextYear.projectedNetWorth)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Projected Net Worth</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {analyticsData.forecasts.nextYear.goalAchievementRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Goal Achievement Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadAnalyticsData}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Analytics
        </button>
      </div>
    </div>
  )
}
