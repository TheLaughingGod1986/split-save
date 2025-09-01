'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'

interface StreakData {
  currentStreak: number
  longestStreak: number
  totalContributions: number
  lastContributionDate?: string
  streakType: 'monthly' | 'goal' | 'mixed'
  monthlyStreak: number
  goalStreak: number
  lastMonthlyContribution?: string
  lastGoalContribution?: string
}

export function StreakTracker() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreakData()
  }, [])

  const loadStreakData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/streaks')
      setStreakData(response)
    } catch (error) {
      console.error('Error loading streak data:', error)
      toast.error('Failed to load streak data')
    } finally {
      setLoading(false)
    }
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 12) return '🔥🔥🔥'
    if (streak >= 6) return '🔥🔥'
    if (streak >= 3) return '🔥'
    return '💪'
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 12) return 'from-red-500 to-orange-500'
    if (streak >= 6) return 'from-orange-500 to-yellow-500'
    if (streak >= 3) return 'from-yellow-500 to-green-500'
    return 'from-gray-500 to-blue-500'
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysSinceLastContribution = (dateString?: string) => {
    if (!dateString) return null
    const lastDate = new Date(dateString)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - lastDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!streakData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">💪</div>
          <p>Start your streak today!</p>
        </div>
      </div>
    )
  }

  const daysSinceMonthly = getDaysSinceLastContribution(streakData.lastMonthlyContribution)
  const daysSinceGoal = getDaysSinceLastContribution(streakData.lastGoalContribution)

  return (
    <div className="space-y-4">
      {/* Main Streak Display */}
      <motion.div 
        className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">🔥 Streak Tracker</h2>
            <p className="text-purple-100">Keep the momentum going!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{streakData.currentStreak}</div>
            <div className="text-sm text-purple-100">Current Streak</div>
          </div>
        </div>

        {/* Streak Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{streakData.currentStreak} / {Math.max(streakData.longestStreak, 1)}</span>
          </div>
          <div className="w-full bg-purple-700 rounded-full h-2">
            <motion.div 
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((streakData.currentStreak / Math.max(streakData.longestStreak, 1)) * 100, 100)}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-purple-700 bg-opacity-50 rounded-lg p-3">
            <div className="text-lg font-bold">{streakData.longestStreak}</div>
            <div className="text-purple-100">Longest Streak</div>
          </div>
          <div className="bg-purple-700 bg-opacity-50 rounded-lg p-3">
            <div className="text-lg font-bold">{streakData.totalContributions}</div>
            <div className="text-purple-100">Total Contributions</div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Streak Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Monthly Contributions Streak */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Contributions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Regular monthly savings</p>
            </div>
            <div className="text-2xl">{getStreakEmoji(streakData.monthlyStreak)}</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{streakData.monthlyStreak} months</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Contribution:</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(streakData.lastMonthlyContribution)}
              </span>
            </div>

            {daysSinceMonthly !== null && daysSinceMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Days Since:</span>
                <span className={`text-sm ${daysSinceMonthly > 30 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {daysSinceMonthly} days
                </span>
              </div>
            )}

            {/* Monthly Streak Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{streakData.monthlyStreak} / {Math.max(streakData.longestStreak, 1)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <motion.div 
                  className={`bg-gradient-to-r ${getStreakColor(streakData.monthlyStreak)} rounded-full h-1.5`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((streakData.monthlyStreak / Math.max(streakData.longestStreak, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.7 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Goal Contributions Streak */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goal Contributions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Savings goal progress</p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Current Streak:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{streakData.goalStreak} contributions</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Last Contribution:</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(streakData.lastGoalContribution)}
              </span>
            </div>

            {daysSinceGoal !== null && daysSinceGoal > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Days Since:</span>
                <span className={`text-sm ${daysSinceGoal > 30 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {daysSinceGoal} days
                </span>
              </div>
            )}

            {/* Goal Streak Progress */}
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress</span>
                <span>{streakData.goalStreak} / {Math.max(streakData.totalContributions, 1)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-1.5"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((streakData.goalStreak / Math.max(streakData.totalContributions, 1)) * 100, 100)}%` }}
                  transition={{ duration: 1, delay: 0.9 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Streak Motivation */}
      {streakData.currentStreak > 0 && (
        <motion.div 
          className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="text-lg font-semibold mb-1">
            🎉 Amazing! You're on a {streakData.currentStreak}-month streak!
          </div>
          <p className="text-green-100 text-sm">
            Keep up the great work! Your next contribution will extend your streak to {streakData.currentStreak + 1} months.
          </p>
        </motion.div>
      )}

      {/* Streak Break Warning */}
      {daysSinceMonthly !== null && daysSinceMonthly > 30 && (
        <motion.div 
          className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-4 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <div className="text-lg font-semibold mb-1">
            ⚠️ Streak at Risk!
          </div>
          <p className="text-red-100 text-sm">
            It's been {daysSinceMonthly} days since your last contribution. Make a contribution today to keep your streak alive!
          </p>
        </motion.div>
      )}
    </div>
  )
}
