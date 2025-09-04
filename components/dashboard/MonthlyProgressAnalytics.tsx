'use client'
import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { 
  MonthlyProgressData, 
  MonthlyTrends, 
  PartnerAccountability, 
  ProgressInsights,
  formatCurrency,
  getProgressStatusColor,
  getProgressStatusBgColor
} from '@/lib/monthly-progress-utils'

export function MonthlyProgressAnalytics() {
  const [monthlyData, setMonthlyData] = useState<MonthlyProgressData[]>([])
  const [trends, setTrends] = useState<MonthlyTrends | null>(null)
  const [partnerAccountability, setPartnerAccountability] = useState<PartnerAccountability | null>(null)
  const [insights, setInsights] = useState<ProgressInsights | null>(null)
  const [currentMonth, setCurrentMonth] = useState<MonthlyProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [showDetailedView, setShowDetailedView] = useState(false)

  // Load monthly progress data
  useEffect(() => {
    loadMonthlyProgress()
  }, [])

  const loadMonthlyProgress = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/monthly-progress')
      
      if (response.data?.monthlyProgress) {
        setMonthlyData(response.data.monthlyProgress)
        setTrends(response.data.trends)
        setPartnerAccountability(response.data.partnerAccountability)
        setInsights(response.data.insights)
        setCurrentMonth(response.data.currentMonth)
        setSelectedMonth(response.data.currentMonth?.month || '')
      }
    } catch (error) {
      console.error('Error loading monthly progress:', error)
      toast.error('Failed to load monthly progress data')
    } finally {
      setLoading(false)
    }
  }

  const getFinancialHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 dark:text-green-400'
      case 'good': return 'text-blue-600 dark:text-blue-400'
      case 'fair': return 'text-yellow-600 dark:text-yellow-400'
      case 'needs-attention': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getFinancialHealthBg = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'good': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'fair': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'needs-attention': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default: return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    }
  }

  const getReliabilityColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-600 dark:text-green-400'
      case 'good': return 'text-blue-600 dark:text-blue-400'
      case 'fair': return 'text-yellow-600 dark:text-yellow-400'
      case 'poor': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold">Monthly Progress Analytics</h1>
              <p className="text-blue-100">Loading your progress data...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold">Monthly Progress Analytics</h1>
            <p className="text-blue-100">Track your financial progress and partner accountability</p>
          </div>
        </div>
      </div>

      {/* Financial Health Overview */}
      {insights && (
        <div className={`rounded-xl border p-6 ${getFinancialHealthBg(insights.financialHealth)}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <span>🏥</span>
            <span>Financial Health Assessment</span>
            <span className={`text-lg font-bold ${getFinancialHealthColor(insights.financialHealth)}`}>
              {insights.financialHealth.toUpperCase()}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {trends?.consistencyScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Consistency Score</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${(trends?.contributionGrowthRate ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(trends?.contributionGrowthRate ?? 0) >= 0 ? '+' : ''}{(trends?.contributionGrowthRate ?? 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(insights.nextMonthProjection)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Next Month Projection</div>
            </div>
          </div>

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Recommendations</h3>
              <ul className="space-y-1">
                {insights.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start space-x-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Factors & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.riskFactors.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Risk Factors</h3>
                <ul className="space-y-1">
                  {insights.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-red-600 dark:text-red-400 flex items-start space-x-2">
                      <span>•</span>
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {insights.opportunities.length > 0 && (
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">🚀 Opportunities</h3>
                <ul className="space-y-1">
                  {insights.opportunities.map((opp, index) => (
                    <li key={index} className="text-sm text-green-600 dark:text-green-400 flex items-start space-x-2">
                      <span>•</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Monthly Trends */}
      {trends && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📈 Monthly Trends
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(trends?.averageMonthlyContribution ?? 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Monthly</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`text-2xl font-bold ${(trends?.contributionGrowthRate ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(trends?.contributionGrowthRate ?? 0) >= 0 ? '+' : ''}{(trends?.contributionGrowthRate ?? 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {trends?.bestMonth ?? 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Best Month</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {trends?.worstMonth ?? 'N/A'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Worst Month</div>
            </div>
          </div>

          {/* Consistency Breakdown */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Consistency Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  {trends?.monthsOnTrack ?? 0}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">On Track</div>
              </div>
              
              <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {trends?.monthsBehind ?? 0}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Behind</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {trends?.monthsAhead ?? 0}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Ahead</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Accountability */}
      {partnerAccountability && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🤝 Partner Accountability
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {partnerAccountability.consistencyScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Consistency Score</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(partnerAccountability.averageContribution)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Average Contribution</div>
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getReliabilityColor(partnerAccountability.reliabilityRating)}`}>
                {partnerAccountability.reliabilityRating.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Reliability Rating</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {partnerAccountability.nextExpectedContribution}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Next Expected</div>
            </div>
          </div>

          {/* Monthly Contribution Chart */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Monthly Contribution History</h3>
            <div className="flex items-end space-x-2 h-32">
              {partnerAccountability.monthlyContributions.slice(-6).map((contribution, index) => {
                const maxContribution = Math.max(...partnerAccountability.monthlyContributions)
                const height = maxContribution > 0 ? (contribution / maxContribution) * 100 : 0
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all duration-300"
                      style={{ height: `${height}%` }}
                      title={`Month ${index + 1}: ${formatCurrency(contribution)}`}
                    ></div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {index + 1}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📅 Monthly Progress Details
          </h2>
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showDetailedView ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {monthlyData.map((month) => (
              <option key={month.month} value={month.month}>
                {month.monthName} {month.year}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Month Details */}
        {selectedMonth && (() => {
          const monthData = monthlyData.find(m => m.month === selectedMonth);
          return monthData ? (
            <div className={`space-y-4 ${showDetailedView ? 'block' : 'hidden'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(monthData.totalExpected)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Expected</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(monthData.totalActual)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Actual</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`text-2xl font-bold ${getProgressStatusColor(monthData.status)}`}>
                    {monthData.status.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`text-2xl font-bold ${monthData.overUnderAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {monthData.overUnderAmount >= 0 ? '+' : ''}{formatCurrency(monthData.overUnderAmount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Over/Under</div>
                </div>
              </div>

              {/* Goal Progress */}
              {monthData.goalsProgress.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Goal Progress</h3>
                  <div className="space-y-3">
                    {monthData.goalsProgress.map((goal) => (
                      <div key={goal.goalId} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">{goal.goalName}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${getProgressStatusBgColor(goal.status)} ${getProgressStatusColor(goal.status)}`}>
                            {goal.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Target: {formatCurrency(goal.monthlyTarget)}</span>
                          <span>Actual: {formatCurrency(goal.actualContribution)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(goal.progress, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null;
        })()}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadMonthlyProgress}
          className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh Analytics
        </button>
      </div>
    </div>
  )
}
