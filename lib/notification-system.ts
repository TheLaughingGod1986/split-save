export interface Notification {
  id: string
  type: 'payday_reminder' | 'partner_activity' | 'missed_contribution' | 'goal_milestone' | 'approval_request' | 'safety_pot_alert' | 'streak_achievement'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  userId: string
  partnershipId?: string
  relatedEntityId?: string // goal ID, expense ID, etc.
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: Date
  scheduledFor?: Date
  expiresAt?: Date
}

export interface NotificationPreferences {
  userId: string
  paydayReminders: boolean
  partnerActivity: boolean
  missedContributions: boolean
  goalMilestones: boolean
  approvalRequests: boolean
  safetyPotAlerts: boolean
  streakAchievements: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  inAppNotifications: boolean
  quietHours: {
    enabled: boolean
    startTime: string // "22:00"
    endTime: string // "08:00"
    timezone: string
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  updatedAt: Date
}

export interface PaydayReminderData {
  userId: string
  payday: string
  nextPayday: Date
  expectedContribution: number
  currency: string
  partnershipId?: string
}

export interface PartnerActivityData {
  partnerId: string
  partnerName: string
  activityType: 'expense_added' | 'goal_created' | 'contribution_made' | 'milestone_reached'
  amount?: number
  currency: string
  entityName?: string
  partnershipId: string
}

export interface MissedContributionData {
  userId: string
  expectedAmount: number
  actualAmount: number
  currency: string
  month: string
  partnershipId?: string
}

export interface GoalMilestoneData {
  goalId: string
  goalName: string
  milestoneType: 'percentage' | 'amount' | 'completed'
  milestoneValue: number
  currentAmount: number
  targetAmount: number
  currency: string
  partnershipId?: string
}

class NotificationSystem {
  private static instance: NotificationSystem
  private notifications: Notification[] = []
  private preferences: Map<string, NotificationPreferences> = new Map()
  private isInitialized = false

  static getInstance(): NotificationSystem {
    if (!NotificationSystem.instance) {
      NotificationSystem.instance = new NotificationSystem()
    }
    return NotificationSystem.instance
  }

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load user preferences
      await this.loadPreferences(userId)
      
      // Set up notification listeners
      this.setupNotificationListeners()
      
