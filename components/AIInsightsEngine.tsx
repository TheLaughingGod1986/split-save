import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface AIInsightsEngineProps {
  expenses: any[]
  goals: any[]
  profile: any
  partnerProfile: any
  currencySymbol: string
  partnerships: any[]
}

interface FinancialInsight {
  id: string
  type: 'recommendation' | 'prediction' | 'optimization' | 'alert'
  category: 'expenses' | 'savings' | 'goals' | 'budget' | 'risk'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  actionItems: string[]
  estimatedSavings?: number
  priority: number
  timestamp: Date
}

interface PredictiveAnalysis {
  expenseForecast: {
    nextMonth: number
    nextQuarter: number
    nextYear: number
    confidence: number
  }
  goalTimeline: {
    goalId: string
    estimatedCompletion: Date
    confidence: number
    recommendations: string[]
  }[]
  financialHealth: {
    score: number
    trend: 'improving' | 'stable' | 'declining'
    factors: string[]
  }
}

export function AIInsightsEngine({ 
  expenses, 
  goals, 
  profile, 
  partnerProfile, 
  currencySymbol,
  partnerships 
}: AIInsightsEngineProps) {
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [predictions, setPredictions] = useState<PredictiveAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<FinancialInsight | null>(null)
  const [activeTab, setActiveTab] = useState<'insights' | 'predictions' | 'planning' | 'optimization'>('insights')

  useEffect(() => {
    if (expenses.length > 0 && goals.length > 0) {
      generateInsights()
      generatePredictions()
    }
  }, [expenses, goals, profile])

  const generateInsights = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate AI analysis time
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newInsights = await analyzeFinancialData()
      setInsights(newInsights)
      
      toast.success('🤖 AI analysis complete! New insights available')
    } catch (error) {
      console.error('AI analysis failed:', error)
      toast.error('AI analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generatePredictions = async () => {
    try {
      const analysis = await generatePredictiveAnalysis()
      setPredictions(analysis)
    } catch (error) {
      console.error('Prediction generation failed:', error)
    }
  }

  const analyzeFinancialData = async (): Promise<FinancialInsight[]> => {
    const insights: FinancialInsight[] = []
    
    // Analyze expenses
    const expenseInsights = analyzeExpensePatterns()
    insights.push(...expenseInsights)
    
    // Analyze savings and goals
    const savingsInsights = analyzeSavingsPatterns()
    insights.push(...savingsInsights)
    
    // Analyze budget optimization
    const budgetInsights = analyzeBudgetOptimization()
    insights.push(...budgetInsights)
    
    // Analyze risk factors
    const riskInsights = analyzeRiskFactors()
    insights.push(...riskInsights)
    
    // Sort by priority and impact
    return insights.sort((a, b) => {
      const priorityScore = b.priority - a.priority
      if (priorityScore !== 0) return priorityScore
      
      const impactScore = getImpactScore(b.impact) - getImpactScore(a.impact)
      return impactScore
    })
  }

  const analyzeExpensePatterns = (): FinancialInsight[] => {
    const insights: FinancialInsight[] = []
    
    // Analyze recurring expenses
    const recurringExpenses = expenses.filter(exp => exp.is_recurring)
    if (recurringExpenses.length > 0) {
      const totalRecurring = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const monthlyIncome = profile?.income || 0
      
      if (totalRecurring > monthlyIncome * 0.6) {
        insights.push({
          id: 'recurring-expenses-high',
          type: 'alert',
          category: 'expenses',
          title: 'High Recurring Expenses',
          description: `Your recurring expenses (${currencySymbol}${totalRecurring.toFixed(2)}) represent ${((totalRecurring / monthlyIncome) * 100).toFixed(1)}% of your monthly income. Consider reviewing and optimizing these expenses.`,
          impact: 'high',
          confidence: 0.95,
          actionItems: [
            'Review subscription services',
            'Negotiate better rates',
            'Consider bundling services'
          ],
          estimatedSavings: totalRecurring * 0.15,
          priority: 9,
          timestamp: new Date()
        })
      }
    }
    
    // Analyze spending categories
    const categorySpending = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount
      return acc
    }, {} as Record<string, number>)
    
    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]
    
    if (topCategory) {
      const [category, amount] = topCategory
      const totalSpending = Object.values(categorySpending).reduce((sum, val) => (sum as number) + (val as number), 0) as number
      const percentage = ((amount as number) / totalSpending) * 100
      
      if (percentage > 40) {
        insights.push({
          id: 'category-concentration',
          type: 'recommendation',
          category: 'expenses',
          title: 'Category Concentration Risk',
          description: `${category} expenses represent ${percentage.toFixed(1)}% of your total spending. Consider diversifying your expenses to reduce risk.`,
          impact: 'medium',
          confidence: 0.88,
          actionItems: [
            'Review spending in this category',
            'Look for alternatives',
            'Set category-specific budgets'
          ],
          priority: 7,
          timestamp: new Date()
        })
      }
    }
    
    return insights
  }

  const analyzeSavingsPatterns = (): FinancialInsight[] => {
    const insights: FinancialInsight[] = []
    
    // Analyze goal progress
    const activeGoals = goals.filter(goal => goal.current_amount < goal.target_amount)
    const totalGoalValue = activeGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
    const totalCurrentValue = activeGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
    const progressPercentage = (totalCurrentValue / totalGoalValue) * 100
    
    if (progressPercentage < 25) {
      insights.push({
        id: 'goals-slow-progress',
        type: 'recommendation',
        category: 'goals',
        title: 'Accelerate Goal Progress',
        description: `You're ${(100 - progressPercentage).toFixed(1)}% away from your savings goals. Consider increasing monthly contributions to reach them faster.`,
        impact: 'high',
        confidence: 0.92,
        actionItems: [
          'Increase monthly contributions',
          'Review goal priorities',
          'Consider additional income sources'
        ],
        priority: 8,
        timestamp: new Date()
      })
    }
    
    // Analyze emergency fund
    const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const emergencyFund = profile?.safety_pot_target || 0
    const monthsCovered = emergencyFund / monthlyExpenses
    
    if (monthsCovered < 3) {
      insights.push({
        id: 'emergency-fund-low',
        type: 'alert',
        category: 'savings',
        title: 'Emergency Fund Needs Attention',
        description: `Your emergency fund covers ${monthsCovered.toFixed(1)} months of expenses. Aim for 3-6 months coverage for financial security.`,
        impact: 'high',
        confidence: 0.96,
        actionItems: [
          'Increase monthly safety pot contributions',
          'Reduce non-essential expenses',
          'Set up automatic transfers'
        ],
        estimatedSavings: monthlyExpenses * (3 - monthsCovered),
        priority: 10,
        timestamp: new Date()
      })
    }
    
    return insights
  }

  const analyzeBudgetOptimization = (): FinancialInsight[] => {
    const insights: FinancialInsight[] = []
    
    // Analyze income vs expenses
    const monthlyIncome = profile?.income || 0
    const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    
    if (savingsRate < 20) {
      insights.push({
        id: 'low-savings-rate',
        type: 'optimization',
        category: 'budget',
        title: 'Optimize Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Aim for 20%+ for healthy financial growth.`,
        impact: 'medium',
        confidence: 0.89,
        actionItems: [
          'Review discretionary spending',
          'Implement 50/30/20 budget rule',
          'Automate savings transfers'
        ],
        priority: 6,
        timestamp: new Date()
      })
    }
    
    // Analyze partner contribution balance
    if (partnerProfile) {
      const partnerIncome = partnerProfile.income || 0
      const totalIncome = monthlyIncome + partnerIncome
      const myContribution = monthlyExpenses * (monthlyIncome / totalIncome)
      const partnerContribution = monthlyExpenses * (partnerIncome / totalIncome)
      
      if (Math.abs(myContribution - partnerContribution) > monthlyExpenses * 0.1) {
        insights.push({
          id: 'contribution-imbalance',
          type: 'recommendation',
          category: 'budget',
          title: 'Contribution Balance Opportunity',
          description: 'Your contributions are not proportionally balanced. Consider adjusting to align with income ratios.',
          impact: 'medium',
          confidence: 0.85,
          actionItems: [
            'Review contribution ratios',
            'Adjust monthly contributions',
            'Communicate with partner'
          ],
          priority: 5,
          timestamp: new Date()
        })
      }
    }
    
    return insights
  }

  const analyzeRiskFactors = (): FinancialInsight[] => {
    const insights: FinancialInsight[] = []
    
    // Analyze debt-to-income ratio
    const monthlyIncome = profile?.income || 0
    const monthlyDebt = expenses.filter(exp => exp.category === 'Debt').reduce((sum, exp) => sum + exp.amount, 0)
    const debtToIncomeRatio = (monthlyDebt / monthlyIncome) * 100
    
    if (debtToIncomeRatio > 30) {
      insights.push({
        id: 'high-debt-ratio',
        type: 'alert',
        category: 'risk',
        title: 'High Debt-to-Income Ratio',
        description: `Your debt payments represent ${debtToIncomeRatio.toFixed(1)}% of your income. Consider debt consolidation or repayment strategies.`,
        impact: 'high',
        confidence: 0.94,
        actionItems: [
          'Create debt repayment plan',
          'Consider debt consolidation',
          'Reduce new debt accumulation'
        ],
        priority: 9,
        timestamp: new Date()
      })
    }
    
    // Analyze goal timeline risks
    const longTermGoals = goals.filter(goal => {
      if (!goal.target_date) return false
      const targetDate = new Date(goal.target_date)
      const yearsToTarget = (targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 365)
      return yearsToTarget > 5
    })
    
    if (longTermGoals.length > 0) {
      insights.push({
        id: 'long-term-goal-risk',
        type: 'recommendation',
        category: 'risk',
        title: 'Long-term Goal Planning',
        description: `You have ${longTermGoals.length} long-term goals. Consider inflation and market changes in your planning.`,
        impact: 'medium',
        confidence: 0.82,
        actionItems: [
          'Review goal timelines',
          'Adjust for inflation',
          'Consider investment options'
        ],
        priority: 4,
        timestamp: new Date()
      })
    }
    
    return insights
  }

  const generatePredictiveAnalysis = async (): Promise<PredictiveAnalysis> => {
    // Expense forecasting based on historical patterns
    const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const expenseTrend = calculateExpenseTrend()
    
    const expenseForecast = {
      nextMonth: monthlyExpenses * (1 + expenseTrend),
      nextQuarter: monthlyExpenses * (1 + expenseTrend) * 3,
      nextYear: monthlyExpenses * (1 + expenseTrend) * 12,
      confidence: 0.85
    }
    
    // Goal timeline predictions
    const goalTimeline = goals.map(goal => {
      const monthlyContribution = goal.monthly_contribution || 0
      const remainingAmount = goal.target_amount - goal.current_amount
      const monthsToComplete = monthlyContribution > 0 ? remainingAmount / monthlyContribution : 999
      
      const estimatedCompletion = new Date()
      estimatedCompletion.setMonth(estimatedCompletion.getMonth() + monthsToComplete)
      
      return {
        goalId: goal.id,
        estimatedCompletion,
        confidence: monthlyContribution > 0 ? 0.9 : 0.3,
        recommendations: generateGoalRecommendations(goal, monthlyContribution, remainingAmount)
      }
    })
    
    // Financial health score
    const financialHealth = calculateFinancialHealthScore()
    
    return {
      expenseForecast,
      goalTimeline,
      financialHealth
    }
  }

  const calculateExpenseTrend = (): number => {
    if (expenses.length < 2) return 0
    
    const monthlyTotals = expenses.reduce((acc, exp) => {
      const month = new Date(exp.date).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + exp.amount
      return acc
    }, {} as Record<string, number>)
    
    const months = Object.keys(monthlyTotals).sort()
    if (months.length < 2) return 0
    
    const recent = monthlyTotals[months[months.length - 1]]
    const previous = monthlyTotals[months[months.length - 2]]
    
    return previous > 0 ? (recent - previous) / previous : 0
  }

  const generateGoalRecommendations = (goal: any, monthlyContribution: number, remainingAmount: number): string[] => {
    const recommendations: string[] = []
    
    if (monthlyContribution === 0) {
      recommendations.push('Set up monthly contributions to start progress')
    } else if (monthlyContribution < remainingAmount / 12) {
      recommendations.push('Consider increasing monthly contributions to reach goal faster')
    }
    
    if (goal.priority === 'High') {
      recommendations.push('This is a high-priority goal - consider allocating more resources')
    }
    
    if (remainingAmount > profile?.income * 2) {
      recommendations.push('Large goal amount - consider breaking into smaller milestones')
    }
    
    return recommendations
  }

  const calculateFinancialHealthScore = () => {
    let score = 100
    
    // Deduct for high debt ratio
    const monthlyIncome = profile?.income || 0
    const monthlyDebt = expenses.filter(exp => exp.category === 'Debt').reduce((sum, exp) => sum + exp.amount, 0)
    const debtRatio = (monthlyDebt / monthlyIncome) * 100
    if (debtRatio > 30) score -= 30
    else if (debtRatio > 20) score -= 20
    else if (debtRatio > 10) score -= 10
    
    // Deduct for low emergency fund
    const monthlyExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const emergencyFund = profile?.safety_pot_target || 0
    const monthsCovered = emergencyFund / monthlyExpenses
    if (monthsCovered < 1) score -= 25
    else if (monthsCovered < 3) score -= 15
    else if (monthsCovered < 6) score -= 5
    
    // Deduct for low savings rate
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
    if (savingsRate < 10) score -= 20
    else if (savingsRate < 20) score -= 10
    
    // Add for goal progress
    const activeGoals = goals.filter(goal => goal.current_amount < goal.target_amount)
    if (activeGoals.length > 0) {
      const avgProgress = activeGoals.reduce((sum, goal) => {
        return sum + (goal.current_amount / goal.target_amount)
      }, 0) / activeGoals.length
      if (avgProgress > 0.5) score += 10
    }
    
    const trend: 'improving' | 'stable' | 'declining' = score > 70 ? 'improving' : score > 50 ? 'stable' : 'declining'
    
    return {
      score: Math.max(0, Math.min(100, score)),
      trend,
      factors: generateHealthFactors(score, debtRatio, monthsCovered, savingsRate)
    }
  }

  const generateHealthFactors = (score: number, debtRatio: number, monthsCovered: number, savingsRate: number): string[] => {
    const factors: string[] = []
    
    if (debtRatio > 20) factors.push('High debt ratio')
    if (monthsCovered < 3) factors.push('Insufficient emergency fund')
    if (savingsRate < 20) factors.push('Low savings rate')
    if (score > 80) factors.push('Strong financial foundation')
    if (score > 60) factors.push('Good financial habits')
    
    return factors
  }

  const getImpactScore = (impact: 'high' | 'medium' | 'low'): number => {
    switch (impact) {
      case 'high': return 3
      case 'medium': return 2
      case 'low': return 1
      default: return 0
    }
  }

  const getInsightIcon = (type: string): string => {
    switch (type) {
      case 'recommendation': return '💡'
      case 'prediction': return '🔮'
      case 'optimization': return '⚡'
      case 'alert': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const getImpactColor = (impact: 'high' | 'medium' | 'low'): string => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.7) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🤖</span>
          <div>
            <h1 className="text-2xl font-bold">AI Financial Insights</h1>
            <p className="text-blue-100">Intelligent analysis and recommendations for your financial success</p>
          </div>
        </div>
        
        <button
          onClick={generateInsights}
          disabled={isAnalyzing}
          className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {isAnalyzing ? '🔄 Analyzing...' : '🔄 Refresh Analysis'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'insights', label: 'Smart Insights', icon: '💡' },
          { id: 'predictions', label: 'Predictions', icon: '🔮' },
          { id: 'planning', label: 'AI Planning', icon: '🤖' },
          { id: 'optimization', label: 'Optimization', icon: '⚡' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
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
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Smart Financial Insights ({insights.length})
          </h2>
          
          {insights.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-4 block">🤖</span>
              <p>No insights available yet. Click "Refresh Analysis" to generate AI-powered recommendations.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedInsight(insight)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {insight.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`font-medium ${getImpactColor(insight.impact)}`}>
                            {insight.impact.toUpperCase()} IMPACT
                          </span>
                          <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
                            {(insight.confidence * 100).toFixed(0)}% CONFIDENCE
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {insight.priority}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">PRIORITY</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {insight.description}
                  </p>
                  
                  {insight.estimatedSavings && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 dark:text-green-400">💰</span>
                        <span className="text-green-800 dark:text-green-200 font-medium">
                          Potential Savings: {currencySymbol}{insight.estimatedSavings.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">Recommended Actions:</h4>
                    <ul className="space-y-1">
                      {insight.actionItems.map((action, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-blue-500">→</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Financial Predictions & Forecasts
          </h2>
          
          {predictions ? (
            <div className="space-y-6">
              {/* Expense Forecast */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🔮 Expense Forecast
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {currencySymbol}{predictions.expenseForecast.nextMonth.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Next Month</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {(predictions.expenseForecast.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {currencySymbol}{predictions.expenseForecast.nextQuarter.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Next Quarter</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {currencySymbol}{predictions.expenseForecast.nextYear.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Next Year</div>
                  </div>
                </div>
              </div>

              {/* Goal Timeline */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🎯 Goal Achievement Timeline
                </h3>
                <div className="space-y-4">
                  {predictions.goalTimeline.map((timeline) => {
                    const goal = goals.find(g => g.id === timeline.goalId)
                    if (!goal) return null
                    
                    return (
                      <div key={timeline.goalId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {goal.name}
                          </h4>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            timeline.confidence > 0.7 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                              : timeline.confidence > 0.4
                              ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                          }`}>
                            {(timeline.confidence * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Estimated completion: {timeline.estimatedCompletion.toLocaleDateString()}
                        </div>
                        <div className="space-y-1">
                          {timeline.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="text-blue-500">•</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Financial Health */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🏥 Financial Health Score
                </h3>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {predictions.financialHealth.score}/100
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {predictions.financialHealth.trend === 'improving' ? '🟢 Improving' : 
                     predictions.financialHealth.trend === 'stable' ? '🟡 Stable' : '🔴 Declining'}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Key Factors:</h4>
                  <ul className="space-y-1">
                    {predictions.financialHealth.factors.map((factor, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-blue-500">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-4 block">🔮</span>
              <p>Generating predictions... This may take a moment.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'planning' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI-Powered Financial Planning
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🤖 Automated Planning Recommendations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Our AI analyzes your financial patterns and suggests optimal strategies for achieving your goals.
            </p>
            
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  🎯 Goal Prioritization Strategy
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Based on your current financial situation, we recommend focusing on high-impact, achievable goals first.
                </p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
                  💰 Contribution Optimization
                </h4>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Our AI suggests optimal contribution amounts to maximize goal achievement while maintaining financial stability.
                </p>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">
                  🔄 Dynamic Adjustment System
                </h4>
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Automatically adjust your financial plan based on changing circumstances and new opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Financial Optimization Strategies
          </h2>
          
          <div className="grid gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ⚡ Expense Optimization
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Subscription Review</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Save up to 15%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Bulk Purchasing</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Save up to 20%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Negotiate Rates</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Save up to 25%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                🚀 Savings Acceleration
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Round-up Savings</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+£50/month</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Extra Income Allocation</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+£100/month</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-700 dark:text-gray-300">Goal Prioritization</span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+25% efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedInsight.title}
                </h2>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedInsight.description}
                </p>
                
                {selectedInsight.estimatedSavings && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {currencySymbol}{selectedInsight.estimatedSavings.toFixed(2)}
                      </div>
                      <div className="text-green-800 dark:text-green-200">
                        Potential Monthly Savings
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Recommended Actions:
                  </h4>
                  <ul className="space-y-2">
                    {selectedInsight.actionItems.map((action, index) => (
                      <li key={index} className="flex items-start space-x-2 text-gray-600 dark:text-gray-400">
                        <span className="text-blue-500 mt-1">→</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Impact: <span className={getImpactColor(selectedInsight.impact)}>{selectedInsight.impact.toUpperCase()}</span></span>
                  <span>Confidence: <span className={getConfidenceColor(selectedInsight.confidence)}>{(selectedInsight.confidence * 100).toFixed(0)}%</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
