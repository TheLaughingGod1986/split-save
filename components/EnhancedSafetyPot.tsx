'use client'
import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface SafetyPotData {
  currentAmount: number
  targetAmount: number
  monthsCovered: number
  lastContribution: string | null
  autoContributeEnabled: boolean
  monthlyTarget: number
}

interface MLRecommendation {
  type: 'increase' | 'maintain' | 'redistribute'
  confidence: number
  title: string
  description: string
  suggestedAmount?: number
  reasoning: string[]
  impactAnalysis: {
    risk: 'low' | 'medium' | 'high'
    benefit: string
    timeframe: string
  }
}

interface ExpenseAnalysis {
  category: string
  averageMonthly: number
  trend: 'increasing' | 'stable' | 'decreasing'
  volatility: 'low' | 'medium' | 'high'
}

export function EnhancedSafetyPot({ 
  partnerships, 
  expenses, 
  profile, 
  currencySymbol = '£',
  onSafetyPotUpdate 
}: {
  partnerships: any[]
  expenses: any[]
  profile: any
  currencySymbol?: string
  onSafetyPotUpdate?: (amount: number) => void
}) {
  const [safetyPotData, setSafetyPotData] = useState<SafetyPotData>({
    currentAmount: 0,
    targetAmount: 0,
    monthsCovered: 0,
    lastContribution: null,
    autoContributeEnabled: false,
    monthlyTarget: 0
  })
  
  const [mlRecommendations, setMLRecommendations] = useState<MLRecommendation[]>([])
  const [expenseAnalysis, setExpenseAnalysis] = useState<ExpenseAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [contributionAmount, setContributionAmount] = useState('')
  const [showContributeForm, setShowContributeForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'recommendations'>('overview')

  useEffect(() => {
    calculateSafetyPotData()
  }, [expenses, profile])

  const calculateSafetyPotData = async () => {
    try {
      setLoading(true)

      // Calculate essential monthly expenses
      const monthlyExpenses = calculateMonthlyExpenses()
      const essentialExpenses = monthlyExpenses.filter(exp => 
        ['rent', 'groceries', 'utilities', 'insurance', 'transport'].includes(exp.category.toLowerCase())
      )
      
      const totalEssentialMonthly = essentialExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      
      // Get current safety pot amount (mock for demo)
      const currentAmount = profile?.safety_pot_amount || 1250
      const recommendedTarget = totalEssentialMonthly * 6 // 6 months coverage
      const monthsCovered = totalEssentialMonthly > 0 ? currentAmount / totalEssentialMonthly : 0

      setSafetyPotData({
        currentAmount,
        targetAmount: recommendedTarget,
        monthsCovered,
        lastContribution: '2024-11-15', // Mock data
        autoContributeEnabled: profile?.auto_contribute_safety_pot || false,
        monthlyTarget: totalEssentialMonthly
      })

      // Generate expense analysis
      const analysis = generateExpenseAnalysis(monthlyExpenses)
      setExpenseAnalysis(analysis)

      // Generate ML recommendations
      const recommendations = generateMLRecommendations(
        currentAmount, 
        recommendedTarget, 
        monthsCovered, 
        analysis,
        profile
      )
      setMLRecommendations(recommendations)

    } catch (error) {
      console.error('Error calculating safety pot data:', error)
      toast.error('Failed to load safety pot data')
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyExpenses = () => {
    // Group expenses by category and calculate monthly averages
    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.created_at) >= threeMonthsAgo
    )

    const categoryTotals = recentExpenses.reduce((acc: any, expense) => {
      const category = expense.category || 'other'
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0, amounts: [] }
      }
      acc[category].total += expense.amount
      acc[category].count += 1
      acc[category].amounts.push(expense.amount)
      return acc
    }, {})

    return Object.entries(categoryTotals).map(([category, data]: [string, any]) => ({
      category,
      amount: data.total / 3, // Average over 3 months
      count: data.count,
      volatility: calculateVolatility(data.amounts)
    }))
  }

  const calculateVolatility = (amounts: number[]): 'low' | 'medium' | 'high' => {
    if (amounts.length < 2) return 'low'
    
    const avg = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - avg, 2), 0) / amounts.length
    const coefficient = Math.sqrt(variance) / avg

    if (coefficient < 0.2) return 'low'
    if (coefficient < 0.5) return 'medium'
    return 'high'
  }

  const generateExpenseAnalysis = (monthlyExpenses: any[]): ExpenseAnalysis[] => {
    return monthlyExpenses.map(expense => ({
      category: expense.category,
      averageMonthly: expense.amount,
      trend: Math.random() > 0.5 ? 'stable' : Math.random() > 0.5 ? 'increasing' : 'decreasing',
      volatility: expense.volatility
    }))
  }

  const generateMLRecommendations = (
    currentAmount: number,
    targetAmount: number,
    monthsCovered: number,
    analysis: ExpenseAnalysis[],
    profile: any
  ): MLRecommendation[] => {
    const recommendations: MLRecommendation[] = []

    // Recommendation 1: Safety level assessment
    if (monthsCovered < 3) {
      recommendations.push({
        type: 'increase',
        confidence: 0.95,
        title: 'Critical: Increase Safety Pot',
        description: `Your safety pot only covers ${monthsCovered.toFixed(1)} months of expenses. Aim for at least 3-6 months.`,
        suggestedAmount: targetAmount - currentAmount,
        reasoning: [
          'Less than 3 months coverage is considered high financial risk',
          'Unexpected job loss or medical expenses could create severe hardship',
          'Industry best practice recommends 6 months minimum'
        ],
        impactAnalysis: {
          risk: 'high',
          benefit: 'Significant improvement in financial security',
          timeframe: '6-12 months to reach target'
        }
      })
    } else if (monthsCovered < 6) {
      recommendations.push({
        type: 'increase',
        confidence: 0.85,
        title: 'Recommended: Boost Emergency Fund',
        description: `You have ${monthsCovered.toFixed(1)} months covered. Consider increasing to 6 months for optimal security.`,
        suggestedAmount: (targetAmount - currentAmount) / 2,
        reasoning: [
          'Current coverage is good but could be stronger',
          'Economic uncertainty suggests higher emergency funds',
          'Your expense volatility indicates need for extra buffer'
        ],
        impactAnalysis: {
          risk: 'medium',
          benefit: 'Enhanced peace of mind and financial flexibility',
          timeframe: '3-6 months to reach optimal level'
        }
      })
    }

    // Recommendation 2: Expense optimization
    const highVolatilityExpenses = analysis.filter(exp => exp.volatility === 'high')
    if (highVolatilityExpenses.length > 0) {
      recommendations.push({
        type: 'maintain',
        confidence: 0.78,
        title: 'Monitor Volatile Expenses',
        description: `Your ${highVolatilityExpenses.map(e => e.category).join(', ')} expenses show high volatility.`,
        reasoning: [
          'Volatile expenses increase emergency fund requirements',
          'Consider budgeting tools to smooth out spending',
          'High volatility categories may need closer monitoring'
        ],
        impactAnalysis: {
          risk: 'medium',
          benefit: 'Better expense predictability',
          timeframe: 'Ongoing monitoring recommended'
        }
      })
    }

    // Recommendation 3: Auto-contribution
    if (!profile?.auto_contribute_safety_pot) {
      recommendations.push({
        type: 'increase',
        confidence: 0.92,
        title: 'Enable Auto-Contribution',
        description: 'Set up automatic monthly contributions to build your safety pot consistently.',
        suggestedAmount: Math.max(50, (targetAmount - currentAmount) / 12),
        reasoning: [
          'Automation ensures consistent progress toward your goal',
          'Small, regular contributions are easier to manage',
          'Reduces the mental load of manual contributions'
        ],
        impactAnalysis: {
          risk: 'low',
          benefit: 'Steady progress without effort',
          timeframe: '1 year to reach target with auto-contribute'
        }
      })
    }

    // Recommendation 4: Surplus redistribution
    if (monthsCovered > 8) {
      recommendations.push({
        type: 'redistribute',
        confidence: 0.72,
        title: 'Consider Redistributing Excess',
        description: `You have ${monthsCovered.toFixed(1)} months covered. Consider moving some funds to higher-yield investments.`,
        suggestedAmount: currentAmount - (targetAmount * 0.75),
        reasoning: [
          'Excess emergency funds earn minimal interest',
          'Conservative investments could provide better returns',
          'Maintain 6-month minimum while investing surplus'
        ],
        impactAnalysis: {
          risk: 'low',
          benefit: 'Potential for higher returns on surplus funds',
          timeframe: 'Long-term wealth building opportunity'
        }
      })
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence)
  }

  const handleContribute = async () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      toast.error('Please enter a valid contribution amount')
      return
    }

    try {
      const amount = parseFloat(contributionAmount)
      
      // Update safety pot (in real app, this would be an API call)
      const newAmount = safetyPotData.currentAmount + amount
      setSafetyPotData(prev => ({
        ...prev,
        currentAmount: newAmount,
        monthsCovered: prev.monthlyTarget > 0 ? newAmount / prev.monthlyTarget : 0,
        lastContribution: new Date().toISOString()
      }))

      toast.success(`${currencySymbol}${amount.toFixed(2)} added to safety pot!`)
      setContributionAmount('')
      setShowContributeForm(false)
      
      if (onSafetyPotUpdate) {
        onSafetyPotUpdate(newAmount)
      }

    } catch (error) {
      console.error('Error contributing to safety pot:', error)
      toast.error('Failed to add contribution')
    }
  }

  const getRecommendationIcon = (type: MLRecommendation['type']) => {
    switch (type) {
      case 'increase': return '📈'
      case 'maintain': return '⚖️'
      case 'redistribute': return '🔄'
      default: return '💡'
    }
  }

  const getRecommendationColor = (type: MLRecommendation['type']) => {
    switch (type) {
      case 'increase': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'maintain': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'redistribute': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
    }
  }

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'high': return 'text-red-600 dark:text-red-400'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-bold">Enhanced Safety Pot</h1>
              <p className="text-green-100">Loading your financial safety analysis...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🛡️</span>
          <div>
            <h1 className="text-2xl font-bold">Enhanced Safety Pot</h1>
            <p className="text-green-100">AI-powered emergency fund optimization</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {currencySymbol}{safetyPotData.currentAmount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Current Amount</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {safetyPotData.monthsCovered.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Months Covered</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {currencySymbol}{safetyPotData.targetAmount.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Target Amount</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {Math.round((safetyPotData.currentAmount / safetyPotData.targetAmount) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Safety Pot Progress
          </h2>
          <button
            onClick={() => setShowContributeForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Contribution
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">
                Progress to 6-month target
              </span>
              <span className="font-medium">
                {currencySymbol}{safetyPotData.currentAmount.toLocaleString()} / {currencySymbol}{safetyPotData.targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.min((safetyPotData.currentAmount / safetyPotData.targetAmount) * 100, 100)}%` }}
              >
                {safetyPotData.monthsCovered >= 3 && (
                  <div className="absolute right-2 top-0 bottom-0 flex items-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0 months</span>
              <span className="absolute left-1/4 transform -translate-x-1/2">3 months</span>
              <span>6 months</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'analytics', label: 'Analytics', icon: '📈' },
          { id: 'recommendations', label: 'AI Insights', icon: '🤖', badge: mlRecommendations.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="bg-green-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`rounded-xl border p-6 ${
            safetyPotData.monthsCovered >= 6 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
              : safetyPotData.monthsCovered >= 3
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-start space-x-4">
              <span className="text-4xl">
                {safetyPotData.monthsCovered >= 6 ? '🛡️' : safetyPotData.monthsCovered >= 3 ? '⚠️' : '🚨'}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  {safetyPotData.monthsCovered >= 6 
                    ? 'Excellent Financial Security' 
                    : safetyPotData.monthsCovered >= 3
                      ? 'Good Progress - Room for Improvement'
                      : 'Critical: Build Your Safety Net'
                  }
                </h3>
                <p className="text-sm mb-4">
                  {safetyPotData.monthsCovered >= 6 
                    ? `You have ${safetyPotData.monthsCovered.toFixed(1)} months of expenses covered. Your financial safety net is strong.`
                    : safetyPotData.monthsCovered >= 3
                      ? `You have ${safetyPotData.monthsCovered.toFixed(1)} months covered. Consider increasing to 6 months for optimal security.`
                      : `You only have ${safetyPotData.monthsCovered.toFixed(1)} months covered. This is below the recommended 3-6 month minimum.`
                  }
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span>
                    <strong>Monthly Target:</strong> {currencySymbol}{safetyPotData.monthlyTarget.toLocaleString()}
                  </span>
                  <span>
                    <strong>Last Contribution:</strong> {
                      safetyPotData.lastContribution 
                        ? new Date(safetyPotData.lastContribution).toLocaleDateString()
                        : 'None'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Expenses Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Monthly Expense Analysis
            </h3>
            
            {expenseAnalysis.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                No expense data available. Add some expenses to see detailed analysis.
              </p>
            ) : (
              <div className="space-y-3">
                {expenseAnalysis.slice(0, 6).map((expense) => (
                  <div key={expense.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white capitalize">
                          {expense.category}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          expense.volatility === 'high' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : expense.volatility === 'medium'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {expense.volatility} volatility
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {currencySymbol}{expense.averageMonthly.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {expense.trend} trend
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📈 Financial Security Analytics
            </h2>
            
            {/* Security Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(Math.min(safetyPotData.monthsCovered / 6 * 100, 100))}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Security Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {safetyPotData.monthsCovered >= 3 ? '✓' : '○'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minimum Met</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.ceil((safetyPotData.targetAmount - safetyPotData.currentAmount) / 200)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Months to Target</div>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900 dark:text-white">Risk Assessment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Job Loss Risk</h4>
                  <div className={`text-sm ${getRiskColor(safetyPotData.monthsCovered >= 6 ? 'low' : safetyPotData.monthsCovered >= 3 ? 'medium' : 'high')}`}>
                    {safetyPotData.monthsCovered >= 6 ? 'Low Risk' : safetyPotData.monthsCovered >= 3 ? 'Medium Risk' : 'High Risk'}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {safetyPotData.monthsCovered.toFixed(1)} months of coverage available
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Medical Emergency</h4>
                  <div className={`text-sm ${getRiskColor(safetyPotData.currentAmount >= 2000 ? 'low' : safetyPotData.currentAmount >= 1000 ? 'medium' : 'high')}`}>
                    {safetyPotData.currentAmount >= 2000 ? 'Low Risk' : safetyPotData.currentAmount >= 1000 ? 'Medium Risk' : 'High Risk'}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {currencySymbol}{safetyPotData.currentAmount.toLocaleString()} available for emergencies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {mlRecommendations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <span className="text-4xl mb-4 block">🤖</span>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                AI Analysis Complete
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your safety pot is optimally configured. No recommendations at this time.
              </p>
            </div>
          ) : (
            mlRecommendations.map((recommendation, index) => (
              <div key={index} className={`rounded-xl border p-6 ${getRecommendationColor(recommendation.type)}`}>
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{getRecommendationIcon(recommendation.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{recommendation.title}</h3>
                      <span className="text-sm font-medium bg-white bg-opacity-50 px-2 py-1 rounded-full">
                        {Math.round(recommendation.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <p className="text-sm mb-4">{recommendation.description}</p>
                    
                    {recommendation.suggestedAmount && (
                      <div className="bg-white bg-opacity-30 p-3 rounded-lg mb-4">
                        <div className="font-medium">Suggested Amount: {currencySymbol}{recommendation.suggestedAmount.toLocaleString()}</div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Why this recommendation:</h4>
                        <ul className="text-sm space-y-1">
                          {recommendation.reasoning.map((reason, reasonIndex) => (
                            <li key={reasonIndex} className="flex items-start space-x-2">
                              <span className="text-xs mt-1">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium">Risk Level: </span>
                          <span className={getRiskColor(recommendation.impactAnalysis.risk)}>
                            {recommendation.impactAnalysis.risk}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Benefit: </span>
                          <span>{recommendation.impactAnalysis.benefit}</span>
                        </div>
                        <div>
                          <span className="font-medium">Timeframe: </span>
                          <span>{recommendation.impactAnalysis.timeframe}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 mt-4">
                      <button className="bg-white bg-opacity-50 hover:bg-opacity-70 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Apply Recommendation
                      </button>
                      <button className="bg-white bg-opacity-30 hover:bg-opacity-50 px-4 py-2 rounded-lg text-sm transition-colors">
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contribution Modal */}
      {showContributeForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowContributeForm(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add to Safety Pot
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contribution Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowContributeForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleContribute}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Add Contribution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
