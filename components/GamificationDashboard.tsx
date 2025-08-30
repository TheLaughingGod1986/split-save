import React, { useState } from 'react'
import { AchievementSystem } from './AchievementSystem'
import { StreakTracker } from './StreakTracker'

type GamificationTab = 'overview' | 'achievements' | 'streaks' | 'rewards'

export function GamificationDashboard() {
  const [activeTab, setActiveTab] = useState<GamificationTab>('overview')

  // Mock user stats for overview
  const userStats = {
    totalPoints: 285,
    achievementsUnlocked: 8,
    totalAchievements: 25,
    currentStreak: 4,
    longestStreak: 8,
    totalContributions: 20,
    level: 3,
    levelProgress: 75,
    nextLevelPoints: 100
  }

  const getLevelTitle = (level: number) => {
    if (level <= 2) return 'Savings Novice'
    if (level <= 5) return 'Savings Apprentice'
    if (level <= 8) return 'Savings Expert'
    if (level <= 12) return 'Savings Master'
    return 'Savings Legend'
  }

  const getLevelColor = (level: number) => {
    if (level <= 2) return 'text-blue-600 dark:text-blue-400'
    if (level <= 5) return 'text-green-600 dark:text-green-400'
    if (level <= 8) return 'text-purple-600 dark:text-purple-400'
    if (level <= 12) return 'text-orange-600 dark:text-orange-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getLevelIcon = (level: number) => {
    if (level <= 2) return '🌱'
    if (level <= 5) return '🌿'
    if (level <= 8) return '🌳'
    if (level <= 12) return '🏔️'
    return '👑'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🎮</span>
          <div>
            <h1 className="text-2xl font-bold">Gamification Center</h1>
            <p className="text-purple-100">Level up your savings journey with fun challenges and rewards!</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'achievements', label: 'Achievements', icon: '🏆' },
          { id: 'streaks', label: 'Streaks', icon: '🔥' },
          { id: 'rewards', label: 'Rewards', icon: '🎁' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as GamificationTab)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
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
          {/* Level & Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Your Level & Progress
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Level */}
              <div className="text-center">
                <div className={`text-6xl mb-2 ${getLevelColor(userStats.level)}`}>
                  {getLevelIcon(userStats.level)}
                </div>
                <div className={`text-3xl font-bold ${getLevelColor(userStats.level)} mb-2`}>
                  Level {userStats.level}
                </div>
                <div className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {getLevelTitle(userStats.level)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  {userStats.totalPoints} total points
                </div>
              </div>
              
              {/* Level Progress */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Progress to Next Level</span>
                    <span className="font-medium">{userStats.levelProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${userStats.levelProgress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {userStats.nextLevelPoints - userStats.totalPoints} more points to reach Level {userStats.level + 1}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {userStats.totalPoints}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Points</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {userStats.achievementsUnlocked}/{userStats.totalAchievements}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                {userStats.currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Month Streak</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {userStats.totalContributions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contributions</div>
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🎉 Recent Achievements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="font-medium text-green-800 dark:text-green-200">Getting Started</div>
                    <div className="text-sm text-green-700 dark:text-green-300">3-month streak</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="font-medium text-blue-800 dark:text-blue-200">First Steps</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">£100 saved</div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-medium text-purple-800 dark:text-purple-200">Goal Setter</div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">First goal completed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚡ Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('achievements')}
                className="p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg text-white text-left hover:from-blue-600 hover:to-indigo-600 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-medium">View All Achievements</div>
                    <div className="text-sm opacity-90">See what you can unlock next</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('streaks')}
                className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg text-white text-left hover:from-orange-600 hover:to-red-600 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <div className="font-medium">Track Your Streaks</div>
                    <div className="text-sm opacity-90">Maintain your momentum</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center">
            <span className="text-4xl mb-4 block">💪</span>
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-200 mb-2">
              Keep Up the Great Work!
            </h3>
            <p className="text-green-700 dark:text-green-300">
              You're making excellent progress on your financial goals. Every contribution counts towards your next achievement!
            </p>
          </div>
        </div>
      )}

      {activeTab === 'achievements' && (
        <AchievementSystem />
      )}

      {activeTab === 'streaks' && (
        <StreakTracker />
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🎁 Rewards & Benefits
            </h2>
            
            <div className="space-y-6">
              {/* Points System */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                  💎 Points System
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mb-3">
                  Earn points for every achievement and milestone. Points unlock special features and rewards.
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Bronze Achievement:</span>
                    <span className="font-medium">10-25 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Silver Achievement:</span>
                    <span className="font-medium">30-60 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gold Achievement:</span>
                    <span className="font-medium">75-125 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platinum Achievement:</span>
                    <span className="font-medium">150-200 pts</span>
                  </div>
                </div>
              </div>

              {/* Level Benefits */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-medium text-green-900 dark:text-green-200 mb-2">
                  🌟 Level Benefits
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                  Unlock new features and capabilities as you level up.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Level 1-2: Basic features</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Level 3-5: Advanced analytics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Level 6-8: AI insights</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span>Level 9+: Premium features</span>
                  </div>
                </div>
              </div>

              {/* Coming Soon */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h3 className="font-medium text-purple-900 dark:text-purple-200 mb-2">
                  🚀 Coming Soon
                </h3>
                <p className="text-purple-700 dark:text-purple-300 text-sm mb-3">
                  We're working on exciting new rewards and features.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600 dark:text-purple-400">🔮</span>
                    <span>Exclusive badges and themes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600 dark:text-purple-400">🎯</span>
                    <span>Partner challenges and competitions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600 dark:text-purple-400">🏆</span>
                    <span>Leaderboards and rankings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-purple-600 dark:text-purple-400">🎁</span>
                    <span>Real-world rewards and partnerships</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
