import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface NotificationManagerProps {
  profile: any
  partnerships: any[]
  goals: any[]
  approvals: any[]
  currentView: string
  onNavigateToView: (view: string) => void
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
}

interface Notification {
  id: string
  type: 'reminder' | 'achievement' | 'milestone' | 'alert'
  title: string
  message: string
  icon: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  createdAt: Date
  actionRequired?: boolean
  actionLabel?: string
  actionView?: string
}

export function NotificationManager({ 
  profile, 
  partnerships, 
  goals, 
  approvals,
  currentView,
  onNavigateToView 
}: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [notifications])

  const initializeAchievements = useCallback(() => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-goal',
        title: 'First Goal Set',
        description: 'Set your first savings goal',
        icon: '🎯',
        category: 'progress',
        unlocked: goals && goals.length > 0
      },
      {
        id: 'first-partnership',
        title: 'Partnership Formed',
        description: 'Connected with your financial partner',
        icon: '🤝',
        category: 'progress',
        unlocked: partnerships && partnerships.length > 0
      },
      {
        id: 'profile-complete',
        title: 'Profile Complete',
        description: 'Filled out your complete profile',
        icon: '✅',
        category: 'progress',
        unlocked: profile && profile.income && profile.payday
      },
      {
        id: 'first-month-tracked',
        title: 'First Month Tracked',
        description: 'Tracked your first month of progress',
        icon: '📅',
        category: 'progress',
        unlocked: false // Will be updated based on actual data
      },
      {
        id: 'three-month-streak',
        title: 'Three Month Streak',
        description: 'Tracked progress for 3 consecutive months',
        icon: '🔥',
        category: 'streak',
        unlocked: false,
        progress: 0,
        maxProgress: 3
      },
      {
        id: 'goal-25-percent',
        title: 'Quarter Way There',
        description: 'Reached 25% of any savings goal',
        icon: '🏁',
        category: 'milestone',
        unlocked: false
      },
      {
        id: 'goal-50-percent',
        title: 'Halfway Hero',
        description: 'Reached 50% of any savings goal',
        icon: '🎉',
        category: 'milestone',
        unlocked: false
      },
      {
        id: 'goal-75-percent',
        title: 'Almost There',
        description: 'Reached 75% of any savings goal',
        icon: '🚀',
        category: 'milestone',
        unlocked: false
      },
      {
        id: 'goal-complete',
        title: 'Goal Achieved',
        description: 'Completed your first savings goal',
        icon: '🏆',
        category: 'milestone',
        unlocked: false
      },
      {
        id: 'over-achiever',
        title: 'Over-Achiever',
        description: 'Exceeded your monthly savings target',
        icon: '⭐',
        category: 'special',
        unlocked: false
      },
      {
        id: 'financial-novice',
        title: 'Financial Novice',
        description: 'Complete your first month of tracking',
        icon: '🌱',
        category: 'progress',
        unlocked: false
      },
      {
        id: 'money-manager',
        title: 'Money Manager',
        description: 'Maintain 3-month streak and reach first goal',
        icon: '💼',
        category: 'progress',
        unlocked: false
      },
      {
        id: 'money-master',
        title: 'Money Master',
        description: 'Complete all goals and maintain 6-month streak',
        icon: '👑',
        category: 'progress',
        unlocked: false
      }
    ]

    setAchievements(baseAchievements)
  }, [goals, partnerships, profile])

  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev])
  }, [])

  const unlockAchievement = useCallback((achievement: Achievement) => {
    // Show achievement notification
    const notification: Notification = {
      id: `achievement-${achievement.id}`,
      type: 'achievement',
      title: `🏆 Achievement Unlocked: ${achievement.title}`,
      message: achievement.description,
      icon: achievement.icon,
      priority: 'medium',
      read: false,
      createdAt: new Date(),
      actionRequired: false
    }

    addNotification(notification)
    
    // Show toast celebration
    toast.success(`🎉 Achievement Unlocked: ${achievement.title}!`, {
      duration: 4000,
      icon: achievement.icon,
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontSize: '16px',
        padding: '16px'
      }
    })
  }, [addNotification])

  const checkForNewAchievements = useCallback(() => {
    if (!goals || !profile) return

    const updatedAchievements = achievements.map(achievement => {
      let shouldUnlock = false

      switch (achievement.id) {
        case 'first-goal':
          shouldUnlock = goals.length > 0
          break
        case 'first-partnership':
          shouldUnlock = partnerships.length > 0
          break
        case 'profile-complete':
          shouldUnlock = !!(profile.income && profile.payday && profile.personal_allowance)
          break
        case 'goal-25-percent':
          shouldUnlock = goals.some(goal => goal.current_amount >= goal.target_amount * 0.25)
          break
        case 'goal-50-percent':
          shouldUnlock = goals.some(goal => goal.current_amount >= goal.target_amount * 0.5)
          break
        case 'goal-75-percent':
          shouldUnlock = goals.some(goal => goal.current_amount >= goal.target_amount * 0.75)
          break
        case 'goal-complete':
          shouldUnlock = goals.some(goal => goal.current_amount >= goal.target_amount)
          break
      }

      if (shouldUnlock && !achievement.unlocked) {
        // Unlock achievement
        unlockAchievement(achievement)
        return { ...achievement, unlocked: true, unlockedAt: new Date() }
      }

      return achievement
    })

    setAchievements(updatedAchievements)
  }, [goals, profile, partnerships, achievements, unlockAchievement])

  const checkPaydayReminders = useCallback(() => {
    if (!profile?.payday) return

    const today = new Date()
    const payday = new Date(profile.payday)
    const daysUntilPayday = Math.ceil((payday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    // Check if we should show payday reminder
    if (daysUntilPayday <= 3 && daysUntilPayday >= -3) {
      const existingReminder = notifications.find(n => 
        n.type === 'reminder' && n.title.includes('Payday')
      )

      if (!existingReminder) {
        const notification: Notification = {
          id: `payday-reminder-${Date.now()}`,
          type: 'reminder',
          title: '💰 Payday Reminder',
          message: daysUntilPayday <= 0 
            ? "It's payday! Time to track your monthly progress and update your savings."
            : `Payday is in ${daysUntilPayday} day${daysUntilPayday === 1 ? '' : 's'}! Get ready to track your progress.`,
          icon: '💰',
          priority: 'high',
          read: false,
          createdAt: new Date(),
          actionRequired: true,
          actionLabel: 'Track Progress',
          actionView: 'monthly-progress'
        }

        addNotification(notification)
      }
    }
  }, [profile?.payday, notifications, addNotification])

  const checkGoalMilestones = useCallback(() => {
    if (!goals) return

    goals.forEach(goal => {
      const progress = goal.current_amount / goal.target_amount
      const milestones = [0.25, 0.5, 0.75, 1.0]
      
      milestones.forEach(milestone => {
        if (progress >= milestone) {
          const milestoneKey = `goal-${goal.id}-${Math.round(milestone * 100)}`
          const existingNotification = notifications.find(n => n.id === milestoneKey)
          
          if (!existingNotification) {
            const notification: Notification = {
              id: milestoneKey,
              type: 'milestone',
              title: `🎯 Goal Milestone: ${goal.name}`,
              message: `Congratulations! You've reached ${Math.round(milestone * 100)}% of your ${goal.name} goal.`,
              icon: '🎯',
              priority: 'medium',
              read: false,
              createdAt: new Date(),
              actionRequired: false
            }

            addNotification(notification)
          }
        }
      })
    })
  }, [goals, notifications, addNotification])

  const checkApprovalRequests = useCallback(() => {
    if (!approvals) return

    const pendingApprovals = approvals.filter(approval => approval.status === 'pending')
    
    pendingApprovals.forEach(approval => {
      const approvalKey = `approval-${approval.id}`
      const existingNotification = notifications.find(n => n.id === approvalKey)
      
      if (!existingNotification) {
        const notification: Notification = {
          id: approvalKey,
          type: 'alert',
          title: `⏳ Approval Required: ${approval.title}`,
          message: `${approval.requester_name} is waiting for your approval on a ${approval.type} request.`,
          icon: '⏳',
          priority: 'high',
          read: false,
          createdAt: new Date(approval.created_at),
          actionRequired: true,
          actionLabel: 'Review',
          actionView: 'partners'
        }

        addNotification(notification)
      }
    })
  }, [approvals, notifications, addNotification])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const handleNotificationAction = (notification: Notification) => {
    if (notification.actionView) {
      onNavigateToView(notification.actionView)
      markAsRead(notification.id)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default: return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🔵'
      default: return '⚪'
    }
  }

  // Initialize achievements and check for notifications when component mounts or dependencies change
  useEffect(() => {
    initializeAchievements()
    checkForNewAchievements()
    checkPaydayReminders()
    checkGoalMilestones()
    checkApprovalRequests()
  }, [profile, goals, partnerships, approvals, initializeAchievements, checkForNewAchievements, checkPaydayReminders, checkGoalMilestones, checkApprovalRequests])

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="p-2">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🔕</div>
                <div>No notifications yet</div>
                <div className="text-sm">We&apos;ll notify you about important updates</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border mb-2 transition-all ${
                    getPriorityColor(notification.priority)
                  } ${notification.read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-lg">{notification.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs">{getPriorityIcon(notification.priority)}</span>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {notification.createdAt.toLocaleDateString()}
                        </span>
                        <div className="flex items-center space-x-2">
                          {notification.actionRequired && notification.actionLabel && (
                            <button
                              onClick={() => handleNotificationAction(notification)}
                              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                            >
                              {notification.actionLabel}
                            </button>
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Achievements Panel (can be triggered from elsewhere) */}
      <div className="hidden">
        {/* This will be shown when achievements are unlocked */}
        {achievements.filter(a => a.unlocked).map(achievement => (
          <div key={achievement.id} className="text-sm text-gray-600 dark:text-gray-400">
            {achievement.icon} {achievement.title}
          </div>
        ))}
      </div>
    </div>
  )
}
