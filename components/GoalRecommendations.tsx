'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalRecommendation, GoalPrioritizationEngine } from '@/lib/goal-prioritization'
import { Goal } from '@/lib/api-client'

interface GoalRecommendationsProps {
  recommendations: GoalRecommendation[]
  goals: Goal[]
  onApplyRecommendation: (goalId: string, type: string, value: any) => void
  onDismissRecommendation: (goalId: string, type: string) => void
}

export function GoalRecommendations({ 
  recommendations, 
  goals, 
  onApplyRecommendation, 
  onDismissRecommendation 
}: GoalRecommendationsProps) {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null)

  if (recommendations.length === 0) {
    return null
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'amount': return '💰'
      case 'deadline': return '📅'
      case 'priority': return '🎯'
      case 'contribution': return '📈'
      default: return '💡'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20'
      default: return 'border-gray-200 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const formatValue = (type: string, value: any) => {
    switch (type) {
      case 'amount':
        return `£${Number(value).toLocaleString()}`
      case 'deadline':
        return new Date(value).toLocaleDateString()
      case 'priority':
        const priorityInfo = GoalPrioritizationEngine.getPriorityInfo(value)
        return priorityInfo.label
      case 'contribution':
        return `${(Number(value) * 100).toFixed(0)}%`
      default:
        return value
    }
  }

  const getGoalName = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    return goal?.name || 'Unknown Goal'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Smart Recommendations
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {recommendations.length} suggestion{recommendations.length !== 1 ? 's' : ''}
        </span>
      </div>

      <AnimatePresence>
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={`${recommendation.goalId}-${recommendation.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`border rounded-lg p-4 ${getImpactColor(recommendation.impact)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getRecommendationIcon(recommendation.type)}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {getGoalName(recommendation.goalId)}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    recommendation.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    recommendation.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    {recommendation.impact} impact
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {recommendation.reason}
                </p>

                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Current:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {formatValue(recommendation.type, recommendation.currentValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Recommended:</span>
                    <span className="ml-1 font-medium text-green-600 dark:text-green-400">
                      {formatValue(recommendation.type, recommendation.recommendedValue)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <button
                    onClick={() => onApplyRecommendation(
                      recommendation.goalId, 
                      recommendation.type, 
                      recommendation.recommendedValue
                    )}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Apply
                  </button>
                  
                  <button
                    onClick={() => onDismissRecommendation(recommendation.goalId, recommendation.type)}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
