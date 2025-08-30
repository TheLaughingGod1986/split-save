/**
 * Smart notification utilities for SplitSave
 * Handles payday reminders, progress alerts, and achievement notifications
 */

export interface NotificationConfig {
  id: string
  type: 'payday' | 'progress' | 'achievement' | 'reminder' | 'alert'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  icon: string
  actionUrl?: string
  scheduledFor?: Date
  expiresAt?: Date
  requiresAction: boolean
  metadata?: Record<string, any>
}

export interface NotificationPreferences {
  userId: string
  paydayReminders: boolean
  progressAlerts: boolean
  achievementNotifications: boolean
  weeklyDigests: boolean
  partnerUpdates: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:MM format
    end: string // HH:MM format
  }
}

export interface PaydayReminder {
  id: string
  userId: string
  nextPayday: Date
  amount: number
  currency: string
  reminderDays: number[] // Days before payday to send reminders
  lastSent?: Date
  nextReminder?: Date
}

export interface ProgressAlert {
  id: string
  userId: string
  type: 'goal' | 'streak' | 'contribution' | 'partnership'
  message: string
  currentValue: number
  targetValue: number
  progress: number
  alertThreshold: number
  triggered: boolean
  triggeredAt?: Date
}

/**
 * Generate payday reminders based on user profile
 */
export function generatePaydayReminders(
  userId: string,
  payday: string,
  income: number,
  currency: string = 'GBP'
): PaydayReminder[] {
  const reminders: PaydayReminder[] = []
  const now = new Date()
  
  // Calculate next payday
  const nextPayday = calculateNextPayday(payday, now)
  
  // Create reminders for different timeframes
  const reminderDays = [7, 3, 1] // 1 week, 3 days, 1 day before
  
  reminderDays.forEach(days => {
    const reminderDate = new Date(nextPayday)
    reminderDate.setDate(reminderDate.getDate() - days)
    
    if (reminderDate > now) {
      reminders.push({
        id: `payday-${days}-${userId}`,
        userId,
        nextPayday,
        amount: income,
        currency,
        reminderDays: [days],
        nextReminder: reminderDate
      })
    }
  })
  
  return reminders
}

/**
 * Calculate next payday based on payday preference
 */
function calculateNextPayday(payday: string, fromDate: Date = new Date()): Date {
  const now = new Date(fromDate)
  let nextPayday = new Date(now)
  
  switch (payday) {
    case 'last-working-day':
      nextPayday = getLastWorkingDayOfMonth(now)
      break
    case 'last-friday':
      nextPayday = getLastFridayOfMonth(now)
      break
    case 'fixed-date':
      // Assume 25th of month for fixed date
      nextPayday.setDate(25)
      break
    default:
      // Default to 25th of month
      nextPayday.setDate(25)
  }
  
  // If this month's payday has passed, move to next month
  if (nextPayday <= now) {
    nextPayday.setMonth(nextPayday.getMonth() + 1)
    nextPayday.setDate(25)
  }
  
  return nextPayday
}

/**
 * Get last working day of the month
 */
function getLastWorkingDayOfMonth(date: Date): Date {
  const year = date.getFullYear()
  const month = date.getMonth()
  const lastDay = new Date(year, month + 1, 0)
  
  let workingDay = new Date(lastDay)
  while (workingDay.getDay() === 0 || workingDay.getDay() === 6) {
    workingDay.setDate(workingDay.getDate() - 1)
  }
  
  return workingDay
}

/**
 * Get last Friday of the month
 */
function getLastFridayOfMonth(date: Date): Date {
  const year = date.getFullYear()
  const month = date.getMonth()
  const lastDay = new Date(year, month + 1, 0)
  
  let friday = new Date(lastDay)
  while (friday.getDay() !== 5) {
    friday.setDate(friday.getDate() - 1)
  }
  
  return friday
}

/**
 * Generate progress alerts based on user data
 */
export function generateProgressAlerts(
  userId: string,
  goals: any[],
  contributions: any[],
  streaks: any
): ProgressAlert[] {
  const alerts: ProgressAlert[] = []
  
  // Goal progress alerts
  goals.forEach(goal => {
    const progress = (goal.current_amount / goal.target_amount) * 100
    const monthlyTarget = goal.monthly_target || 0
    
    // Alert if behind monthly target
    if (monthlyTarget > 0) {
      const monthlyProgress = calculateMonthlyProgress(goal.id, contributions, new Date())
      const behindThreshold = (monthlyProgress / monthlyTarget) * 100
      
      if (behindThreshold < 80) {
        alerts.push({
          id: `goal-${goal.id}-${userId}`,
          userId,
          type: 'goal',
          message: `You're behind on your monthly target for "${goal.name}". Consider increasing your contribution.`,
          currentValue: monthlyProgress,
          targetValue: monthlyTarget,
          progress: behindThreshold,
          alertThreshold: 80,
          triggered: behindThreshold < 80,
          triggeredAt: behindThreshold < 80 ? new Date() : undefined
        })
      }
    }
    
    // Alert if goal deadline is approaching
    if (goal.target_date) {
      const deadline = new Date(goal.target_date)
      const now = new Date()
      const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilDeadline <= 30 && progress < 90) {
        alerts.push({
          id: `goal-deadline-${goal.id}-${userId}`,
          userId,
          type: 'goal',
          message: `Goal "${goal.name}" deadline is approaching in ${daysUntilDeadline} days. You're ${progress.toFixed(1)}% complete.`,
          currentValue: progress,
          targetValue: 100,
          progress: progress,
          alertThreshold: 90,
          triggered: daysUntilDeadline <= 30,
          triggeredAt: daysUntilDeadline <= 30 ? new Date() : undefined
        })
      }
    }
  })
  
  // Streak alerts
  if (streaks.currentStreak > 0) {
    const streakMilestones = [3, 6, 12, 24]
    const nextMilestone = streakMilestones.find(m => m > streaks.currentStreak)
    
    if (nextMilestone) {
      const monthsToNextMilestone = nextMilestone - streaks.currentStreak
      
      if (monthsToNextMilestone <= 2) {
        alerts.push({
          id: `streak-${userId}`,
          userId,
          type: 'streak',
          message: `You're ${monthsToNextMilestone} month(s) away from a ${nextMilestone}-month streak! Keep going!`,
          currentValue: streaks.currentStreak,
          targetValue: nextMilestone,
          progress: (streaks.currentStreak / nextMilestone) * 100,
          alertThreshold: 80,
          triggered: monthsToNextMilestone <= 2,
          triggeredAt: monthsToNextMilestone <= 2 ? new Date() : undefined
        })
      }
    }
  }
  
  return alerts
}

