import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface FinancialData {
  expenses: any[]
  goals: any[]
  profile: any
  partnerProfile: any
  currencySymbol: string
  partnerships: any[]
}

interface AnalyticsMetrics {
  totalExpenses: number
  monthlyAverage: number
  topCategories: { category: string; amount: number; percentage: number }[]
  spendingTrends: { month: string; amount: number; change: number }[]
  savingsRate: number
  goalProgress: { goalId: string; name: string; progress: number; estimatedCompletion: Date }[]
  partnerComparison: { metric: string; user: number; partner: number; difference: number }[]
  financialHealth: { score: number; factors: string[]; recommendations: string[] }
}

export function AdvancedAnalytics({ 
  expenses, 
  goals, 
  profile, 
  partnerProfile, 
  currencySymbol, 
  partnerships 
}: FinancialData) {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'savings' | 'goals' | 'comparison' | 'forecasting'>('overview')
  const [timeRange, setTimeRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('3m')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Generate mock analytics data (in real app, this would come from API)
  useEffect(() => {
    const generateAnalyticsData = () => {
      const mockData: AnalyticsMetrics = {
        totalExpenses: 12500,
        monthlyAverage: 2083,
        topCategories: [
          { category: 'Housing', amount: 4500, percentage: 36 },
          { category: 'Transportation', amount: 1800, percentage: 14.4 },
          { category: 'Food & Dining', amount: 1600, percentage: 12.8 },
          { category: 'Entertainment', amount: 1200, percentage: 9.6 },
          { category: 'Utilities', amount: 900, percentage: 7.2 }
        ],
        spendingTrends: [
          { month: 'Jan', amount: 2100, change: 0 },
          { month: 'Feb', amount: 1950, change: -7.1 },
          { month: 'Mar', amount: 2200, change: 12.8 },
          { month: 'Apr', amount: 2050, change: -6.8 },
          { month: 'May', amount: 2300, change: 12.2 },
          { month: 'Jun', amount: 2150, change: -6.5 }
        ],
        savingsRate: 23.5,
        goalProgress: [
          { goalId: '1', name: 'Holiday Fund', progress: 75, estimatedCompletion: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
          { goalId: '2', name: 'Emergency Fund', progress: 45, estimatedCompletion: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) },
          { goalId: '3', name: 'House Deposit', progress: 15, estimatedCompletion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) }
        ],
        partnerComparison: [
          { metric: 'Monthly Income', user: 3500, partner: 3200, difference: 300 },
          { metric: 'Monthly Expenses', user: 1800, partner: 1650, difference: 150 },
          { metric: 'Savings Rate', user: 23.5, partner: 21.8, difference: 1.7 },
          { metric: 'Goal Contributions', user: 450, partner: 420, difference: 30 }
        ],
        financialHealth: {
          score: 78,
          factors: ['Good savings rate', 'Diversified goals', 'Consistent contributions'],
          recommendations: ['Increase emergency fund', 'Consider investment options', 'Review insurance coverage']
        }
      }
      
      setAnalyticsData(mockData)
    }

    generateAnalyticsData()
  }, [expenses, goals, profile, partnerProfile])

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-red-600 dark:text-red-400'
    if (change < 0) return 'text-green-600 dark:text-green-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return '↗️'
    if (change < 0) return '↘️'
    return '→'
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getHealthScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
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
            <h1 className="text-2xl font-bold">Advanced Analytics</h1>
            <p className="text-blue-100">Deep insights into your financial patterns and trends</p>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { value: '1m', label: '1M' },
              { value: '3m', label: '3M' },
              { value: '6m', label: '6M' },
              { value: '1y', label: '1Y' },
              { value: 'all', label: 'All' }
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value as any)}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  timeRange === range.value
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'expenses', label: 'Expenses', icon: '💰' },
          { id: 'savings', label: 'Savings', icon: '💾' },
          { id: 'goals', label: 'Goals', icon: '🎯' },
          { id: 'comparison', label: 'Comparison', icon: '🤝' },
          { id: 'forecasting', label: 'Forecasting', icon: '🔮' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">{timeRange}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {currencySymbol}{analyticsData.totalExpenses.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg: {currencySymbol}{analyticsData.monthlyAverage.toLocaleString()}/month
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">{timeRange}</span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analyticsData.savingsRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Above average (18%)
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Financial Health</span>
                <span className="text-xs text-gray-500 dark:text-gray-500">Score</span>
              </div>
              <div className={`text-2xl font-bold ${getHealthScoreColor(analyticsData.financialHealth.score)}`}>
                {analyticsData.financialHealth.score}/100
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {getHealthScoreLabel(analyticsData.financialHealth.score)}
              </div>
            </div>
          </div>

          {/* Spending Trends Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Spending Trends
            </h3>
            
            <div className="space-y-3">
              {analyticsData.spendingTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                      {trend.month}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currencySymbol}{trend.amount.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getTrendColor(trend.change)}`}>
                      {getTrendIcon(trend.change)} {Math.abs(trend.change)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Spending Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🏷️ Top Spending Categories
            </h3>
            
            <div className="space-y-4">
              {analyticsData.topCategories.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.category}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currencySymbol}{category.amount.toLocaleString()} ({category.percentage}%)
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💰 Detailed Expense Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expense Breakdown */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Category Breakdown</h4>
                <div className="space-y-3">
                  {analyticsData.topCategories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {category.category}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currencySymbol}{category.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Monthly Comparison */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Monthly Comparison</h4>
                <div className="space-y-3">
                  {analyticsData.spendingTrends.slice(-3).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {trend.month}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {currencySymbol}{trend.amount.toLocaleString()}
                        </span>
                        <span className={`text-xs ${getTrendColor(trend.change)}`}>
                          {getTrendIcon(trend.change)} {Math.abs(trend.change)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💾 Savings Analysis
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Savings Rate */}
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {analyticsData.savingsRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Current Savings Rate
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(analyticsData.savingsRate, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Target: 20% | Excellent: 30%+
                </div>
              </div>
              
              {/* Savings Tips */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Savings Tips</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-start space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Your savings rate is above the recommended 20%</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-blue-500">💡</span>
                    <span>Consider increasing emergency fund contributions</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-purple-500">🎯</span>
                    <span>Automate monthly savings for consistency</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Goal Progress Analytics
            </h3>
            
            <div className="space-y-4">
              {analyticsData.goalProgress.map((goal, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      {goal.name}
                    </h4>
                    <span className="text-sm text-gray-500 dark:text-gray-500">
                      Est. {goal.estimatedCompletion.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {goal.progress}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          goal.progress >= 80 ? 'bg-green-500' :
                          goal.progress >= 50 ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {goal.progress >= 100 ? 'Completed!' : 
                       goal.progress >= 80 ? 'Almost there!' :
                       goal.progress >= 50 ? 'Halfway there!' : 'Getting started'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🤝 Partner Comparison
            </h3>
            
            <div className="space-y-4">
              {analyticsData.partnerComparison.map((comparison, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {comparison.metric}
                    </span>
                    <span className={`text-sm font-medium ${
                      comparison.difference > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {comparison.difference > 0 ? '+' : ''}{comparison.difference}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {currencySymbol}{comparison.user.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">You</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {currencySymbol}{comparison.partner.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">Partner</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecasting' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔮 Financial Forecasting
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Savings Projection */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Savings Projection</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                    <div className="text-sm text-blue-800 dark:text-blue-200 font-medium">6 Months</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {currencySymbol}{(analyticsData.monthlyAverage * 0.235 * 6).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                    <div className="text-sm text-green-800 dark:text-green-200 font-medium">1 Year</div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {currencySymbol}{(analyticsData.monthlyAverage * 0.235 * 12).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded">
                    <div className="text-sm text-purple-800 dark:text-purple-200 font-medium">2 Years</div>
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {currencySymbol}{(analyticsData.monthlyAverage * 0.235 * 24).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Goal Completion Estimates */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Goal Completion Estimates</h4>
                <div className="space-y-3">
                  {analyticsData.goalProgress.map((goal, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {goal.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Est. completion: {goal.estimatedCompletion.toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {goal.progress}% complete
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Health Score */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🏥 Financial Health Assessment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${getHealthScoreColor(analyticsData.financialHealth.score)} mb-2`}>
              {analyticsData.financialHealth.score}/100
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              {getHealthScoreLabel(analyticsData.financialHealth.score)}
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  analyticsData.financialHealth.score >= 80 ? 'bg-green-500' :
                  analyticsData.financialHealth.score >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${analyticsData.financialHealth.score}%` }}
              ></div>
            </div>
          </div>
          
          {/* Factors & Recommendations */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Positive Factors</h4>
              <div className="space-y-1">
                {analyticsData.financialHealth.factors.map((factor, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500">✓</span>
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Recommendations</h4>
              <div className="space-y-1">
                {analyticsData.financialHealth.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-500">💡</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
