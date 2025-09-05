'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from '@/lib/toast'
// Temporarily commented out imports that don't exist
// import { 
//   NotificationPreferences,
//   generatePaydayReminders,
//   generateProgressAlerts,
//   shouldSendNotification
// } from '@/lib/notification-system'

// Temporary stubs for missing types
interface NotificationConfig {
  id: string
  type: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  userId: string
  partnershipId?: string
  relatedEntityId?: string
  read: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: Date
  scheduledFor?: Date
  expiresAt?: Date
  icon?: string
  requiresAction?: boolean
}

interface NotificationPreferences {
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
    startTime: string
    endTime: string
    timezone: string
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
  updatedAt: Date
}

interface NotificationManagerProps {
  userId: string
  userProfile: any
  goals: any[]
  contributions: any[]
  achievements: any[]
  onNotificationAction?: (notification: NotificationConfig) => void
}

export function SmartNotificationManager({
  userId,
  userProfile,
  goals,
  contributions,
  achievements,
  onNotificationAction
}: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<NotificationConfig[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>({
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
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    },
    frequency: 'immediate',
    updatedAt: new Date()
  })
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  
  const notificationRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()



  // Generate initial notifications
  const generateInitialNotifications = useCallback(() => {
    const newNotifications: NotificationConfig[] = []
    
    // Payday reminders
    if (preferences.paydayReminders && userProfile?.payday) {
      // Temporarily commented out - function doesn't exist
      // const paydayReminders = generatePaydayReminders(
      //   userId,
      //   userProfile.payday,
      //   userProfile.income || 0,
      //   userProfile.currency || 'GBP'
      // )
      const paydayReminders: any[] = []
      
      paydayReminders.forEach(reminder => {
        const daysUntilPayday = Math.ceil((reminder.nextPayday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysUntilPayday <= 7) {
          newNotifications.push({
            id: reminder.id,
            type: 'payday',
            title: '💰 Payday Reminder',
            message: `Your next payday is in ${daysUntilPayday} day${daysUntilPayday > 1 ? 's' : ''}. Expected amount: ${formatCurrency(reminder.amount, reminder.currency)}`,
            priority: daysUntilPayday <= 1 ? 'high' : 'medium',
            icon: '💰',
            requiresAction: false,
            scheduledFor: new Date(),
            metadata: { daysUntilPayday, amount: reminder.amount, currency: reminder.currency }
          })
        }
      })
    }
    
    // Progress alerts
    if (preferences.goalMilestones) {
      // Temporarily commented out - function doesn't exist
      // const progressAlerts = generateProgressAlerts(userId, goals, contributions, { currentStreak: 0 })
      const progressAlerts: any[] = []
      
      progressAlerts.forEach(alert => {
        if (alert.triggered) {
          newNotifications.push({
            id: alert.id,
            type: 'progress',
            title: '⚠️ Progress Alert',
            message: alert.message,
            priority: 'high',
            icon: '⚠️',
            requiresAction: true,
            scheduledFor: new Date(),
            metadata: { 
              type: alert.type,
              currentValue: alert.currentValue,
              targetValue: alert.targetValue,
              progress: alert.progress
            }
          })
        }
      })
    }
    
    // Achievement notifications
    if (preferences.achievementNotifications && achievements.length > 0) {
      achievements.forEach(achievement => {
        if (achievement.unlocked && !achievement.notified) {
          newNotifications.push({
            id: `achievement-${achievement.id}`,
            type: 'achievement',
            title: '🏆 Achievement Unlocked!',
            message: `Congratulations! You've unlocked "${achievement.name}" - ${achievement.description}`,
            priority: 'medium',
            icon: '🏆',
            requiresAction: false,
            scheduledFor: new Date(),
            metadata: { achievementId: achievement.id, points: achievement.points }
          })
        }
      })
    }
    
    setNotifications(prev => [...prev, ...newNotifications])
    setUnreadCount(prev => prev + newNotifications.length)
  }, [userId, userProfile, goals, contributions, achievements, preferences])

  // Start periodic notification checks
  const startNotificationChecks = useCallback(() => {
    intervalRef.current = setInterval(() => {
      checkForNewNotifications()
    }, 5 * 60 * 1000) // Check every 5 minutes
  }, [])

  // Initialize notifications
  useEffect(() => {
    if (userId && userProfile) {
      generateInitialNotifications()
      startNotificationChecks()
    
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [userId, userProfile, goals, contributions, achievements, generateInitialNotifications, startNotificationChecks])

  // Check for new notifications
  const checkForNewNotifications = useCallback(() => {
    const now = new Date()
    
    // Check if any scheduled notifications should be shown
    const dueNotifications = notifications.filter(n => 
      n.scheduledFor && n.scheduledFor <= now && !n.expiresAt
    )
    
    dueNotifications.forEach(notification => {
      // Temporarily commented out - function doesn't exist
      // if (shouldSendNotification(preferences, notification.priority)) {
        showNotification(notification)
      // }
    })
  }, [notifications, preferences])

  // Show a notification
  const showNotification = (notification: NotificationConfig) => {
    // Show toast notification
    toast.success(notification.message, {
      duration: 8000
    })
    
    // Mark as shown
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
          : n
      )
    )
  }

  // Handle notification action
  const handleNotificationAction = (notification: NotificationConfig) => {
    if (onNotificationAction) {
      onNotificationAction(notification)
    }
    
    // Mark as read
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, requiresAction: false }
          : n
      )
    )
    
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, requiresAction: false }
          : n
      )
    )
    
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Dismiss notification
  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 dark:text-red-400'
      case 'high': return 'text-orange-600 dark:text-orange-400'
      case 'medium': return 'text-blue-600 dark:text-blue-400'
      case 'low': return 'text-gray-600 dark:text-gray-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  // Get priority background
  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'high': return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'medium': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      case 'low': return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
      default: return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isExpanded ? 'Compact' : 'Expand'}
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-4xl block mb-2">🔕</span>
                <p>No notifications</p>
                <p className="text-sm">You&apos;re all caught up!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications
                  .sort((a, b) => {
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
                    return priorityOrder[a.priority] - priorityOrder[b.priority]
                  })
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all ${
                        getPriorityBg(notification.priority)
                      } ${notification.requiresAction ? 'ring-2 ring-blue-400' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-xl">{notification.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                              {notification.title}
                            </h4>
                            <span className={`text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                            {notification.message}
                          </p>
                          
                          {isExpanded && notification.metadata && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                              {notification.metadata.daysUntilPayday && (
                                <div>Days until payday: {notification.metadata.daysUntilPayday}</div>
                              )}
                              {notification.metadata.amount && (
                                <div>Amount: {formatCurrency(notification.metadata.amount, notification.metadata.currency)}</div>
                              )}
                              {notification.metadata.progress && (
                                <div>Progress: {notification.metadata.progress.toFixed(1)}%</div>
                              )}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                              {notification.requiresAction && (
                                <button
                                  onClick={() => handleNotificationAction(notification)}
                                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                                >
                                  View
                                </button>
                              )}
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                Mark Read
                              </button>
                            </div>
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}
