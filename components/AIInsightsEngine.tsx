'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface InsightData {
  id: string
  type: 'savings' | 'spending' | 'goal' | 'partnership' | 'risk' | 'opportunity'
  category: string
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  action?: string
  data: any
  timestamp: Date
  priority: number
}

interface UserBehavior {
  contributionPattern: 'consistent' | 'increasing' | 'decreasing' | 'irregular'
  goalCompletionRate: number
  partnerReliability: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  savingsEfficiency: number
  spendingHabits: 'frugal' | 'balanced' | 'generous'
}

interface AIInsightsEngineProps {
  userId: string
  goals: any[]
  contributions: any[]
  expenses: any[]
  partnerships: any[]
  achievements: any[]
}

export function AIInsightsEngine({ 
  userId,
  goals,
  contributions,
  expenses, 
  partnerships,
  achievements
}: AIInsightsEngineProps) {
  const [insights, setInsights] = useState<InsightData[]>([])
  const [userBehavior, setUserBehavior] = useState<UserBehavior | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedInsight, setSelectedInsight] = useState<InsightData | null>(null)
  const [insightFilters, setInsightFilters] = useState<{
    types: string[]
    impact: string[]
    actionable: boolean | null
  }>({
    types: [],
    impact: [],
    actionable: null
  })



  const analyzeContributionPattern = useCallback((contributions: any[]): 'consistent' | 'increasing' | 'decreasing' | 'irregular' => {
    if (contributions.length < 3) return 'irregular'
    
    const monthlyTotals = contributions.reduce((acc: any, contribution: any) => {
      const month = new Date(contribution.created_at).toISOString().slice(0, 7)
      acc[month] = (acc[month] || 0) + contribution.amount
      return acc
    }, {})

    const months = Object.keys(monthlyTotals).sort()
    if (months.length < 3) return 'irregular'

    const values = months.map(month => monthlyTotals[month])
    const trend = calculateTrend(values)
    
    if (trend > 0.1) return 'increasing'
    if (trend < -0.1) return 'decreasing'
    if (Math.abs(trend) <= 0.1) return 'consistent'
    return 'irregular'
  }, [])

  const calculateTrend = (values: number[]): number => {
    if (values.length < 2) return 0
    
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val, i) => sum + val, 0)
    const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0)
    const sumX2 = values.reduce((sum, val, i) => sum + (i * i), 0)
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    return slope
  }

  const calculateGoalCompletionRate = (goals: any[]): number => {
    if (goals.length === 0) return 0
    
    const completedGoals = goals.filter(goal => goal.status === 'completed')
    return (completedGoals.length / goals.length) * 100
  }

  const calculatePartnerReliability = (partnerships: any[]): number => {
    if (partnerships.length === 0) return 0
    
    // Calculate based on partner contribution consistency and communication
    const reliabilityScores = partnerships.map(partnership => {
      const contributionConsistency = partnership.contribution_consistency || 0.7
      const communicationScore = partnership.communication_score || 0.8
      const responseTime = partnership.avg_response_time || 24 // hours
      
      const responseScore = Math.max(0, 1 - (responseTime / 72)) // 72 hours = 3 days
      
      return (contributionConsistency + communicationScore + responseScore) / 3
    })
    
    return reliabilityScores.reduce((sum, score) => sum + score, 0) / reliabilityScores.length
  }

  const assessRiskTolerance = (contributions: any[], expenses: any[], goals: any[]): 'conservative' | 'moderate' | 'aggressive' => {
    const avgContribution = contributions.length > 0 
      ? contributions.reduce((sum, c) => sum + c.amount, 0) / contributions.length 
      : 0
    
    const avgExpense = expenses.length > 0 
      ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length 
      : 0
    
    const savingsRatio = avgContribution / (avgExpense + avgContribution)
    
    if (savingsRatio >= 0.3) return 'conservative'
    if (savingsRatio >= 0.15) return 'moderate'
    return 'aggressive'
  }

  const calculateSavingsEfficiency = (contributions: any[], expenses: any[]): number => {
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    
    if (totalExpenses === 0) return 100
    
    return (totalContributions / (totalContributions + totalExpenses)) * 100
  }

  const analyzeSpendingHabits = (expenses: any[], contributions: any[]): 'frugal' | 'balanced' | 'generous' => {
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
    
    if (totalExpenses === 0) return 'frugal'
    
    const spendingRatio = totalExpenses / (totalExpenses + totalContributions)
    
    if (spendingRatio <= 0.3) return 'frugal'
    if (spendingRatio <= 0.6) return 'balanced'
    return 'generous'
  }

  const analyzeUserBehavior = useCallback(async () => {
    try {
      setLoading(true)
      
      // Analyze contribution patterns
      const contributionPattern = analyzeContributionPattern(contributions)
      const goalCompletionRate = calculateGoalCompletionRate(goals)
      const partnerReliability = calculatePartnerReliability(partnerships)
      const riskTolerance = assessRiskTolerance(contributions, expenses, goals)
      const savingsEfficiency = calculateSavingsEfficiency(contributions, expenses)
      const spendingHabits = analyzeSpendingHabits(expenses, contributions)

      const behavior: UserBehavior = {
        contributionPattern,
        goalCompletionRate,
        partnerReliability,
        riskTolerance,
        savingsEfficiency,
        spendingHabits
      }

      setUserBehavior(behavior)
    } catch (error) {
      console.error('Error analyzing user behavior:', error)
      toast.error('Failed to analyze user behavior')
    } finally {
      setLoading(false)
    }
  }, [goals, contributions, expenses, partnerships])



  const generateInsights = useCallback(async () => {
    try {
      const newInsights: InsightData[] = []
      
      // Generate insights based on user behavior
      if (userBehavior) {
        // Contribution pattern insights
        if (userBehavior.contributionPattern === 'decreasing') {
          newInsights.push({
            id: 'contribution-decline',
            type: 'savings',
            category: 'Contribution Pattern',
            title: 'Contribution Decline Detected',
            description: 'Your monthly contributions have been decreasing. Consider reviewing your budget or setting up automatic contributions.',
            confidence: 85,
            impact: 'medium',
            actionable: true,
            action: 'Review budget and set up automatic contributions',
            data: { pattern: userBehavior.contributionPattern },
            timestamp: new Date(),
            priority: 3
          })
        }

        // Goal completion insights
        if (userBehavior.goalCompletionRate < 50) {
          newInsights.push({
            id: 'low-goal-completion',
            type: 'goal',
            category: 'Goal Achievement',
            title: 'Low Goal Completion Rate',
            description: `You've completed ${userBehavior.goalCompletionRate.toFixed(1)}% of your goals. Consider breaking down larger goals into smaller milestones.`,
            confidence: 90,
          impact: 'high',
            actionable: true,
            action: 'Break down goals into smaller milestones',
            data: { completionRate: userBehavior.goalCompletionRate },
            timestamp: new Date(),
            priority: 2
          })
        }

        // Partner reliability insights
        if (userBehavior.partnerReliability < 0.7) {
          newInsights.push({
            id: 'partner-reliability',
            type: 'partnership',
            category: 'Partner Collaboration',
            title: 'Partner Reliability Concerns',
            description: 'Your partner\'s reliability score is below average. Consider having a conversation about expectations and communication.',
            confidence: 75,
        impact: 'medium',
            actionable: true,
            action: 'Schedule partner communication session',
            data: { reliability: userBehavior.partnerReliability },
            timestamp: new Date(),
            priority: 4
          })
        }

        // Risk tolerance insights
        if (userBehavior.riskTolerance === 'aggressive') {
          newInsights.push({
            id: 'risk-tolerance',
            type: 'risk',
            category: 'Risk Assessment',
            title: 'High Risk Tolerance Detected',
            description: 'Your financial behavior suggests an aggressive risk profile. Consider diversifying your savings across different risk levels.',
            confidence: 80,
            impact: 'medium',
            actionable: true,
            action: 'Review risk diversification strategy',
            data: { riskTolerance: userBehavior.riskTolerance },
            timestamp: new Date(),
            priority: 3
          })
        }

        // Savings efficiency insights
        if (userBehavior.savingsEfficiency < 30) {
          newInsights.push({
            id: 'savings-efficiency',
            type: 'savings',
            category: 'Savings Optimization',
            title: 'Low Savings Efficiency',
            description: `Your savings efficiency is ${userBehavior.savingsEfficiency.toFixed(1)}%. Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`,
            confidence: 85,
            impact: 'high',
            actionable: true,
            action: 'Implement 50/30/20 budgeting rule',
            data: { efficiency: userBehavior.savingsEfficiency },
            timestamp: new Date(),
            priority: 1
          })
        }

        // Spending habits insights
        if (userBehavior.spendingHabits === 'generous') {
          newInsights.push({
            id: 'spending-habits',
            type: 'spending',
            category: 'Spending Analysis',
            title: 'High Spending Pattern',
            description: 'Your spending habits suggest a generous lifestyle. While this can be positive, ensure it aligns with your long-term financial goals.',
            confidence: 75,
            impact: 'medium',
            actionable: true,
            action: 'Review spending alignment with goals',
            data: { spendingHabits: userBehavior.spendingHabits },
            timestamp: new Date(),
            priority: 3
          })
        }

        // Positive insights
        if (userBehavior.contributionPattern === 'increasing') {
          newInsights.push({
            id: 'contribution-improvement',
            type: 'opportunity',
            category: 'Positive Trend',
            title: 'Excellent Contribution Growth!',
            description: 'Your contributions are consistently increasing. Great job maintaining momentum!',
            confidence: 90,
            impact: 'low',
            actionable: false,
            data: { pattern: userBehavior.contributionPattern },
            timestamp: new Date(),
            priority: 5
          })
        }

        if (userBehavior.goalCompletionRate > 80) {
          newInsights.push({
            id: 'high-achievement',
            type: 'opportunity',
            category: 'Goal Achievement',
            title: 'Goal Master!',
            description: `You've completed ${userBehavior.goalCompletionRate.toFixed(1)}% of your goals. Consider setting more challenging targets!`,
            confidence: 95,
            impact: 'low',
            actionable: true,
            action: 'Set more challenging goals',
            data: { completionRate: userBehavior.goalCompletionRate },
            timestamp: new Date(),
            priority: 5
          })
        }
      }

      // Sort insights by priority and confidence
      newInsights.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        return b.confidence - a.confidence
      })

      setInsights(newInsights)
    } catch (error) {
      console.error('Error generating insights:', error)
      toast.error('Failed to generate insights')
    }
  }, [userBehavior])

  const handleInsightAction = (insight: InsightData) => {
    toast.success(`Action taken: ${insight.action}`)
    // Here you would implement the actual action
    // For now, we'll just show a success message
  }

  const getInsightIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      savings: '💰',
      spending: '💸',
      goal: '🎯',
      partnership: '🤝',
      risk: '⚠️',
      opportunity: '🚀'
    }
    return icons[type] || '💡'
  }

  const getImpactColor = (impact: string) => {
    const colors: { [key: string]: string } = {
      high: 'text-red-600 dark:text-red-400',
      medium: 'text-orange-600 dark:text-orange-400',
      low: 'text-green-600 dark:text-green-400'
    }
    return colors[impact] || 'text-gray-600 dark:text-gray-400'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400'
    if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const filteredInsights = insights.filter(insight => {
    if (insightFilters.types.length > 0 && !insightFilters.types.includes(insight.type)) return false
    if (insightFilters.impact.length > 0 && !insightFilters.impact.includes(insight.impact)) return false
    if (insightFilters.actionable !== null && insight.actionable !== insightFilters.actionable) return false
    return true
  })

  // Load data when component mounts or dependencies change
  useEffect(() => {
    analyzeUserBehavior()
    generateInsights()
  }, [goals, contributions, expenses, partnerships, achievements, analyzeUserBehavior, generateInsights])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">🤖</span>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights Engine</h2>
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
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">🤖</span>
          <div>
            <h1 className="text-2xl font-bold">AI Insights Engine</h1>
            <p className="text-purple-100">Intelligent financial analysis and recommendations</p>
          </div>
        </div>
      </div>

      {/* User Behavior Summary */}
      {userBehavior && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📊 Your Financial Profile
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Contribution Pattern</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {userBehavior.contributionPattern}
              </div>
                    </div>
                    
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Goal Completion</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {userBehavior.goalCompletionRate.toFixed(1)}%
                    </div>
                  </div>
                  
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Partner Reliability</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {(userBehavior.partnerReliability * 100).toFixed(1)}%
                </div>
              </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Risk Tolerance</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {userBehavior.riskTolerance}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Savings Efficiency</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {userBehavior.savingsEfficiency.toFixed(1)}%
              </div>
              </div>
              
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400">Spending Habits</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {userBehavior.spendingHabits}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🔍 Insight Filters
          </h2>
        <div className="flex flex-wrap gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Insight Type
            </label>
            <select
              multiple
              value={insightFilters.types}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setInsightFilters(prev => ({ ...prev, types: selected }))
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="savings">💰 Savings</option>
              <option value="spending">💸 Spending</option>
              <option value="goal">🎯 Goals</option>
              <option value="partnership">🤝 Partnership</option>
              <option value="risk">⚠️ Risk</option>
              <option value="opportunity">🚀 Opportunity</option>
            </select>
          </div>

          {/* Impact Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Impact Level
            </label>
            <select
              multiple
              value={insightFilters.impact}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setInsightFilters(prev => ({ ...prev, impact: selected }))
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
                </div>

          {/* Actionable Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actionable Only
            </label>
            <select
              value={insightFilters.actionable === null ? '' : insightFilters.actionable.toString()}
              onChange={(e) => {
                const value = e.target.value
                setInsightFilters(prev => ({ 
                  ...prev, 
                  actionable: value === '' ? null : value === 'true' 
                }))
              }}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Insights</option>
              <option value="true">Actionable Only</option>
              <option value="false">Informational Only</option>
            </select>
                </div>
              </div>
            </div>
            
      {/* Insights List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          💡 AI-Generated Insights ({filteredInsights.length})
        </h2>
        
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl block mb-2">🎉</span>
            <p>No insights match your current filters!</p>
            <p className="text-sm">Try adjusting your filters or check back later for new insights.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedInsight(insight)}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getInsightIcon(insight.type)}</span>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {insight.title}
              </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getImpactColor(insight.impact)} bg-gray-100 dark:bg-gray-700`}>
                        {insight.impact.toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(insight.confidence)} bg-gray-100 dark:bg-gray-700`}>
                        {insight.confidence}% confidence
                      </span>
                </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {insight.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-500">
                        {insight.category} • {insight.timestamp.toLocaleDateString()}
                </div>
                      
                      {insight.actionable && insight.action && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleInsightAction(insight)
                          }}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 transition-colors"
                        >
                          {insight.action}
                        </button>
                      )}
                </div>
              </div>
            </div>
              </motion.div>
            ))}
          </div>
        )}
        </div>

      {/* Insight Detail Modal */}
      <AnimatePresence>
      {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{getInsightIcon(selectedInsight.type)}</span>
                <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedInsight.title}
                </h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedInsight.category}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedInsight.description}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Confidence</div>
                    <div className={`font-semibold ${getConfidenceColor(selectedInsight.confidence)}`}>
                      {selectedInsight.confidence}%
                      </div>
                      </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Impact</div>
                    <div className={`font-semibold ${getImpactColor(selectedInsight.impact)}`}>
                      {selectedInsight.impact.toUpperCase()}
                    </div>
                  </div>
                </div>
                
                {selectedInsight.actionable && selectedInsight.action && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                      💡 Recommended Action
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 mb-3">
                      {selectedInsight.action}
                    </p>
                    <button
                      onClick={() => {
                        handleInsightAction(selectedInsight)
                        setSelectedInsight(null)
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Take Action
                    </button>
                </div>
                )}
              </div>
              
              <button
                onClick={() => setSelectedInsight(null)}
                className="mt-6 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            analyzeUserBehavior()
            generateInsights()
          }}
          className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
        >
          🔄 Refresh Insights
        </button>
        </div>
    </div>
  )
}
