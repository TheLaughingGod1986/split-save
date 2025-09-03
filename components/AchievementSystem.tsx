'use client'
import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { 
  Achievement, 
  AchievementProgress, 
  getAchievementRarityColor, 
  getAchievementRarityBgColor,
  getLevelFromPoints,
  getLevelProgress
} from '@/lib/achievement-utils'

export function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [summary, setSummary] = useState<AchievementProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUnlocked, setShowUnlocked] = useState(false)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

  // Load achievements from API
  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/achievements')
      
      if (response.data?.achievements) {
        setAchievements(response.data.achievements)
        setSummary(response.data.summary)
        
        // Show notifications for new achievements
        if (response.data?.newAchievements && response.data.newAchievements.length > 0) {
          response.data.newAchievements.forEach((achievement: any) => {
            toast.success(`🎉 Achievement Unlocked: ${achievement.name}!`, { duration: 5000 })
          })
          setNewAchievements(response.data.newAchievements)
        }
      }
    } catch (error) {
      console.error('Error loading achievements:', error)
      toast.error('Failed to load achievements')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'contribution': return '💰'
      case 'goal': return '🎯'
      case 'streak': return '🔥'
      case 'partnership': return '🤝'
      case 'milestone': return '🚀'
      default: return '🏆'
    }
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'contribution': return 'Contributions'
      case 'goal': return 'Goals'
      case 'streak': return 'Streaks'
      case 'partnership': return 'Partnership'
      case 'milestone': return 'Milestones'
      default: return 'Other'
    }
  }

  const filteredAchievements = showUnlocked 
    ? achievements.filter(a => a.unlocked)
    : achievements

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🏆</span>
            <div>
              <h1 className="text-2xl font-bold">Achievements & Rewards</h1>
              <p className="text-purple-100">Loading your achievements...</p>
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
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🏆</span>
          <div>
            <h1 className="text-2xl font-bold">Achievements & Rewards</h1>
            <p className="text-purple-100">Track your progress and unlock rewards</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.totalPoints}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.unlockedAchievements}/{summary.totalAchievements}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {getLevelFromPoints(summary.totalPoints)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Level</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {summary.progressPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
          </div>
        </div>
      )}

      {/* Level Progress */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📊 Level Progress
          </h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Level {getLevelFromPoints(summary.totalPoints)} Progress
                </span>
                <span className="font-medium">
                  {summary.totalPoints % 100}/100 points
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getLevelProgress(summary.totalPoints)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Next level at {getLevelFromPoints(summary.totalPoints) * 100} points
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Progress */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🎯 Category Progress
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(summary.categories).map(([category, stats]) => (
              <div key={category} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {getCategoryName(category)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {stats.unlocked}/{stats.total} unlocked
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {stats.progress.toFixed(0)}% complete
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Achievement */}
      {summary?.nextAchievement && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-200 mb-4">
            🎯 Next Achievement to Unlock
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-4xl">{summary.nextAchievement.icon}</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                {summary.nextAchievement.name}
              </h3>
              <p className="text-blue-700 dark:text-blue-300 mb-2">
                {summary.nextAchievement.description}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded-full ${getAchievementRarityBgColor(summary.nextAchievement.rarity)} ${getAchievementRarityColor(summary.nextAchievement.rarity)}`}>
                  {summary.nextAchievement.rarity.toUpperCase()}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {summary.nextAchievement.points} points
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {summary.nextAchievement.progress}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowUnlocked(!showUnlocked)}
          className={`px-6 py-2 rounded-full font-medium transition-all ${
            showUnlocked
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          {showUnlocked ? '🎉 Show All Achievements' : '🏆 Show Unlocked Only'}
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-4 rounded-xl border transition-all duration-300 ${
              achievement.unlocked
                ? getAchievementRarityBgColor(achievement.rarity)
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-75'
            }`}
          >
            {/* Achievement Header */}
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{achievement.icon}</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                achievement.unlocked 
                  ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {achievement.rarity.toUpperCase()}
              </span>
            </div>

            {/* Achievement Content */}
            <h3 className={`font-semibold mb-2 ${
              achievement.unlocked 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {achievement.name}
            </h3>
            
            <p className={`text-sm mb-3 ${
              achievement.unlocked 
                ? 'text-gray-700 dark:text-gray-300' 
                : 'text-gray-500 dark:text-gray-500'
            }`}>
              {achievement.description}
            </p>

            {/* Requirements */}
            <div className="mb-3 space-y-2">
              {achievement.requirements.map((req, index) => (
                <div key={index} className="text-xs">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400 mb-1">
                    <span>{req.description}</span>
                    <span>{req.current}/{req.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((req.current / req.value) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-gray-400">Overall Progress</span>
                <span className="text-gray-500 dark:text-gray-400">
                  {achievement.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${achievement.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Points and Status */}
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${getAchievementRarityColor(achievement.rarity)}`}>
                {achievement.points} pts
              </span>
              
              {achievement.unlocked ? (
                <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                  <span>✓</span>
                  <span className="text-xs">Unlocked</span>
                </div>
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {achievement.progress}% complete
                </span>
              )}
            </div>

            {/* Unlock Date */}
            {achievement.unlockedAt && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Motivation Message */}
      {summary && summary.unlockedAchievements < summary.totalAchievements && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <span className="text-4xl mb-4 block">💪</span>
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Keep Going!
          </h3>
          <p className="text-blue-700 dark:text-blue-300">
            You&apos;re making great progress! {summary.totalAchievements - summary.unlockedAchievements} more achievements to unlock.
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadAchievements}
          className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors"
        >
          🔄 Refresh Achievements
        </button>
      </div>
    </div>
  )
}
