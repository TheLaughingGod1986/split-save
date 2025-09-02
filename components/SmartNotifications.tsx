'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { useAuth } from './AuthProvider'

interface NotificationSetting {
  id: string
  type: 'payday' | 'goal_deadline' | 'streak_risk' | 'achievement' | 'approval' | 'partner_activity'
  enabled: boolean
  method: 'push' | 'email' | 'both'
  timing: number // hours before/after
  title: string
  description: string
}

interface PaydayReminder {
  id: string
  userId: string
  nextPayday: string
  reminderDays: number[]
  enabled: boolean
  message: string
}

interface ProgressAlert {
  id: string
  type: 'goal_behind' | 'streak_broken' | 'milestone_reached' | 'contribution_missed'
  title: string
  message: string
  severity: 'info' | 'warning' | 'success' | 'error'
  actionRequired: boolean
  relatedEntityId?: string
  createdAt: string
}

export function SmartNotifications() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [paydayReminders, setPaydayReminders] = useState<PaydayReminder[]>([])
  const [progressAlerts, setProgressAlerts] = useState<ProgressAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'settings' | 'reminders' | 'alerts'>('settings')

  // Default notification settings
  const defaultSettings: NotificationSetting[] = [
    {
      id: 'payday-reminder',
      type: 'payday',
      enabled: true,
      method: 'push',
      timing: 24, // 24 hours before
      title: 'Payday Reminders',
      description: 'Get notified before your payday to prepare contributions'
    },
    {
      id: 'goal-deadline',
      type: 'goal_deadline',
      enabled: true,
      method: 'push',
      timing: 168, // 1 week before
      title: 'Goal Deadline Alerts',
      description: 'Alerts when goal deadlines are approaching'
    },
    {
      id: 'streak-risk',
      type: 'streak_risk',
      enabled: true,
      method: 'both',
      timing: 24, // 24 hours after missed
      title: 'Streak Risk Warnings',
      description: 'Warnings when your saving streak is at risk'
    },
    {
      id: 'achievement',
      type: 'achievement',
      enabled: true,
      method: 'push',
      timing: 0, // immediate
      title: 'Achievement Notifications',
      description: 'Celebrations when you unlock new achievements'
    },
    {
      id: 'approval',
      type: 'approval',
      enabled: true,
      method: 'push',
      timing: 0, // immediate
      title: 'Approval Requests',
      description: 'Notifications for partner approval requests'
    },
    {
      id: 'partner-activity',
      type: 'partner_activity',
      enabled: false,
      method: 'push',
      timing: 0, // immediate
      title: 'Partner Activity',
      description: 'Updates when your partner makes contributions'
    }
  ]

  const loadNotificationData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load notification settings (use defaults for now)
      setSettings(defaultSettings)
      
      // Generate mock payday reminders
      const mockPaydayReminders: PaydayReminder[] = [
        {
          id: '1',
          userId: user?.id || '',
          nextPayday: getNextPayday(),
          reminderDays: [1, 3], // 1 and 3 days before
          enabled: true,
          message: 'Your payday is coming up! Don\'t forget to make your monthly savings contributions.'
        }
      ]
      setPaydayReminders(mockPaydayReminders)
      
      // Generate mock progress alerts
      const mockProgressAlerts: ProgressAlert[] = [
        {
          id: '1',
          type: 'goal_behind',
          title: 'Goal Progress Behind',
          message: 'Your "Holiday Fund" goal is 15% behind target for this month. Consider increasing your contribution.',
          severity: 'warning',
          actionRequired: true,
          relatedEntityId: 'goal-1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'milestone_reached',
          title: 'Milestone Achieved!',
          message: 'Congratulations! You\'ve reached 50% of your "Emergency Fund" goal.',
          severity: 'success',
          actionRequired: false,
          relatedEntityId: 'goal-2',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'streak_broken',
          title: 'Streak Interrupted',
          message: 'Your 4-month savings streak was broken. Start a new streak by making a contribution today!',
          severity: 'error',
          actionRequired: true,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
      ]
      setProgressAlerts(mockProgressAlerts)
      
    } catch (error) {
      console.error('Error loading notification data:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  // Load notification data when component mounts
  useEffect(() => {
    loadNotificationData()
  }, [loadNotificationData])

  const getNextPayday = () => {
    // Calculate next payday (assuming monthly on the 1st for demo)
    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return nextMonth.toISOString().split('T')[0]
  }

  const updateNotificationSetting = async (settingId: string, updates: Partial<NotificationSetting>) => {
    try {
      setSettings(prev => prev.map(setting => 
        setting.id === settingId ? { ...setting, ...updates } : setting
      ))
      
      // In a real app, this would save to backend
      toast.success('Notification setting updated')
    } catch (error) {
      console.error('Error updating notification setting:', error)
      toast.error('Failed to update setting')
    }
  }

  const dismissAlert = async (alertId: string) => {
    try {
      setProgressAlerts(prev => prev.filter(alert => alert.id !== alertId))
      toast.success('Alert dismissed')
    } catch (error) {
      console.error('Error dismissing alert:', error)
      toast.error('Failed to dismiss alert')
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!')
      } else {
        toast.warning('Browser notifications denied')
      }
    } else {
      toast.error('Browser notifications not supported')
    }
  }

  const testNotification = (setting: NotificationSetting) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(setting.title, {
        body: 'This is a test notification from SplitSave',
        icon: '/icon-192x192.png',
        tag: 'test-notification'
      })
    } else {
      toast.info('Test notification sent (check browser notifications)')
    }
  }

  const getSeverityColor = (severity: ProgressAlert['severity']) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
    }
  }

  const getSeverityIcon = (severity: ProgressAlert['severity']) => {
    switch (severity) {
      case 'success': return '🎉'
      case 'warning': return '⚠️'
      case 'error': return '🚨'
      default: return 'ℹ️'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">🔔</span>
            <div>
              <h1 className="text-2xl font-bold">Smart Notifications</h1>
              <p className="text-blue-100">Loading your notification settings...</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🔔</span>
          <div>
            <h1 className="text-2xl font-bold">Smart Notifications</h1>
            <p className="text-blue-100">Stay on top of your financial goals with intelligent reminders</p>
          </div>
        </div>
      </div>

      {/* Notification Permission */}
      {Notification.permission !== 'granted' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🔔</span>
            <div className="flex-1">
              <h3 className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                Enable Browser Notifications
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm mb-4">
                Allow SplitSave to send you important reminders and updates directly to your browser.
              </p>
              <button
                onClick={requestNotificationPermission}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'settings', label: 'Settings', icon: '⚙️' },
          { id: 'reminders', label: 'Reminders', icon: '📅' },
          { id: 'alerts', label: 'Alerts', icon: '🚨', badge: progressAlerts.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Tabs */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              ⚙️ Notification Preferences
            </h2>
            
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {setting.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {setting.description}
                    </p>
                    {setting.timing > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {setting.timing >= 24 
                          ? `${Math.floor(setting.timing / 24)} day(s) before`
                          : `${setting.timing} hour(s) before`
                        }
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {/* Method Selection */}
                    <select
                      value={setting.method}
                      onChange={(e) => updateNotificationSetting(setting.id, { method: e.target.value as any })}
                      className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={!setting.enabled}
                    >
                      <option value="push">Push</option>
                      <option value="email">Email</option>
                      <option value="both">Both</option>
                    </select>
                    
                    {/* Test Button */}
                    <button
                      onClick={() => testNotification(setting)}
                      disabled={!setting.enabled}
                      className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded transition-colors"
                    >
                      Test
                    </button>
                    
                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={(e) => updateNotificationSetting(setting.id, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📅 Payday Reminders
            </h2>
            
            {paydayReminders.map((reminder) => (
              <div key={reminder.id} className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-green-800 dark:text-green-200">
                      Next Payday: {new Date(reminder.nextPayday).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {reminder.message}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Reminders: {reminder.reminderDays.join(', ')} day(s) before
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💰</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminder.enabled}
                        onChange={(e) => {
                          setPaydayReminders(prev => prev.map(r => 
                            r.id === reminder.id ? { ...r, enabled: e.target.checked } : r
                          ))
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>

                {/* Upcoming Reminders */}
                <div className="ml-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upcoming Reminders:
                  </h4>
                  {reminder.reminderDays.map((days) => {
                    const reminderDate = new Date(reminder.nextPayday)
                    reminderDate.setDate(reminderDate.getDate() - days)
                    return (
                      <div key={days} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <span>📅</span>
                        <span>{reminderDate.toLocaleDateString()}</span>
                        <span>({days} day{days > 1 ? 's' : ''} before payday)</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🚨 Progress Alerts
            </h2>
            
            {progressAlerts.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">✅</span>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  No alerts right now
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  You&apos;re on track with all your financial goals!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {progressAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{alert.title}</h3>
                          <p className="text-sm mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-xs opacity-75">
                            <span>{new Date(alert.createdAt).toLocaleString()}</span>
                            {alert.actionRequired && (
                              <span className="bg-white bg-opacity-30 px-2 py-1 rounded-full">
                                Action Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="ml-3 p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                        title="Dismiss alert"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {alert.actionRequired && (
                      <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                        <div className="flex space-x-2">
                          <button className="bg-white bg-opacity-30 hover:bg-opacity-50 px-3 py-1 rounded text-sm font-medium transition-colors">
                            Take Action
                          </button>
                          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm transition-colors">
                            Remind Later
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
