import React, { useState, useEffect, useCallback } from 'react'
import { toast } from '@/lib/toast'
import { MLInsightsPanel } from './MLInsightsPanel'

interface AnalyticsViewProps {
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
  monthlyProgress?: any
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

export function AnalyticsView({ partnerships, profile, user, currencySymbol, monthlyProgress }: AnalyticsViewProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [financialHealth, setFinancialHealth] = useState<FinancialHealthScore | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3months' | '6months' | '12months'>('6months')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const generateRecommendations = useCallback((overall: number, savings: number, expenses: number, safety: number): string[] => {
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
  }, [])

  const calculateFinancialHealthScore = useCallback((data: MonthlyData[]): FinancialHealthScore | null => {
    if (data.length === 0) return null
    
    // Calculate averages and trends
    const avgSalary = data.reduce((sum, month) => sum + month.actualSalary, 0) / (data.length || 1)
    const avgSavings = data.reduce((sum, month) => sum + month.goal1Saved + month.goal2Saved, 0) / (data.length || 1)
    const avgExpenses = data.reduce((sum, month) => sum + month.sharedExpensesContributed, 0) / (data.length || 1)
    const avgSafety = data.reduce((sum, month) => sum + month.safetyPotSaved, 0) / (data.length || 1)
    
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
  }, [profile?.income, generateRecommendations])

  const loadAnalyticsData = useCallback(async () => {
    if (hasError) return // Prevent infinite loops
    setIsLoading(true)
    setHasError(false)
    
    try {
      console.log('📊 AnalyticsView - monthlyProgress data:', monthlyProgress)
      
      if (monthlyProgress && Array.isArray(monthlyProgress)) {
        // Use the pre-loaded monthly progress data
        const processedData = monthlyProgress.map((month: any) => ({
          month: month.month,
          actualSalary: month.actualContributions?.salary || 0,
          sharedExpensesContributed: month.actualContributions?.sharedExpenses || 0,
          goal1Saved: month.actualContributions?.goal1 || 0,
          goal2Saved: month.actualContributions?.goal2 || 0,
          safetyPotSaved: month.actualContributions?.safetyPot || 0,
          extraIncome: month.actualContributions?.extraIncome || 0
        }))
        
        console.log('📊 Processed analytics data:', processedData)
        setMonthlyData(processedData)
        setFinancialHealth(calculateFinancialHealthScore(processedData))
      } else {
        console.log('📊 No monthly progress data available')
        // Show empty state until real data is available
        setMonthlyData([])
        setFinancialHealth(null)
      }
    } catch (error) {
      console.error('Failed to process analytics data:', error)
      setHasError(true)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [monthlyProgress, hasError])

  useEffect(() => {
    if (!hasError) {
      loadAnalyticsData()
    }
  }, [selectedTimeframe, monthlyProgress, hasError])

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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center space-x-3 space-item">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🏥</span>
            </div>
            <div>
              <h2 className="text-heading-2 text-blue-900 dark:text-blue-100">Financial Health Score</h2>
              <p className="text-body text-blue-700 dark:text-blue-300">Your overall financial wellness rating</p>
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
          <div className="space-card">
            <h3 className="text-heading-3 text-blue-900 dark:text-blue-100 space-item">💡 Recommendations</h3>
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
      <div className="card space-card">
        <h2 className="text-heading-2 text-gray-900 dark:text-white space-card">📈 Monthly Trends</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Month</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">Salary</th>
                <th className="text-center py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">Expenses</th>
                <th className="text-center py-3 px-4 font-semibold text-green-600 dark:text-green-400">Goal 1</th>
                <th className="text-center py-3 px-4 font-semibold text-green-600 dark:text-green-400">Goal 2</th>
                <th className="text-center py-3 px-4 font-semibold text-purple-600 dark:text-purple-400">Safety</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, index) => (
                <tr key={month.month} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                    {month.month}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-gray-900 dark:text-white font-medium">
                      {currencySymbol}{month.actualSalary.toLocaleString()}
                    </div>
                    {month.extraIncome > 0 && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        +{currencySymbol}{month.extraIncome}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {currencySymbol}{month.sharedExpensesContributed.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {currencySymbol}{month.goal1Saved.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {currencySymbol}{month.goal2Saved.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {currencySymbol}{month.safetyPotSaved.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {monthlyData.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium mb-2">No monthly data available</p>
            <p className="text-sm">Start tracking your finances to see trends here</p>
          </div>
        )}
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
                    {monthlyData.length > 0 ? 
                      `${currencySymbol}${(monthlyData[0]?.goal1Saved + monthlyData[0]?.goal2Saved || 0).toFixed(0)}` : 
                      `${currencySymbol}0`
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expense Coverage</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {monthlyData.length > 0 ? 
                      `${currencySymbol}${monthlyData[0]?.sharedExpensesContributed || 0}` : 
                      `${currencySymbol}0`
                    }
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Safety Net</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {monthlyData.length > 0 ? 
                      `${currencySymbol}${monthlyData[0]?.safetyPotSaved || 0}` : 
                      `${currencySymbol}0`
                    }
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

      {/* ML Insights Panel */}
      <MLInsightsPanel 
        userId={user.id} 
        onInsightAction={(action, data) => {
          console.log('ML Insight action:', action, data)
          // Handle insight actions here
        }}
      />
    </div>
  )
}
