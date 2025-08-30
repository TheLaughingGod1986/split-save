import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'

interface AnalyticsViewProps {
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
}

interface MonthlyData {
  month: string
  actualSalary: number
  sharedExpensesContributed: number
  goal1Saved: number
  goal2Saved: number
  safetyPotSaved: number
  extraIncome: number
}

interface FinancialHealthScore {
  overall: number
  savings: number
  expenses: number
  goals: number
  safety: number
  recommendations: string[]
}

export function AnalyticsView({ partnerships, profile, user, currencySymbol }: AnalyticsViewProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthScore | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3months' | '6months' | '12months'>('6months')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeframe])

  const loadAnalyticsData = async () => {
    setIsLoading(true)
    
    try {
      // In a real app, this would fetch from analytics API
      // For now, show empty state until real data is implemented
      setMonthlyData([])
      setFinancialHealth(null)
    } catch (error) {
      console.error('Failed to load analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }



  const calculateFinancialHealthScore = (data: MonthlyData[]): FinancialHealthScore | null => {
    if (data.length === 0) return null
    
    // Calculate averages and trends
    const avgSalary = data.reduce((sum, month) => sum + month.actualSalary, 0) / data.length
    const avgSavings = data.reduce((sum, month) => sum + month.goal1Saved + month.goal2Saved, 0) / data.length
    const avgExpenses = data.reduce((sum, month) => sum + month.sharedExpensesContributed, 0) / data.length
    const avgSafety = data.reduce((sum, month) => sum + month.safetyPotSaved, 0) / data.length
    
    // Calculate scores (0-100)
    const savingsScore = Math.min(100, Math.round((avgSavings / (profile?.income * 0.2)) * 100))
    const expensesScore = Math.min(100, Math.round((avgExpenses / (profile?.income * 0.7)) * 100))
    const safetyScore = Math.min(100, Math.round((avgSafety / (profile?.income * 0.1)) * 100))
    
    // Overall score (weighted average)
    const overall = Math.round((savingsScore * 0.4) + (expensesScore * 0.3) + (safetyScore * 0.3))
    
    // Generate recommendations
    const recommendations = generateRecommendations(overall, savingsScore, expensesScore, safetyScore)
    
    return {
      overall,
      savings: savingsScore,
      expenses: expensesScore,
      goals: savingsScore,
      safety: safetyScore,
      recommendations
    }
  }

  const generateRecommendations = (overall: number, savings: number, expenses: number, safety: number): string[] => {
    const recommendations = []
    
    if (overall < 70) {
      recommendations.push("Focus on building consistent savings habits")
    }
    
    if (savings < 80) {
      recommendations.push("Consider increasing your monthly savings allocation")
    }
    
    if (expenses < 80) {
      recommendations.push("Review your shared expenses to ensure adequate coverage")
    }
    
    if (safety < 80) {
      recommendations.push("Build your safety net to cover 3-6 months of expenses")
    }
    
    if (overall >= 90) {
      recommendations.push("Excellent progress! Consider setting more ambitious goals")
    }
    
    return recommendations.length > 0 ? recommendations : ["Keep up the great work! You're on track."]
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400'
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
    if (score >= 60) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 80) return 'Good'
    if (score >= 70) return 'Fair'
    if (score >= 60) return 'Needs Improvement'
    return 'Critical'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-600 dark:from-blue-100 dark:to-indigo-300 bg-clip-text text-transparent">
            Financial Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Deep insights into your financial progress and trends
          </p>
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
          {[
            { value: '3months', label: '3M' },
            { value: '6months', label: '6M' },
            { value: '12months', label: '12M' }
          ].map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value as any)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {timeframe.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial Health Score */}
      {financialHealth && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Financial Health Score</h2>
              <p className="text-blue-700 dark:text-blue-300">Your overall financial wellness rating</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Overall Score */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(financialHealth.overall)}`}>
                {financialHealth.overall}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Overall</div>
              <div className={`text-xs font-medium ${getScoreColor(financialHealth.overall)}`}>
                {getScoreLabel(financialHealth.overall)}
              </div>
            </div>
            
            {/* Savings Score */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(financialHealth.savings)}`}>
                {financialHealth.savings}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Savings</div>
            </div>
            
            {/* Expenses Score */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(financialHealth.expenses)}`}>
                {financialHealth.expenses}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expenses</div>
            </div>
            
            {/* Goals Score */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(financialHealth.goals)}`}>
                {financialHealth.goals}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Goals</div>
            </div>
            
            {/* Safety Score */}
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(financialHealth.safety)}`}>
                {financialHealth.safety}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Safety</div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">💡 Recommendations</h3>
            <div className="space-y-2">
              {financialHealth.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-blue-800 dark:text-blue-200">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">📈 Monthly Trends</h2>
        
        <div className="space-y-6">
          {monthlyData.map((month, index) => (
            <div key={month.month} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{month.month}</h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Salary: {currencySymbol}{month.actualSalary.toLocaleString()}
                  {month.extraIncome > 0 && (
                    <span className="ml-2 text-green-600 dark:text-green-400">
                      (+{currencySymbol}{month.extraIncome})
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {currencySymbol}{month.sharedExpensesContributed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Expenses</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {currencySymbol}{month.goal1Saved.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Goal 1</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {currencySymbol}{month.goal2Saved.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Goal 2</div>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {currencySymbol}{month.safetyPotSaved.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Safety</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Comparison */}
      {partnerships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">👥 Partner Comparison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Progress */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">{profile?.name?.charAt(0)?.toUpperCase() || 'Y'}</span>
                </div>
                {profile?.name || 'Your'} Progress
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expense Coverage</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.7)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Safety Net</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.1)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Partner Progress */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-bold">P</span>
                </div>
                Partner Progress
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Savings</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currencySymbol}-- {/* TODO: Load partner data */}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expense Coverage</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currencySymbol}-- {/* TODO: Load partner data */}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Safety Net</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {currencySymbol}-- {/* TODO: Load partner data */}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              💡 <strong>Collaboration Tip:</strong> Regular check-ins with your partner help maintain accountability and achieve shared financial goals faster.
            </div>
          </div>
        </div>
      )}

      {/* Smart Insights */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">🧠 Smart Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Savings Velocity */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">🚀 Savings Velocity</h3>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
              {currencySymbol}{Math.round(((profile?.income || 0) - (profile?.personal_allowance || 0)) * 0.2)}/month
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              At this rate, you'll reach your savings goals in approximately 8-12 months.
            </p>
          </div>
          
          {/* Expense Efficiency */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">⚡ Expense Efficiency</h3>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
              70% allocation
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Your expense allocation is optimal for maintaining financial stability while building savings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