/**
 * Calculate monthly progress for a specific goal
 */
function calculateMonthlyProgress(goalId: string, contributions: any[], date: Date): number {
  const month = date.toISOString().substring(0, 7) // YYYY-MM
  
  return contributions
    .filter(c => c.goal_id === goalId && c.created_at?.startsWith(month))
    .reduce((sum, c) => sum + (c.amount || 0), 0)
}

/**
 * Generate weekly digest summary
 */
export function generateWeeklyDigest(
  userId: string,
  weeklyData: {
    contributions: any[]
    goals: any[]
    achievements: any[]
    partnerUpdates: any[]
  }
): NotificationConfig {
  const totalContributions = weeklyData.contributions.reduce((sum, c) => sum + (c.amount || 0), 0)
  const newAchievements = weeklyData.achievements.length
  const goalsProgress = weeklyData.goals.length
  
  let message = `This week you contributed ${formatCurrency(totalContributions)}`
  
  if (newAchievements > 0) {
    message += `, unlocked ${newAchievements} achievement${newAchievements > 1 ? 's' : ''}`
  }
  
  if (goalsProgress > 0) {
    message += `, and made progress on ${goalsProgress} goal${goalsProgress > 1 ? 's' : ''}`
  }
  
  message += '. Keep up the great work!'
  
  return {
    id: `weekly-digest-${userId}-${Date.now()}`,
    type: 'reminder',
    title: '📊 Your Weekly Progress Summary',
    message,
    priority: 'low',
    icon: '📊',
    requiresAction: false,
    scheduledFor: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  }
}

/**
 * Check if notification should be sent based on quiet hours
 */
export function shouldSendNotification(
  preferences: NotificationPreferences,
  notificationPriority: NotificationConfig['priority']
): boolean {
  // Always send urgent notifications
  if (notificationPriority === 'urgent') return true
  
  // Check quiet hours
  if (preferences.quietHours.enabled) {
    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    const startTime = parseTime(preferences.quietHours.start)
    const endTime = parseTime(preferences.quietHours.end)
    
    if (startTime <= endTime) {
      // Same day quiet hours (e.g., 22:00 to 08:00)
      if (currentTime >= startTime || currentTime <= endTime) {
        return false
      }
    } else {
      // Overnight quiet hours (e.g., 22:00 to 08:00)
      if (currentTime >= startTime || currentTime <= endTime) {
        return false
      }
    }
  }
  
  return true
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Format currency for notifications
 */
function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Generate partner update notifications
 */
export function generatePartnerUpdates(
  userId: string,
  partnerActions: any[]
): NotificationConfig[] {
  const notifications: NotificationConfig[] = []
  
  partnerActions.forEach(action => {
    switch (action.type) {
      case 'contribution':
        notifications.push({
          id: `partner-contribution-${action.id}`,
          type: 'reminder',
          title: '🤝 Partner Update',
          message: `Your partner contributed ${formatCurrency(action.amount)} to ${action.goalName}`,
          priority: 'low',
          icon: '🤝',
          actionUrl: `/goals/${action.goalId}`,
          requiresAction: false,
          scheduledFor: new Date()
        })
        break
        
      case 'goal_completion':
        notifications.push({
          id: `partner-goal-${action.id}`,
          type: 'achievement',
          title: '🎉 Goal Completed!',
          message: `Congratulations! You and your partner completed the goal "${action.goalName}"`,
          priority: 'medium',
          icon: '🎉',
          actionUrl: `/goals/${action.goalId}`,
          requiresAction: false,
          scheduledFor: new Date()
        })
        break
        
      case 'streak_milestone':
        notifications.push({
          id: `partner-streak-${action.id}`,
          type: 'achievement',
          title: '🔥 Streak Milestone!',
          message: `You and your partner reached a ${action.months} month contribution streak!`,
          priority: 'medium',
          icon: '🔥',
          requiresAction: false,
          scheduledFor: new Date()
        })
        break
    }
  })
  
  return notifications
}

/**
 * Get notification priority based on type and context
 */
export function getNotificationPriority(
  type: NotificationConfig['type'],
  context?: Record<string, any>
): NotificationConfig['priority'] {
  switch (type) {
    case 'payday':
      return context?.daysUntilPayday <= 1 ? 'high' : 'medium'
    case 'progress':
      return context?.behindTarget ? 'high' : 'medium'
    case 'achievement':
      return 'medium'
    case 'reminder':
      return 'low'
    case 'alert':
      return context?.urgent ? 'urgent' : 'high'
    default:
      return 'medium'
  }
}
