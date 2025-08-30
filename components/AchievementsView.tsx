import React, { useState, useEffect } from 'react'

interface AchievementsViewProps {
  profile: any
  partnerships: any[]
  goals: any[]
  currencySymbol: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'progress' | 'streak' | 'milestone' | 'special'
  unlocked: boolean
  unlockedAt?: Date
  progress?: number
  maxProgress?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
}

export function AchievementsView({ profile, partnerships, goals, currencySymbol }: AchievementsViewProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'progress' | 'streak' | 'milestone' | 'special'>('all')
  const [totalUnlocked, setTotalUnlocked] = useState(0)
  const [totalAchievements, setTotalAchievements] = useState(0)

  useEffect(() => {
    initializeAchievements()
  }, [profile, goals, partnerships])

  useEffect(() => {
    const unlocked = achievements.filter(a => a.unlocked).length
    setTotalUnlocked(unlocked)
    setTotalAchievements(achievements.length)
  }, [achievements])

  const initializeAchievements = () => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-goal',
        title: 'First Goal Set',
        description: 'Set your first savings goal and start your financial journey',
        icon: '🎯',
        category: 'progress',
        unlocked: goals && goals.length > 0,
        rarity: 'common'
      },
      {
        id: 'first-partnership',
        title: 'Partnership Formed',
        description: 'Connected with your financial partner for shared success',
        icon: '🤝',
        category: 'progress',
        unlocked: partnerships && partnerships.length > 0,
        rarity: 'common'
      },
      {
        id: 'profile-complete',
        title: 'Profile Complete',
        description: 'Filled out your complete profile with all essential information',
        icon: '✅',
        category: 'progress',
        unlocked: profile && profile.income && profile.payday,
        rarity: 'common'
      },
      {
        id: 'first-month-tracked',
        title: 'First Month Tracked',
        description: 'Tracked your first month of financial progress',
        icon: '📅',
        category: 'progress',
        unlocked: false, // Will be updated based on actual data
        rarity: 'common'
      },
      {
        id: 'three-month-streak',
        title: 'Three Month Streak',
        description: 'Maintained consistent progress tracking for 3 consecutive months',
        icon: '🔥',
        category: 'streak',
        unlocked: false,
        progress: 0,
        maxProgress: 3,
        rarity: 'rare'
      },
      {
        id: 'six-month-streak',
        title: 'Six Month Master',
        description: 'Achieved 6 months of consistent financial tracking',
        icon: '⚡',
        category: 'streak',
        unlocked: false,
        progress: 0,
        maxProgress: 6,
        rarity: 'epic'
      },
      {
        id: 'goal-25-percent',
        title: 'Quarter Way There',
        description: 'Reached 25% of any savings goal - great progress!',
        icon: '🏁',
        category: 'milestone',
        unlocked: goals && goals.some(goal => goal.current_amount >= goal.target_amount * 0.25),
        rarity: 'common'
      },
      {
        id: 'goal-50-percent',
        title: 'Halfway Hero',
        description: 'Reached 50% of any savings goal - you\'re crushing it!',
        icon: '🎉',
        category: 'milestone',
        unlocked: goals && goals.some(goal => goal.current_amount >= goal.target_amount * 0.5),
        rarity: 'rare'
      },
      {
        id: 'goal-75-percent',
        title: 'Almost There',
        description: 'Reached 75% of any savings goal - the finish line is in sight!',
        icon: '🚀',
        category: 'milestone',
        unlocked: goals && goals.some(goal => goal.current_amount >= goal.target_amount * 0.75),
        rarity: 'rare'
      },
      {
        id: 'goal-complete',
        title: 'Goal Achieved',
        description: 'Completed your first savings goal - incredible achievement!',
        icon: '🏆',
        category: 'milestone',
        unlocked: goals && goals.some(goal => goal.current_amount >= goal.target_amount),
        rarity: 'epic'
      },
      {
        id: 'over-achiever',
        title: 'Over-Achiever',
        description: 'Exceeded your monthly savings target - you\'re unstoppable!',
        icon: '⭐',
        category: 'special',
        unlocked: false, // Will be updated based on actual data
        rarity: 'rare'
      },
      {
        id: 'financial-novice',
        title: 'Financial Novice',
        description: 'Complete your first month of tracking and earn this badge',
        icon: '🌱',
        category: 'progress',
        unlocked: false,
        rarity: 'common'
      },
      {
        id: 'money-manager',
        title: 'Money Manager',
        description: 'Maintain 3-month streak and reach first goal for this prestigious title',
        icon: '💼',
        category: 'progress',
        unlocked: false,
        rarity: 'epic'
      },
      {
        id: 'money-master',
        title: 'Money Master',
        description: 'Complete all goals and maintain 6-month streak for legendary status',
        icon: '👑',
        category: 'progress',
        unlocked: false,
        rarity: 'legendary'
      },
      {
        id: 'safety-net-builder',
        title: 'Safety Net Builder',
        description: 'Built a comprehensive emergency fund covering 3+ months of expenses',
        icon: '🛡️',
        category: 'special',
        unlocked: false, // Will be updated based on actual data
        rarity: 'rare'
      },
      {
        id: 'partner-champion',
        title: 'Partner Champion',
        description: 'Both partners achieved their monthly targets for 3 consecutive months',
        icon: '🤝',
        category: 'special',
        unlocked: false, // Will be updated based on actual data
        rarity: 'epic'
      }
    ]

    setAchievements(baseAchievements)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
      case 'rare': return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
      case 'epic': return 'border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-600'
      case 'legendary': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600'
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
    }
  }

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Common'
      case 'rare': return 'Rare'
      case 'epic': return 'Epic'
      case 'legendary': return 'Legendary'
      default: return 'Common'
    }
  }

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return '⚪'
      case 'rare': return '🔵'
      case 'epic': return '🟣'
      case 'legendary': return '🟡'
      default: return '⚪'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress': return '📈'
      case 'streak': return '🔥'
      case 'milestone': return '🎯'
      case 'special': return '⭐'
      default: return '📊'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'progress': return 'Progress'
      case 'streak': return 'Streaks'
      case 'milestone': return 'Milestones'
      case 'special': return 'Special'
      default: return 'All'
    }
  }

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  )

  const completionPercentage = totalAchievements > 0 ? Math.round((totalUnlocked / totalAchievements) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 dark:from-yellow-400 dark:to-orange-400 bg-clip-text text-transparent mb-4">
          🏆 Achievements
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Track your financial journey and unlock amazing achievements
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-yellow-200 dark:border-yellow-700">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            Achievement Progress
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300">
            {totalUnlocked} of {totalAchievements} achievements unlocked
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-4 mb-4">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-4 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        <div className="text-center">
          <span className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
            {completionPercentage}%
          </span>
          <span className="text-yellow-700 dark:text-yellow-300 ml-2">Complete</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        {[
          { value: 'all', label: 'All', icon: '📊' },
          { value: 'progress', label: 'Progress', icon: '📈' },
          { value: 'streak', label: 'Streaks', icon: '🔥' },
          { value: 'milestone', label: 'Milestones', icon: '🎯' },
          { value: 'special', label: 'Special', icon: '⭐' }
        ].map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              selectedCategory === category.value
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`p-6 rounded-xl border transition-all duration-300 transform hover:scale-105 ${
              achievement.unlocked 
                ? getRarityColor(achievement.rarity || 'common')
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'
            }`}
          >
            {/* Achievement Icon */}
            <div className="text-center mb-4">
              <div className={`text-6xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
                             {achievement.unlocked && (
                 <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                   {getRarityIcon(achievement.rarity || 'common')} {getRarityLabel(achievement.rarity || 'common')}
                 </div>
               )}
            </div>

            {/* Achievement Details */}
            <div className="text-center">
              <h3 className={`text-lg font-semibold mb-2 ${
                achievement.unlocked 
                  ? 'text-gray-900 dark:text-white' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-sm mb-4 ${
                achievement.unlocked 
                  ? 'text-gray-600 dark:text-gray-300' 
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {achievement.description}
              </p>

              {/* Progress Bar for Streak Achievements */}
              {achievement.progress !== undefined && achievement.maxProgress && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className={`px-3 py-2 rounded-full text-sm font-medium ${
                achievement.unlocked
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {achievement.unlocked ? '✅ Unlocked' : '🔒 Locked'}
              </div>

              {/* Unlock Date */}
              {achievement.unlocked && achievement.unlockedAt && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No achievements found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try selecting a different category or complete more tasks to unlock achievements.
          </p>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
          💡 <span className="ml-2">How to Unlock More Achievements</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <div className="font-medium mb-2">📈 Progress Achievements:</div>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Complete your profile setup</li>
              <li>• Set your first savings goal</li>
              <li>• Track your monthly progress</li>
            </ul>
          </div>
          <div>
            <div className="font-medium mb-2">🔥 Streak Achievements:</div>
            <ul className="space-y-1 text-blue-700 dark:text-blue-300">
              <li>• Track progress consistently</li>
              <li>• Meet monthly targets</li>
              <li>• Maintain good financial habits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
