/**
 * Achievement utilities for SplitSave
 * Handles achievement tracking, unlocking, and progress calculation
 */

export interface Achievement {
  id: string
  name: string
  description: string
  category: 'contribution' | 'goal' | 'streak' | 'milestone' | 'partnership'
  icon: string
  points: number
  requirements: AchievementRequirement[]
  unlocked: boolean
  unlockedAt?: string
  progress: number // 0-100
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface AchievementRequirement {
  type: 'contribution_count' | 'contribution_amount' | 'goal_completion' | 'streak_length' | 'partnership_duration' | 'safety_pot_amount'
  value: number
  current: number
  description: string
}

export interface AchievementProgress {
  totalAchievements: number
  unlockedAchievements: number
  totalPoints: number
  progressPercentage: number
  nextAchievement?: Achievement
  recentUnlocks: Achievement[]
  categories: {
    [key: string]: {
      total: number
      unlocked: number
      progress: number
    }
  }
}

export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalContributions: number
  lastContributionDate?: string
  streakType: 'monthly' | 'goal' | 'mixed'
}

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>[] = [
  // Contribution Achievements
  {
    id: 'first-contribution',
    name: 'First Steps',
    description: 'Make your first contribution to a shared goal',
    category: 'contribution',
    icon: '🌱',
    points: 10,
    rarity: 'common',
    requirements: [
      {
        type: 'contribution_count',
        value: 1,
        current: 0,
        description: 'Make 1 contribution'
      }
    ]
  },
  {
    id: 'consistent-saver',
    name: 'Consistent Saver',
    description: 'Contribute for 3 consecutive months',
    category: 'contribution',
    icon: '📅',
    points: 25,
    rarity: 'common',
    requirements: [
      {
        type: 'streak_length',
        value: 3,
        current: 0,
        description: '3 month streak'
      }
    ]
  },
  {
    id: 'dedicated-partner',
    name: 'Dedicated Partner',
    description: 'Contribute for 6 consecutive months',
    category: 'contribution',
    icon: '💪',
    points: 50,
    rarity: 'rare',
    requirements: [
      {
        type: 'streak_length',
        value: 6,
        current: 0,
        description: '6 month streak'
      }
    ]
  },
  {
    id: 'savings-master',
    name: 'Savings Master',
    description: 'Contribute for 12 consecutive months',
    category: 'contribution',
    icon: '👑',
    points: 100,
    rarity: 'epic',
    requirements: [
      {
        type: 'streak_length',
        value: 12,
        current: 0,
        description: '12 month streak'
      }
    ]
  },
  {
    id: 'big-contributor',
    name: 'Big Contributor',
    description: 'Contribute a total of £1,000 across all goals',
    category: 'contribution',
    icon: '💰',
    points: 75,
    rarity: 'rare',
    requirements: [
      {
        type: 'contribution_amount',
        value: 1000,
        current: 0,
        description: 'Total contributions: £1,000'
      }
    ]
  },
  {
    id: 'mega-contributor',
    name: 'Mega Contributor',
    description: 'Contribute a total of £5,000 across all goals',
    category: 'contribution',
    icon: '💎',
    points: 150,
    rarity: 'epic',
    requirements: [
      {
        type: 'contribution_amount',
        value: 5000,
        current: 0,
        description: 'Total contributions: £5,000'
      }
    ]
  },

  // Goal Achievements
  {
    id: 'first-goal',
    name: 'Goal Setter',
    description: 'Create your first savings goal',
    category: 'goal',
    icon: '🎯',
    points: 15,
    rarity: 'common',
    requirements: [
      {
        type: 'goal_completion',
        value: 1,
        current: 0,
        description: 'Create 1 goal'
      }
    ]
  },
  {
    id: 'goal-achiever',
    name: 'Goal Achiever',
    description: 'Complete your first savings goal',
    category: 'goal',
    icon: '🏆',
    points: 50,
    rarity: 'rare',
    requirements: [
      {
        type: 'goal_completion',
        value: 1,
        current: 0,
        description: 'Complete 1 goal'
      }
    ]
  },
  {
    id: 'goal-master',
    name: 'Goal Master',
    description: 'Complete 5 savings goals',
    category: 'goal',
    icon: '🌟',
    points: 200,
    rarity: 'legendary',
    requirements: [
      {
        type: 'goal_completion',
        value: 5,
        current: 0,
        description: 'Complete 5 goals'
      }
    ]
  },

  // Streak Achievements
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Maintain a 2-month contribution streak',
    category: 'streak',
    icon: '🔥',
    points: 20,
    rarity: 'common',
    requirements: [
      {
        type: 'streak_length',
        value: 2,
        current: 0,
        description: '2 month streak'
      }
    ]
  },
  {
    id: 'streak-champion',
    name: 'Streak Champion',
    description: 'Maintain a 6-month contribution streak',
    category: 'streak',
    icon: '🔥🔥',
    points: 75,
    rarity: 'rare',
    requirements: [
      {
        type: 'streak_length',
        value: 6,
        current: 0,
        description: '6 month streak'
      }
    ]
  },
  {
    id: 'streak-legend',
    name: 'Streak Legend',
    description: 'Maintain a 12-month contribution streak',
    category: 'streak',
    icon: '🔥🔥🔥',
    points: 200,
    rarity: 'legendary',
    requirements: [
      {
        type: 'streak_length',
        value: 12,
        current: 0,
        description: '12 month streak'
      }
    ]
  },

  // Partnership Achievements
  {
    id: 'partnership-formed',
    name: 'Partnership Formed',
    description: 'Form your first financial partnership',
    category: 'partnership',
    icon: '🤝',
    points: 25,
    rarity: 'common',
    requirements: [
      {
        type: 'partnership_duration',
        value: 1,
        current: 0,
        description: 'Form 1 partnership'
      }
    ]
  },
  {
    id: 'long-term-partners',
    name: 'Long-term Partners',
    description: 'Maintain a partnership for 6 months',
    category: 'partnership',
    icon: '💑',
    points: 100,
    rarity: 'epic',
    requirements: [
      {
        type: 'partnership_duration',
        value: 6,
        current: 0,
        description: '6 month partnership'
      }
    ]
  },

  // Safety Pot Achievements
  {
    id: 'safety-first',
    name: 'Safety First',
    description: 'Build a safety pot of £500',
    category: 'milestone',
    icon: '🛡️',
    points: 30,
    rarity: 'common',
    requirements: [
      {
        type: 'safety_pot_amount',
        value: 500,
        current: 0,
        description: 'Safety pot: £500'
      }
    ]
  },
  {
    id: 'safety-expert',
    name: 'Safety Expert',
    description: 'Build a safety pot of £2,000',
    category: 'milestone',
    icon: '🛡️🛡️',
    points: 100,
    rarity: 'epic',
    requirements: [
      {
        type: 'safety_pot_amount',
        value: 2000,
        current: 0,
        description: 'Safety pot: £2,000'
      }
    ]
  }
]