      // Check for scheduled notifications
      this.checkScheduledNotifications()
      
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize notification system:', error)
    }
  }

  private async loadPreferences(userId: string): Promise<void> {
    // In a real app, this would load from database
    const defaultPreferences: NotificationPreferences = {
      userId,
      paydayReminders: true,
      partnerActivity: true,
      missedContributions: true,
      goalMilestones: true,
      approvalRequests: true,
      safetyPotAlerts: true,
      streakAchievements: true,
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      quietHours: {
        enabled: false,
        startTime: "22:00",
        endTime: "08:00",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      frequency: 'immediate',
      updatedAt: new Date()
    }

    this.preferences.set(userId, defaultPreferences)
  }

  private setupNotificationListeners(): void {
    // Listen for partner activity
    document.addEventListener('partnerActivity', (event: any) => {
      this.handlePartnerActivity(event.detail)
    })

    // Listen for goal milestones
    document.addEventListener('goalMilestone', (event: any) => {
      this.handleGoalMilestone(event.detail)
    })

    // Listen for missed contributions
    document.addEventListener('missedContribution', (event: any) => {
      this.handleMissedContribution(event.detail)
    })
  }

  private checkScheduledNotifications(): void {
    // Check every minute for scheduled notifications
    setInterval(() => {
      const now = new Date()
      this.notifications
        .filter(n => n.scheduledFor && n.scheduledFor <= now && !n.read)
        .forEach(notification => {
          this.showNotification(notification)
        })
    }, 60000)
  }

  // Payday Reminders
  async schedulePaydayReminder(data: PaydayReminderData): Promise<void> {
    const preferences = this.preferences.get(data.userId)
    if (!preferences?.paydayReminders) return

    const notification: Notification = {
      id: `payday_${data.userId}_${data.nextPayday.getTime()}`,
      type: 'payday_reminder',
      title: '💰 Payday Reminder',
      message: `It's payday! Don't forget to contribute ${data.currency}${data.expectedContribution.toFixed(2)} to your shared expenses.`,
      priority: 'high',
      userId: data.userId,
      partnershipId: data.partnershipId,
      read: false,
      actionUrl: '/money-hub',
      metadata: {
        expectedContribution: data.expectedContribution,
        currency: data.currency,
        payday: data.payday
      },
      createdAt: new Date(),
      scheduledFor: data.nextPayday,
      expiresAt: new Date(data.nextPayday.getTime() + 24 * 60 * 60 * 1000) // 24 hours
    }

    this.notifications.push(notification)
    await this.saveNotification(notification)
  }

  // Partner Activity Notifications
  async handlePartnerActivity(data: PartnerActivityData): Promise<void> {
    const preferences = this.preferences.get(data.partnerId)
    if (!preferences?.partnerActivity) return

    const activityMessages = {
      expense_added: `added a new expense: ${data.entityName} (${data.currency}${data.amount?.toFixed(2)})`,
      goal_created: `created a new goal: ${data.entityName}`,
      contribution_made: `made a contribution of ${data.currency}${data.amount?.toFixed(2)}`,
      milestone_reached: `reached a milestone: ${data.entityName}`
    }

    const notification: Notification = {
      id: `partner_${data.partnerId}_${Date.now()}`,
      type: 'partner_activity',
      title: `👥 ${data.partnerName} Activity`,
      message: `${data.partnerName} ${activityMessages[data.activityType]}`,
      priority: 'medium',
      userId: data.partnerId,
      partnershipId: data.partnershipId,
      read: false,
      actionUrl: '/partner-hub',
      metadata: {
        partnerId: data.partnerId,
        partnerName: data.partnerName,
        activityType: data.activityType,
        amount: data.amount,
        currency: data.currency,
        entityName: data.entityName
      },
      createdAt: new Date()
    }

    this.notifications.push(notification)
    await this.saveNotification(notification)
    this.showNotification(notification)
  }

  // Missed Contribution Alerts
  async handleMissedContribution(data: MissedContributionData): Promise<void> {
    const preferences = this.preferences.get(data.userId)
    if (!preferences?.missedContributions) return

    const shortfall = data.expectedAmount - data.actualAmount
    const notification: Notification = {
      id: `missed_${data.userId}_${data.month}`,
      type: 'missed_contribution',
      title: '⚠️ Missed Contribution',
      message: `You're ${data.currency}${shortfall.toFixed(2)} short on your expected contribution for ${data.month}.`,
      priority: 'high',
      userId: data.userId,
      partnershipId: data.partnershipId,
      read: false,
      actionUrl: '/money-hub',
      metadata: {
        expectedAmount: data.expectedAmount,
        actualAmount: data.actualAmount,
        shortfall,
        currency: data.currency,
        month: data.month
      },
      createdAt: new Date()
    }

    this.notifications.push(notification)
    await this.saveNotification(notification)
    this.showNotification(notification)
  }

  // Goal Milestone Celebrations
  async handleGoalMilestone(data: GoalMilestoneData): Promise<void> {
    const preferences = this.preferences.get(data.goalId)
    if (!preferences?.goalMilestones) return

    const milestoneMessages = {
      percentage: `🎉 You've reached ${data.milestoneValue}% of your ${data.goalName} goal!`,
      amount: `🎉 You've saved ${data.currency}${data.milestoneValue.toFixed(2)} towards ${data.goalName}!`,
      completed: `🏆 Congratulations! You've completed your ${data.goalName} goal!`
    }

    const notification: Notification = {
      id: `milestone_${data.goalId}_${Date.now()}`,
      type: 'goal_milestone',
      title: '🎯 Goal Milestone!',
      message: milestoneMessages[data.milestoneType],
      priority: 'medium',
      userId: data.goalId,
      partnershipId: data.partnershipId,
      read: false,
      actionUrl: '/goals-hub',
      metadata: {
        goalId: data.goalId,
        goalName: data.goalName,
        milestoneType: data.milestoneType,
        milestoneValue: data.milestoneValue,
        currentAmount: data.currentAmount,
        targetAmount: data.targetAmount,
        currency: data.currency
      },
      createdAt: new Date()
    }

    this.notifications.push(notification)
    await this.saveNotification(notification)
    this.showNotification(notification)
  }

  // Safety Pot Alerts
  async createSafetyPotAlert(userId: string, partnershipId: string, alertType: 'low_balance' | 'high_balance' | 'contribution_needed'): Promise<void> {
    const preferences = this.preferences.get(userId)
    if (!preferences?.safetyPotAlerts) return

    const alertMessages = {
      low_balance: 'Your safety pot is running low. Consider adding more funds for peace of mind.',
      high_balance: 'Your safety pot is well-funded! Consider redistributing excess funds to goals.',
      contribution_needed: 'Time to contribute to your safety pot to maintain your target coverage.'
    }

    const notification: Notification = {
      id: `safety_${userId}_${Date.now()}`,
      type: 'safety_pot_alert',
      title: '🛡️ Safety Pot Alert',
      message: alertMessages[alertType],
      priority: 'medium',
      userId,
      partnershipId,
      read: false,
      actionUrl: '/money-hub',
      metadata: { alertType },
      createdAt: new Date()
    }

    this.notifications.push(notification)
    await this.saveNotification(notification)
    this.showNotification(notification)
  }

  // Streak Achievement Notifications
  async createStreakAchievement(userId: string, streakType: 'monthly' | 'goal' | 'mixed', streakCount: number): Promise<void> {
    const preferences = this.preferences.get(userId)
    if (!preferences?.streakAchievements) return

    const notification: Notification = {
      id: `streak_${userId}_${Date.now()}`,
      type: 'streak_achievement',
      title: '🔥 Streak Achievement!',
      message: `Amazing! You've maintained a ${streakType} streak for ${streakCount} ${streakCount === 1 ? 'time' : 'times'}!`,
      priority: 'low',
      userId,
      read: false,
      actionUrl: '/gamification',
      metadata: {
        streakType,
        streakCount
      },
      createdAt: new Date()
    }

    this.notifications.push(notification)
    await this.saveNotification(notification)
    this.showNotification(notification)
  }

  // Approval Request Notifications
  async createApprovalRequest(userId: string, partnershipId: string, requestType: 'expense' | 'goal', entityName: string, amount?: number, currency?: string): Promise<void> {
    const preferences = this.preferences.get(userId)
    if (!preferences?.approvalRequests) return

    const message = amount && currency 
      ? `Your partner needs approval for a ${requestType}: ${entityName} (${currency}${amount.toFixed(2)})`
      : `Your partner needs approval for a ${requestType}: ${entityName}`

    const notification: Notification = {
      id: `approval_${userId}_${Date.now()}`,
      type: 'approval_request',
      title: '✅ Approval Needed',
      message,
      priority: 'high',
      userId,
      partnershipId,
      read: false,
      actionUrl: '/approvals',
      metadata: {
        requestType,
        entityName,
        amount,
        currency
      },
      createdAt: new Date()
    }

    this.notifications.push(notification)
    await this.saveNotification(notification)
    this.showNotification(notification)
  }

  // Show notification based on user preferences
  private async showNotification(notification: Notification): Promise<void> {
    const preferences = this.preferences.get(notification.userId)
    if (!preferences) return

    // Check quiet hours
    if (preferences.quietHours.enabled && this.isInQuietHours(preferences.quietHours)) {
      return
    }

    // Show in-app notification
    if (preferences.inAppNotifications) {
      this.showInAppNotification(notification)
    }

    // Show push notification (if supported)
    if (preferences.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
      this.showPushNotification(notification)
    }

    // Send email notification (in real app, this would be a server call)
    if (preferences.emailNotifications) {
      await this.sendEmailNotification(notification)
    }
  }

  private showInAppNotification(notification: Notification): void {
    // Use the existing toast system
    const { toast } = require('./toast')
    
    const iconMap = {
      payday_reminder: '💰',
      partner_activity: '👥',
      missed_contribution: '⚠️',
      goal_milestone: '🎯',
      approval_request: '✅',
      safety_pot_alert: '🛡️',
      streak_achievement: '🔥'
    }

    const icon = iconMap[notification.type] || '🔔'
    const message = `${icon} ${notification.title}: ${notification.message}`
    
    toast.info(message, { duration: 8000 })
  }

  private showPushNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent'
      })
    }
  }

  private async sendEmailNotification(notification: Notification): Promise<void> {
    // In a real app, this would call an API endpoint to send emails
    console.log('Email notification would be sent:', notification)
  }

  private isInQuietHours(quietHours: NotificationPreferences['quietHours']): boolean {
    if (!quietHours.enabled) return false

    const now = new Date()
    const currentTime = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      timeZone: quietHours.timezone 
    })

    const start = quietHours.startTime
    const end = quietHours.endTime

    if (start <= end) {
      return currentTime >= start && currentTime <= end
    } else {
      // Handles overnight quiet hours (e.g., 22:00 to 08:00)
      return currentTime >= start || currentTime <= end
    }
  }

  // Get notifications for a user
  async getNotifications(userId: string, limit = 50): Promise<Notification[]> {
    return this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
      await this.saveNotification(notification)
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    this.notifications
      .filter(n => n.userId === userId && !n.read)
      .forEach(n => {
        n.read = true
        this.saveNotification(n)
      })
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<void> {
    this.notifications = this.notifications.filter(n => n.id !== notificationId)
    // In real app, delete from database
  }

  // Update notification preferences
  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<void> {
    const current = this.preferences.get(userId)
    if (current) {
      const updated = { ...current, ...updates, updatedAt: new Date() }
      this.preferences.set(userId, updated)
      // In real app, save to database
    }
  }

  // Get unread count
  getUnreadCount(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.read).length
  }

  // Request push notification permission
  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('Push notifications denied')
      return false
    }

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // Save notification to database (mock implementation)
  private async saveNotification(notification: Notification): Promise<void> {
    // In a real app, this would save to Supabase
    console.log('Saving notification:', notification)
  }
}

export const notificationSystem = NotificationSystem.getInstance()
