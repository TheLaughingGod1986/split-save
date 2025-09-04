'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GoalAllocation, GoalPrioritizationEngine } from '@/lib/goal-prioritization'
import { Goal } from '@/lib/api-client'

interface GoalAllocationViewProps {
  allocations: GoalAllocation[]
  goals: Goal[]
}

export function GoalAllocationView({ 
  allocations, 
  goals
}: GoalAllocationViewProps) {
  if (allocations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No active goals</h3>
        <p className="text-sm">Create goals to see allocation recommendations</p>
      </div>
    )
  }

  const getGoalName = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    return goal?.name || 'Unknown Goal'
  }

  const getGoalIcon = (goalId: string) => {
    const goal = goals.find(g => g.id === goalId)
    const category = goal?.category || 'other'
    
    const categoryIcons: { [key: string]: string } = {
      'emergency': '🛡️',
      'house': '🏠',
      'car': '🚗',
      'vacation': '✈️',
      'wedding': '💒',
      'education': '🎓',
      'business': '💼',
      'other': '🎯'
    }
    
    return categoryIcons[category] || '🎯'
  }

  const getPriorityColor = (priority: number) => {
    const priorityInfo = GoalPrioritizationEngine.getPriorityInfo(priority)
    return priorityInfo.color
  }

  const getRiskColor = (riskLevel: string) => {
    const riskInfo = GoalPrioritizationEngine.getRiskLevelInfo(riskLevel)
    return riskInfo.color
  }

  const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.recommendedAllocation, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Goal Allocations
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Total: {totalAllocation.toFixed(1)}%
        </div>
      </div>

      <div className="space-y-4">
        {allocations.map((allocation, index) => (
          <motion.div
            key={allocation.goalId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{getGoalIcon(allocation.goalId)}</div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {getGoalName(allocation.goalId)}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`font-medium ${getPriorityColor(allocation.priority)}`}>
                      Priority {GoalPrioritizationEngine.getPriorityInfo(allocation.priority).label.toLowerCase()}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className={`font-medium ${getRiskColor(allocation.riskLevel)}`}>
                      {allocation.riskLevel} risk
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {allocation.recommendedAllocation.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Feasibility: {(allocation.feasibilityScore * 100).toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Allocation Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Current: {allocation.currentAllocation.toFixed(1)}%</span>
                <span>Recommended: {allocation.recommendedAllocation.toFixed(1)}%</span>
              </div>
              
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                {/* Current allocation */}
                <div 
                  className="absolute h-full bg-gray-400 dark:bg-gray-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(allocation.currentAllocation, 100)}%` }}
                />
                
                {/* Recommended allocation */}
                <div 
                  className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(allocation.recommendedAllocation, 100)}%` }}
                />
              </div>
            </div>

            {/* Guidance Text */}
            {Math.abs(allocation.currentAllocation - allocation.recommendedAllocation) > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {allocation.recommendedAllocation > allocation.currentAllocation 
                    ? '💡 To prioritize this goal, increase its priority in the Goals section'
                    : '💡 Consider reducing the priority of other goals to balance your allocations'
                  }
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Allocation Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">High Priority Goals:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {allocations.filter(a => a.priority <= 2).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">At Risk:</span>
            <span className="ml-2 font-medium text-red-600 dark:text-red-400">
              {allocations.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
