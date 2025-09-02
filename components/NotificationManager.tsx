'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface NotificationManagerProps {
  profile: any
  partnerships: any[]
  goals: any[]
  approvals: any[]
  currentView: string
  onNavigateToView: (view: string) => void
  onAchievementUnlocked?: (achievement: any) => void
}

export function NotificationManager({ profile, partnerships, goals, approvals, currentView, onNavigateToView, onAchievementUnlocked }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const lastFetchRef = useRef<number>(0)
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Prevent infinite loops with proper dependency management
  const fetchNotifications = useCallback(async () => {
    if (!profile?.user_id || hasError || isLoading) return
    
    const now = Date.now()
    // Prevent too frequent calls (minimum 5 seconds between calls)
    if (now - lastFetchRef.current < 5000) return
    
    lastFetchRef.current = now
    setIsLoading(true)
    setHasError(false)

    try {
      const data = await apiClient.get('/notifications')
      setNotifications(data || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }, [profile?.user_id, hasError, isLoading])

  // Setup notification polling with proper cleanup
  useEffect(() => {
    if (!profile?.user_id) return

    // Initial fetch
    fetchNotifications()

    // Set up polling interval (every 30 seconds)
    fetchIntervalRef.current = setInterval(() => {
      fetchNotifications()
    }, 30000)

    // Cleanup function
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current)
        fetchIntervalRef.current = null
      }
    }
  }, [profile?.user_id, fetchNotifications])

  // Handle achievement notifications
  const handleAchievementNotification = useCallback((achievement: any) => {
    if (onAchievementUnlocked) {
      onAchievementUnlocked(achievement)
    }
    
    toast.success(`🎉 Achievement Unlocked: ${achievement.title}`)
  }, [onAchievementUnlocked])

  // Handle notification actions
  const handleNotificationAction = useCallback(async (notificationId: string, action: string) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/${action}`, {})
      
      // Remove notification from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      toast.success('Notification action completed')
    } catch (error) {
      console.error('Failed to handle notification action:', error)
      toast.error('Failed to complete action')
    }
  }, [])

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await apiClient.post(`/notifications/${notificationId}/read`, {})
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  // Don't render anything if there's an error or no user
  if (hasError || !profile?.user_id) {
    return null
  }

  // Render notifications (if any)
  return (
    <div className="notification-manager">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`notification-item ${notification.read ? 'read' : 'unread'}`}
          onClick={() => markAsRead(notification.id)}
        >
          <div className="notification-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            {notification.actions && (
              <div className="notification-actions">
                {notification.actions.map((action: any) => (
                  <button
                    key={action.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNotificationAction(notification.id, action.action)
                    }}
                    className="action-button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}