/**
 * Calculate achievement progress based on user data
 */
export function calculateAchievementProgress(
  userData: {
    contributions: any[]
    goals: any[]
    partnerships: any[]
    safetyPotAmount: number
  }
): Achievement[] {
  const achievements = ACHIEVEMENTS.map(achievement => ({
    ...achievement,
    unlocked: false,
    unlockedAt: undefined,
    progress: 0
  }))

  // Calculate contribution stats
  const totalContributions = userData.contributions.length
  const totalContributionAmount = userData.contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
  const contributionStreak = calculateContributionStreak(userData.contributions)

  // Calculate goal stats
  const totalGoals = userData.goals.length
  const completedGoals = userData.goals.filter(g => g.current_amount >= g.target_amount).length

  // Calculate partnership stats
  const partnershipDuration = userData.partnerships.length > 0 ? 
    calculatePartnershipDuration(userData.partnerships[0]) : 0

  // Update achievement requirements and progress
  achievements.forEach(achievement => {
    achievement.requirements.forEach(req => {
      switch (req.type) {
        case 'contribution_count':
          req.current = totalContributions
          break
        case 'contribution_amount':
          req.current = totalContributionAmount
          break
        case 'goal_completion':
          req.current = completedGoals
          break
        case 'streak_length':
          req.current = contributionStreak.currentStreak
          break
        case 'partnership_duration':
          req.current = partnershipDuration
          break
        case 'safety_pot_amount':
          req.current = userData.safetyPotAmount
          break
      }
    })

    // Calculate progress percentage
    achievement.progress = calculateRequirementProgress(achievement.requirements)

    // Check if achievement is unlocked
    achievement.unlocked = achievement.progress >= 100
  })

  return achievements
}

/**
 * Calculate requirement progress percentage
 */
function calculateRequirementProgress(requirements: AchievementRequirement[]): number {
  if (requirements.length === 0) return 0

  const progressValues = requirements.map(req => {
    if (req.value === 0) return 100
    return Math.min((req.current / req.value) * 100, 100)
  })

  // Return the minimum progress (all requirements must be met)
  return Math.min(...progressValues)
}

/**
 * Calculate contribution streak
 */
export function calculateContributionStreak(contributions: any[]): StreakData {
  if (contributions.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalContributions: 0,
      streakType: 'monthly'
    }
  }

  // Sort contributions by date (newest first)
  const sortedContributions = contributions
    .filter(c => c.created_at)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Group contributions by month
  const monthlyContributions = new Map<string, any[]>()
  sortedContributions.forEach(contribution => {
    const monthKey = new Date(contribution.created_at).toISOString().substring(0, 7) // YYYY-MM
    if (!monthlyContributions.has(monthKey)) {
      monthlyContributions.set(monthKey, [])
    }
    monthlyContributions.get(monthKey)!.push(contribution)
  })

  const monthKeys = Array.from(monthlyContributions.keys()).sort().reverse()

  // Calculate current streak
  for (let i = 0; i < monthKeys.length; i++) {
    const monthKey = monthKeys[i]
    const expectedMonth = new Date()
    expectedMonth.setMonth(expectedMonth.getMonth() - i)
    const expectedMonthKey = expectedMonth.toISOString().substring(0, 7)

    if (monthKey === expectedMonthKey) {
      tempStreak++
      if (i === 0) currentStreak = tempStreak
    } else {
      break
    }
  }

  // Calculate longest streak
  tempStreak = 0
  for (let i = 0; i < monthKeys.length - 1; i++) {
    const currentMonth = monthKeys[i]
    const nextMonth = monthKeys[i + 1]
    
    if (isConsecutiveMonth(currentMonth, nextMonth)) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return {
    currentStreak,
    longestStreak: longestStreak + 1, // +1 because we count the month itself
    totalContributions: contributions.length,
    lastContributionDate: sortedContributions[0]?.created_at,
    streakType: 'monthly'
  }
}

