'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationSystem, type Notification, type NotificationPreferences } from '@/lib/notification-system'
import { toast } from '@/lib/toast'

interface NotificationCenterProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

export function NotificationCenter({ userId, isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'notifications' | 'preferences'>('notifications')
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const userNotifications = await notificationSystem.getNotifications(userId)
      setNotifications(userNotifications)
      setUnreadCount(notificationSystem.getUnreadCount(userId))
    } catch (error) {
      console.error('Failed to load notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadPreferences = useCallback(async () => {
    // In a real app, this would load from database
    // For now, we'll use default preferences
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
    setPreferences(defaultPreferences)
  }, [userId])

  // Load notifications and preferences when component opens
  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications()
      loadPreferences()
    }
  }, [isOpen, userId, loadNotifications, loadPreferences])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationSystem.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationSystem.markAllAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationSystem.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(notificationSystem.getUnreadCount(userId))
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: any) => {
    if (!preferences) return

    try {
      const updatedPreferences = { ...preferences, [key]: value, updatedAt: new Date() }
      await notificationSystem.updatePreferences(userId, { [key]: value })
      setPreferences(updatedPreferences)
      toast.success('Notification preferences updated')
    } catch (error) {
      console.error('Failed to update preferences:', error)
      toast.error('Failed to update preferences')
    }
  }

  const handleRequestPushPermission = async () => {
    try {
      const granted = await notificationSystem.requestPushPermission()
      if (granted) {
        toast.success('Push notifications enabled!')
        setPreferences(prev => prev ? { ...prev, pushNotifications: true } : null)
      } else {
        toast.warning('Push notifications denied. You can enable them in your browser settings.')
      }
    } catch (error) {
      console.error('Failed to request push permission:', error)
      toast.error('Failed to request push permission')
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      payday_reminder: '💰',
      partner_activity: '👥',
      missed_contribution: '⚠️',
      goal_milestone: '🎯',
      approval_request: '✅',
      safety_pot_alert: '🛡️',
      streak_achievement: '🔥'
    }
    return iconMap[type] || '🔔'
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    const colorMap = {
      low: 'text-gray-500',
      medium: 'text-blue-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    }
    return colorMap[priority]
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔔</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Notifications</h3>
                  <p className="text-blue-100 text-sm">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>🔔</span>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span>⚙️</span>
                <span>Preferences</span>
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'notifications' && (
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">🎉</span>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All caught up!</h3>
                    <p className="text-gray-500 dark:text-gray-400">No notifications to show.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-900 dark:text-white">Recent Notifications</h4>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className={`p-4 rounded-lg border transition-all ${
                            notification.read
                              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className={`font-medium ${getPriorityColor(notification.priority)} ${
                                    notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {notification.title}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    {formatTime(notification.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  {!notification.read && (
                                    <button
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                    >
                                      Mark read
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preferences' && preferences && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Notification Types</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'paydayReminders', label: 'Payday Reminders', description: 'Get reminded on your payday to contribute' },
                      { key: 'partnerActivity', label: 'Partner Activity', description: 'Notifications when your partner adds expenses or goals' },
                      { key: 'missedContributions', label: 'Missed Contributions', description: 'Alerts when you miss expected contributions' },
                      { key: 'goalMilestones', label: 'Goal Milestones', description: 'Celebrate when you reach savings milestones' },
                      { key: 'approvalRequests', label: 'Approval Requests', description: 'When your partner needs approval for expenses/goals' },
                      { key: 'safetyPotAlerts', label: 'Safety Pot Alerts', description: 'Alerts about your emergency fund status' },
                      { key: 'streakAchievements', label: 'Streak Achievements', description: 'Celebrate your saving streaks' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[key as keyof NotificationPreferences] as boolean}
                            onChange={(e) => handlePreferenceChange(key as keyof NotificationPreferences, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Delivery Methods</h4>
                  <div className="space-y-4">
                    {[
                      { key: 'inAppNotifications', label: 'In-App Notifications', description: 'Show notifications within the app' },
                      { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications' },
                      { key: 'emailNotifications', label: 'Email Notifications', description: 'Send notifications via email' }
                    ].map(({ key, label, description }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[key as keyof NotificationPreferences] as boolean}
                            onChange={(e) => handlePreferenceChange(key as keyof NotificationPreferences, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {preferences.pushNotifications && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        Push notifications require browser permission
                      </p>
                      <button
                        onClick={handleRequestPushPermission}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Request Permission
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Quiet Hours</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Enable Quiet Hours</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pause notifications during specific hours</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.quietHours.enabled}
                          onChange={(e) => handlePreferenceChange('quietHours', { ...preferences.quietHours, enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    {preferences.quietHours.enabled && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={preferences.quietHours.startTime}
                            onChange={(e) => handlePreferenceChange('quietHours', { ...preferences.quietHours, startTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={preferences.quietHours.endTime}
                            onChange={(e) => handlePreferenceChange('quietHours', { ...preferences.quietHours, endTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
