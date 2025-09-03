'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StreakTracker } from './StreakTracker'
import { AchievementSystem } from './AchievementSystem'
// import { AchievementCelebration } from './AchievementCelebration'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'
import { Achievement } from '@/lib/achievement-utils'

interface GamificationStats {
  totalPoints: number
  level: number
  levelProgress: number
  achievementsUnlocked: number
  totalAchievements: number
  currentStreak: number
  longestStreak: number
  totalContributions: number
  averageContribution: number
}

export function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'streaks' | 'achievements'>('overview')
  const [stats, setStats] = useState<GamificationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    loadGamificationStats()
  }, [])

  const loadGamificationStats = async () => {
    try {
      setLoading(true)
      const [achievementsResponse, streaksResponse] = await Promise.all([
        apiClient.get('/achievements'),
        apiClient.get('/streaks')
      ])

      // Calculate stats from responses
      const achievements = achievementsResponse.data?.achievements || []
      const streakData = streaksResponse.data

      const unlockedAchievements = achievements.filter((a: Achievement) => a.unlocked)
      const totalPoints = unlockedAchievements.reduce((sum: number, a: Achievement) => sum + a.points, 0)
      const level = Math.floor(totalPoints / 100) + 1
      const levelProgress = (totalPoints % 100) / 100

      setStats({
        totalPoints,
        level,
        levelProgress,
        achievementsUnlocked: unlockedAchievements.length,
        totalAchievements: achievements.length,
        currentStreak: streakData.currentStreak || 0,
        longestStreak: streakData.longestStreak || 0,
        totalContributions: streakData.totalContributions || 0,
        averageContribution: streakData.averageContributionAmount || 0
      })

      // Check for new achievements to celebrate
      if (achievementsResponse.data?.newAchievements && achievementsResponse.data.newAchievements.length > 0) {
        const newAchievement = achievementsResponse.data.newAchievements[0]
        setCelebratingAchievement(newAchievement)
        setShowCelebration(true)
      }
    } catch (error) {
      console.error('Error loading gamification stats:', error)
      toast.error('Failed to load gamification data')
    } finally {
      setLoading(false)
    }
  }

  const getLevelTitle = (level: number) => {
    if (level >= 20) return 'Legendary Saver'
    if (level >= 15) return 'Epic Financier'
    if (level >= 10) return 'Rare Budget Master'
    if (level >= 5) return 'Common Saver'
    return 'Novice Saver'
  }

  const getLevelColor = (level: number) => {
    if (level >= 20) return 'from-yellow-400 to-orange-500'
    if (level >= 15) return 'from-purple-500 to-pink-500'
    if (level >= 10) return 'from-blue-500 to-cyan-500'
    if (level >= 5) return 'from-green-500 to-emerald-500'
    return 'from-gray-500 to-blue-500'
  }

  const handleCelebrationClose = () => {
    setShowCelebration(false)
    setCelebratingAchievement(null)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🎮</span>
            <div>
              <h1 className="text-2xl font-bold">Gamification Dashboard</h1>
              <p className="text-purple-100">Loading your progress...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-3xl">🎮</span>
          <div>
            <h1 className="text-2xl font-bold">Gamification Dashboard</h1>
            <p className="text-purple-100">Track your progress and celebrate achievements!</p>
          </div>
        </div>

        {/* Level Progress */}
        {stats && (
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-lg font-semibold">Level {stats.level}</div>
                <div className="text-sm text-purple-100">{getLevelTitle(stats.level)}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{stats.totalPoints}</div>
                <div className="text-sm text-purple-100">Total Points</div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <motion.div
                className={`h-2 rounded-full bg-gradient-to-r ${getLevelColor(stats.level)}`}
                initial={{ width: 0 }}
                animate={{ width: `${stats.levelProgress * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="text-xs text-purple-100">
              {Math.round(stats.levelProgress * 100)}% to Level {stats.level + 1}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'streaks', label: 'Streaks', icon: '🔥' },
            { id: 'achievements', label: 'Achievements', icon: '🏆' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && stats && (
          <div className="space-y-4">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.achievementsUnlocked}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Achievements</div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.currentStreak}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Streak</div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-2xl mb-1">💰</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalContributions}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Contributions</div>
              </motion.div>

              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-2xl mb-1">📈</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  £{Math.round(stats.averageContribution)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg. Contribution</div>
              </motion.div>
            </div>

            {/* Progress Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Progress Summary</h3>
              
              <div className="space-y-4">
                {/* Achievement Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Achievements</span>
                    <span className="text-gray-900 dark:text-white">
                      {stats.achievementsUnlocked} / {stats.totalAchievements}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.achievementsUnlocked / stats.totalAchievements) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                {/* Streak Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Streak Progress</span>
                    <span className="text-gray-900 dark:text-white">
                      {stats.currentStreak} / {Math.max(stats.longestStreak, 1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.currentStreak / Math.max(stats.longestStreak, 1)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                    />
                  </div>
                </div>

                {/* Level Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Level Progress</span>
                    <span className="text-gray-900 dark:text-white">
                      {Math.round(stats.levelProgress * 100)}% to Level {stats.level + 1}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-gradient-to-r ${getLevelColor(stats.level)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.levelProgress * 100}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Motivation Card */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <div className="text-center">
                <div className="text-3xl mb-2">🚀</div>
                <h3 className="text-lg font-semibold mb-2">Keep Up the Great Work!</h3>
                <p className="text-green-100">
                  You&apos;re making excellent progress on your financial journey. 
                  {stats.currentStreak > 0 && ` Your ${stats.currentStreak}-month streak is impressive!`}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streaks' && (
          <StreakTracker />
        )}

        {activeTab === 'achievements' && (
          <AchievementSystem />
        )}
      </motion.div>

      {/* Achievement Celebration Modal */}
      {/* <AchievementCelebration
        achievement={celebratingAchievement}
        isVisible={showCelebration}
        onClose={handleCelebrationClose}
      /> */}
    </div>
  )
}
