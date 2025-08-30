'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { formatCurrency } from '@/lib/monthly-progress-utils'

interface OptimizationRecommendation {
  id: string
  category: 'savings' | 'expenses' | 'goals' | 'partnership' | 'investment' | 'debt'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'easy' | 'medium' | 'hard'
  estimatedSavings: number
  timeToImplement: string
  priority: number
  actionable: boolean
  action?: string
  subRecommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
  confidence: number
}

interface PerformanceMetrics {
  currentSavingsRate: number
  targetSavingsRate: number
  expenseEfficiency: number
  goalEfficiency: number
  partnerEfficiency: number
  overallScore: number
  improvementPotential: number
}

interface PerformanceOptimizerProps {
  userId: string
  goals: any[]
  contributions: any[]
  expenses: any[]
  partnerships: any[]
  achievements: any[]
  profile: any
}

export function PerformanceOptimizer({
  userId,
  goals,
  contributions,
  expenses,
  partnerships,
  achievements,
  profile
}: PerformanceOptimizerProps) {
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedImpact, setSelectedImpact] = useState<string>('all')
  const [selectedEffort, setSelectedEffort] = useState<string>('all')
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    analyzePerformance()
    generateRecommendations()
  }, [goals, contributions, expenses, partnerships, achievements, profile])

  const analyzePerformance = async () => {
    try {
      setLoading(true)
      
      const currentSavingsRate = calculateCurrentSavingsRate()
      const targetSavingsRate = 25 // Industry standard
      const expenseEfficiency = calculateExpenseEfficiency()
      const goalEfficiency = calculateGoalEfficiency()
      const partnerEfficiency = calculatePartnerEfficiency()
      const overallScore = calculateOverallScore(currentSavingsRate, expenseEfficiency, goalEfficiency, partnerEfficiency)
      const improvementPotential = calculateImprovementPotential(currentSavingsRate, targetSavingsRate, expenseEfficiency, goalEfficiency, partnerEfficiency)

      setMetrics({
        currentSavingsRate,
        targetSavingsRate,
        expenseEfficiency,
        goalEfficiency,
        partnerEfficiency,
        overallScore,
        improvementPotential
      })
    } catch (error) {
      console.error('Error analyzing performance:', error)
      toast.error('Failed to analyze performance')
    } finally {
      setLoading(false)
    }
  }

  const calculateCurrentSavingsRate = (): number => {
    const monthlyIncome = profile?.income || 5000 // Mock income
    const monthlyExpenses = expenses
      .filter(e => new Date(e.created_at) >= new Date(new Date().getFullYear(), new Date().getMonth(), 1))
      .reduce((sum, e) => sum + e.amount, 0)
    
    if (monthlyIncome === 0) return 0
    return ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
  }

  const calculateExpenseEfficiency = (): number => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    
    if (totalExpenses === 0) return 100
    
    // Calculate efficiency based on expense-to-contribution ratio
    const ratio = totalExpenses / (totalExpenses + totalContributions)
    return Math.max(0, (1 - ratio) * 100)
  }

  const calculateGoalEfficiency = (): number => {
    if (goals.length === 0) return 100
    
    const totalProgress = goals.reduce((sum, goal) => {
      const progress = goal.current_amount ? (goal.current_amount / goal.target_amount) : 0
      return sum + progress
    }, 0)
    
    return (totalProgress / goals.length) * 100
  }

  const calculatePartnerEfficiency = (): number => {
    if (partnerships.length === 0) return 100
    
    const efficiencyScores = partnerships.map(partnership => {
      const contributionConsistency = partnership.contribution_consistency || 0.7
      const communicationScore = partnership.communication_score || 0.8
      const goalAlignment = partnership.goal_alignment || 0.75
      
      return (contributionConsistency + communicationScore + goalAlignment) / 3 * 100
    })
    
    return efficiencyScores.reduce((sum, score) => sum + score, 0) / efficiencyScores.length
  }

  const calculateOverallScore = (savingsRate: number, expenseEfficiency: number, goalEfficiency: number, partnerEfficiency: number): number => {
    // Weighted average of all metrics
    const weights = {
      savings: 0.4,
      expenses: 0.3,
      goals: 0.2,
      partnership: 0.1
    }
    
    const normalizedSavings = Math.min(100, (savingsRate / 25) * 100) // Normalize to 25% target
    const normalizedExpenses = expenseEfficiency
    const normalizedGoals = goalEfficiency
    const normalizedPartnership = partnerEfficiency
    
    return (
      normalizedSavings * weights.savings +
      normalizedExpenses * weights.expenses +
      normalizedGoals * weights.goals +
      normalizedPartnership * weights.partnership
    )
  }

  const calculateImprovementPotential = (currentSavings: number, targetSavings: number, expenseEfficiency: number, goalEfficiency: number, partnerEfficiency: number): number => {
    let potential = 0
    
    // Savings rate improvement potential
    if (currentSavings < targetSavings) {
      potential += (targetSavings - currentSavings) * 2 // Weight savings heavily
    }
    
    // Expense efficiency improvement potential
    if (expenseEfficiency < 80) {
      potential += (80 - expenseEfficiency) * 1.5
    }
    
    // Goal efficiency improvement potential
    if (goalEfficiency < 90) {
      potential += (90 - goalEfficiency) * 1.2
    }
    
    // Partnership efficiency improvement potential
    if (partnerEfficiency < 85) {
      potential += (85 - partnerEfficiency) * 1.0
    }
    
    return Math.min(100, potential)
  }

  const generateRecommendations = async () => {
    try {
      const newRecommendations: OptimizationRecommendation[] = []
      
      // Savings rate optimization
      if (metrics && metrics.currentSavingsRate < metrics.targetSavingsRate) {
        const savingsGap = metrics.targetSavingsRate - metrics.currentSavingsRate
        
        newRecommendations.push({
          id: 'increase-savings-rate',
          category: 'savings',
          title: 'Increase Monthly Savings Rate',
          description: `Your current savings rate is ${metrics.currentSavingsRate.toFixed(1)}%. Increase it to ${metrics.targetSavingsRate}% for better financial security.`,
          impact: 'high',
          effort: 'medium',
          estimatedSavings: (profile?.income || 5000) * (savingsGap / 100) * 12,
          timeToImplement: '1-2 months',
          priority: 1,
          actionable: true,
          action: 'Set up automatic savings transfers',
          subRecommendations: [
            'Review monthly budget for savings opportunities',
            'Set up automatic transfers on payday',
            'Use the 50/30/20 budgeting rule',
            'Track all expenses to identify waste'
          ],
          riskLevel: 'low',
          confidence: 95
        })
      }

      // Expense optimization
      if (metrics && metrics.expenseEfficiency < 70) {
        newRecommendations.push({
          id: 'optimize-expenses',
          category: 'expenses',
          title: 'Optimize Monthly Expenses',
          description: 'Your expense efficiency is below optimal. Identify and reduce unnecessary spending.',
          impact: 'high',
          effort: 'medium',
          estimatedSavings: 300, // Estimated monthly savings
          timeToImplement: '2-3 months',
          priority: 2,
          actionable: true,
          action: 'Conduct expense audit',
          subRecommendations: [
            'Review subscription services',
            'Negotiate better rates on utilities',
            'Implement meal planning to reduce food costs',
            'Use cashback and discount apps'
          ],
          riskLevel: 'low',
          confidence: 85
        })
      }

      // Goal optimization
      if (metrics && metrics.goalEfficiency < 80) {
        newRecommendations.push({
          id: 'optimize-goals',
          category: 'goals',
          title: 'Optimize Goal Achievement Strategy',
          description: 'Improve your goal completion rate by optimizing your approach to savings goals.',
          impact: 'medium',
          effort: 'easy',
          estimatedSavings: 200, // Estimated monthly improvement
          timeToImplement: '1 month',
          priority: 3,
          actionable: true,
          action: 'Review and prioritize goals',
          subRecommendations: [
            'Break down large goals into smaller milestones',
            'Prioritize goals by importance and urgency',
            'Adjust contribution amounts based on priority',
            'Set realistic timelines for each goal'
          ],
          riskLevel: 'low',
          confidence: 80
        })
      }

      // Partnership optimization
      if (metrics && metrics.partnerEfficiency < 80) {
        newRecommendations.push({
          id: 'optimize-partnership',
          category: 'partnership',
          title: 'Improve Partner Collaboration',
          description: 'Enhance your financial partnership for better results.',
          impact: 'medium',
          effort: 'medium',
          estimatedSavings: 150, // Estimated monthly improvement
          timeToImplement: '2-4 months',
          priority: 4,
          actionable: true,
          action: 'Schedule partnership review session',
          subRecommendations: [
            'Set clear contribution expectations',
            'Improve communication about finances',
            'Align on shared financial goals',
            'Create accountability mechanisms'
          ],
          riskLevel: 'low',
          confidence: 75
        })
      }

      // Investment optimization
      newRecommendations.push({
        id: 'investment-strategy',
        category: 'investment',
        title: 'Develop Investment Strategy',
        description: 'Consider investing your savings for long-term wealth building.',
        impact: 'high',
        effort: 'hard',
        estimatedSavings: 500, // Potential annual returns
        timeToImplement: '3-6 months',
        priority: 5,
        actionable: true,
        action: 'Consult with financial advisor',
        subRecommendations: [
          'Research different investment options',
          'Understand your risk tolerance',
          'Diversify your investment portfolio',
          'Start with low-cost index funds'
        ],
        riskLevel: 'medium',
        confidence: 70
      })

      // Debt optimization
      const totalDebt = expenses
        .filter(e => e.category === 'Debt' || e.category === 'Credit Card')
        .reduce((sum, e) => sum + e.amount, 0)
      
      if (totalDebt > 0) {
        newRecommendations.push({
          id: 'debt-optimization',
          category: 'debt',
          title: 'Optimize Debt Management',
          description: 'Develop a strategy to pay off debt efficiently and reduce interest costs.',
          impact: 'high',
          effort: 'medium',
          estimatedSavings: totalDebt * 0.15, // Estimated interest savings
          timeToImplement: '6-12 months',
          priority: 2,
          actionable: true,
          action: 'Create debt repayment plan',
          subRecommendations: [
            'List all debts with interest rates',
            'Prioritize high-interest debt first',
            'Consider debt consolidation options',
            'Negotiate lower interest rates'
          ],
          riskLevel: 'medium',
          confidence: 85
        })
      }

      // Sort by priority and impact
      newRecommendations.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        
        const impactScore = { high: 3, medium: 2, low: 1 }
        return impactScore[b.impact] - impactScore[a.impact]
      })

      setRecommendations(newRecommendations)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('Failed to generate recommendations')
    }
  }

  const handleRecommendationAction = (recommendation: OptimizationRecommendation) => {
    toast.success(`Action taken: ${recommendation.action}`)
    // Here you would implement the actual action
    // For now, we'll just show a success message
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      savings: '💰',
      expenses: '💸',
      goals: '🎯',
      partnership: '🤝',
      investment: '📈',
      debt: '💳'
    }
    return icons[category] || '💡'
  }

  const getImpactColor = (impact: string) => {
    const colors: { [key: string]: string } = {
      high: 'text-red-600 dark:text-red-400',
      medium: 'text-orange-600 dark:text-orange-400',
      low: 'text-green-600 dark:text-green-400'
    }
    return colors[impact] || 'text-gray-600 dark:text-gray-400'
  }

  const getEffortColor = (effort: string) => {
    const colors: { [key: string]: string } = {
      easy: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      hard: 'text-red-600 dark:text-red-400'
    }
    return colors[effort] || 'text-gray-600 dark:text-gray-400'
  }

  const getRiskColor = (risk: string) => {
    const colors: { [key: string]: string } = {
      low: 'text-green-600 dark:text-green-400',
      medium: 'text-yellow-600 dark:text-yellow-400',
      high: 'text-red-600 dark:text-red-400'
    }
    return colors[risk] || 'text-gray-600 dark:text-gray-400'
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) return false
    if (selectedImpact !== 'all' && rec.impact !== selectedImpact) return false
    if (selectedEffort !== 'all' && rec.effort !== selectedEffort) return false
    return true
  })

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">⚡</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Optimizer</h2>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">⚡</span>
          <div>
            <h1 className="text-2xl font-bold">Performance Optimizer</h1>
            <p className="text-green-100">Intelligent financial optimization recommendations</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {metrics && (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📊 Your Performance Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.overallScore.toFixed(1)}/100
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Overall Score</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.currentSavingsRate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Savings Rate</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.expenseEfficiency.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Expense Efficiency</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.improvementPotential.toFixed(1)}%
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Improvement Potential</div>
            </div>
          </div>

          {/* Performance Gauge */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Performance Level</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {metrics.overallScore >= 80 ? 'Excellent' : 
                 metrics.overallScore >= 60 ? 'Good' : 
                 metrics.overallScore >= 40 ? 'Fair' : 'Poor'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-500 ${
                  metrics.overallScore >= 80 ? 'bg-green-500' :
                  metrics.overallScore >= 60 ? 'bg-blue-500' :
                  metrics.overallScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.overallScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔍 Filter Recommendations
        </h2>
        <div className="flex flex-wrap gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="savings">💰 Savings</option>
              <option value="expenses">💸 Expenses</option>
              <option value="goals">🎯 Goals</option>
              <option value="partnership">🤝 Partnership</option>
              <option value="investment">📈 Investment</option>
              <option value="debt">💳 Debt</option>
            </select>
          </div>

          {/* Impact Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Impact Level
            </label>
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Impact Levels</option>
              <option value="high">🔴 High Impact</option>
              <option value="medium">🟡 Medium Impact</option>
              <option value="low">🟢 Low Impact</option>
            </select>
          </div>

          {/* Effort Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Implementation Effort
            </label>
            <select
              value={selectedEffort}
              onChange={(e) => setSelectedEffort(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Effort Levels</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          💡 Optimization Recommendations ({filteredRecommendations.length})
        </h2>
        
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl block mb-2">🎉</span>
            <p>No recommendations match your current filters!</p>
            <p className="text-sm">Try adjusting your filters or check back later for new recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <motion.div
                key={recommendation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <span className="text-3xl">{getCategoryIcon(recommendation.category)}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {recommendation.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(recommendation.impact)} bg-gray-100 dark:bg-gray-700`}>
                        {recommendation.impact.toUpperCase()} IMPACT
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getEffortColor(recommendation.effort)} bg-gray-100 dark:bg-gray-700`}>
                        {recommendation.effort.toUpperCase()} EFFORT
                </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRiskColor(recommendation.riskLevel)} bg-gray-100 dark:bg-gray-700`}>
                        {recommendation.riskLevel.toUpperCase()} RISK
                </span>
              </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {recommendation.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(recommendation.estimatedSavings)}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">Annual Savings</div>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {recommendation.timeToImplement}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">Time to Implement</div>
                      </div>
                      
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {recommendation.confidence}%
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">Confidence</div>
                      </div>
                    </div>
                    
                    {recommendation.subRecommendations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Implementation Steps:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {recommendation.subRecommendations.map((step, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="text-blue-500">•</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {recommendation.actionable && recommendation.action && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRecommendationAction(recommendation)}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          {recommendation.action}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ⚡ Quick Optimization Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => toast.success('Opening budget review tool...')}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-left"
          >
            <div className="text-center">
              <span className="text-3xl block mb-2">📊</span>
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-1">
                Review Budget
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Analyze your spending patterns
              </p>
            </div>
          </button>
          
          <button
            onClick={() => toast.success('Opening goal optimization tool...')}
            className="p-4 bg-green-50 dark:bg-green-900/20 border-2 border-dashed border-green-300 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-left"
          >
            <div className="text-center">
              <span className="text-3xl block mb-2">🎯</span>
              <h3 className="font-semibold text-green-900 dark:text-green-200 mb-1">
                Optimize Goals
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Improve goal achievement strategy
              </p>
            </div>
          </button>
          
          <button
            onClick={() => toast.success('Opening partnership review tool...')}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
          >
            <div className="text-center">
              <span className="text-3xl block mb-2">🤝</span>
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-1">
                Review Partnership
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Enhance partner collaboration
            </p>
          </div>
          </button>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            analyzePerformance()
            generateRecommendations()
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
        >
          🔄 Refresh Analysis
        </button>
      </div>
    </div>
  )
}