/**
 * Check if two month keys are consecutive
 */
function isConsecutiveMonth(month1: string, month2: string): boolean {
  const [year1, month1Num] = month1.split('-').map(Number)
  const [year2, month2Num] = month2.split('-').map(Number)
  
  if (year1 === year2) {
    return month1Num === month2Num + 1
  } else if (year1 === year2 + 1) {
    return month1Num === 1 && month2Num === 12
  }
  
  return false
}

/**
 * Calculate partnership duration in months
 */
function calculatePartnershipDuration(partnership: any): number {
  if (!partnership.created_at) return 0
  
  const created = new Date(partnership.created_at)
  const now = new Date()
  
  const monthsDiff = (now.getFullYear() - created.getFullYear()) * 12 + 
                     (now.getMonth() - created.getMonth())
  
  return Math.max(0, monthsDiff)
}

/**
 * Get achievement summary and progress
 */
export function getAchievementSummary(achievements: Achievement[]): AchievementProgress {
  const totalAchievements = achievements.length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0)
  const progressPercentage = totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0

  // Group by category
  const categories: { [key: string]: { total: number; unlocked: number; progress: number } } = {}
  achievements.forEach(achievement => {
    if (!categories[achievement.category]) {
      categories[achievement.category] = { total: 0, unlocked: 0, progress: 0 }
    }
    categories[achievement.category].total++
    if (achievement.unlocked) {
      categories[achievement.category].unlocked++
    }
  })

  // Calculate category progress
  Object.keys(categories).forEach(category => {
    categories[category].progress = categories[category].total > 0 ? 
      (categories[category].unlocked / categories[category].total) * 100 : 0
  })

  // Find next achievement to unlock
  const nextAchievement = achievements
    .filter(a => !a.unlocked)
    .sort((a, b) => b.progress - a.progress)[0]

  // Get recently unlocked achievements (last 5)
  const recentUnlocks = achievements
    .filter(a => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 5)

  return {
    totalAchievements,
    unlockedAchievements,
    totalPoints,
    progressPercentage,
    nextAchievement,
    recentUnlocks,
    categories
  }
}

/**
 * Check for newly unlocked achievements
 */
export function checkNewAchievements(
  oldAchievements: Achievement[],
  newAchievements: Achievement[]
): Achievement[] {
  return newAchievements.filter(newAchievement => {
    const oldAchievement = oldAchievements.find(a => a.id === newAchievement.id)
    return !oldAchievement?.unlocked && newAchievement.unlocked
  })
}

/**
 * Get achievement rarity color
 */
export function getAchievementRarityColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 dark:text-gray-400'
    case 'rare':
      return 'text-blue-600 dark:text-blue-400'
    case 'epic':
      return 'text-purple-600 dark:text-purple-400'
    case 'legendary':
      return 'text-orange-600 dark:text-orange-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

/**
 * Get achievement rarity background color
 */
export function getAchievementRarityBgColor(rarity: Achievement['rarity']): string {
  switch (rarity) {
    case 'common':
      return 'bg-gray-100 dark:bg-gray-800'
    case 'rare':
      return 'bg-blue-100 dark:bg-blue-900/30'
    case 'epic':
      return 'bg-purple-100 dark:bg-purple-900/30'
    case 'legendary':
      return 'bg-orange-100 dark:bg-orange-900/30'
    default:
      return 'bg-gray-100 dark:bg-gray-800'
  }
}

/**
 * Get level from total points
 */
export function getLevelFromPoints(points: number): number {
  // Simple level calculation: every 100 points = 1 level
  return Math.floor(points / 100) + 1
}

/**
 * Get points needed for next level
 */
export function getPointsForNextLevel(currentLevel: number): number {
  // Each level requires 100 points
  return currentLevel * 100
}

/**
 * Get level progress percentage
 */
export function getLevelProgress(points: number): number {
  const currentLevel = getLevelFromPoints(points)
  const pointsForCurrentLevel = (currentLevel - 1) * 100
  const pointsForNextLevel = currentLevel * 100
  const pointsInCurrentLevel = points - pointsForCurrentLevel
  
  return (pointsInCurrentLevel / (pointsForNextLevel - pointsForCurrentLevel)) * 100
}

/**
 * Achievement utilities for SplitSave
 * Handles achievement tracking, unlocking, and progress calculation
 */
