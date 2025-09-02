'use client'

import { toast } from 'react-hot-toast'

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
  requireInteraction?: boolean
  silent?: boolean
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null
  private isSupported: boolean = false
  private permission: NotificationPermission = 'default'

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator
    this.permission = typeof window !== 'undefined' ? Notification.permission : 'default'
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser')
      return false
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready
      
      // Request notification permission
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission()
      }

      if (this.permission === 'granted') {
        console.log('✅ Push notifications enabled')
        return true
      } else {
        console.warn('❌ Push notification permission denied')
        return false
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration || this.permission !== 'granted') {
      return null
    }

    try {
      // Get existing subscription
      let subscription = await this.registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Create new subscription
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI8vW8qWpjt0LldQzRg1Z9b3W3HBa1b8y2fvhA7o8Y0PU4w8Q+Pn8DeDjg='
        
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as BufferSource
        })
      }

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const subscription = await this.registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await this.removeSubscriptionFromServer(subscription)
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  /**
   * Show local notification
   */
  async showNotification(payload: PushNotificationPayload): Promise<void> {
    if (!this.registration || this.permission !== 'granted') {
      // Fallback to toast notification
      toast.success(`${payload.title}: ${payload.body}`, {
        duration: 5000
      })
      return
    }

    try {
      const notificationOptions: any = {
        body: payload.body,
        icon: payload.icon || '/icon-192x192.png',
        badge: payload.badge || '/icon-192x192.png',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        vibrate: [200, 100, 200],
        timestamp: Date.now(),
        actions: payload.actions
      }

      await this.registration.showNotification(payload.title, notificationOptions)
    } catch (error) {
      console.error('Failed to show notification:', error)
      // Fallback to toast
      toast.success(`${payload.title}: ${payload.body}`, {
        duration: 5000
      })
    }
  }

  /**
   * Schedule a notification
   */
  async scheduleNotification(payload: PushNotificationPayload, delay: number): Promise<void> {
    setTimeout(() => {
      this.showNotification(payload)
    }, delay)
  }

  /**
   * Clear all notifications
   */
  async clearNotifications(): Promise<void> {
    if (this.registration) {
      const notifications = await this.registration.getNotifications()
      notifications.forEach(notification => notification.close())
    }
  }

  /**
   * Get notification permission status
   */
  getPermissionStatus(): NotificationPermission {
    return this.permission
  }

  /**
   * Check if notifications are supported and enabled
   */
  isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted'
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send subscription to server')
      }
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      })
    } catch (error) {
      console.error('Failed to remove subscription from server:', error)
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray as Uint8Array
  }
}

export const pushNotificationManager = new PushNotificationManager()

// Notification types for the app
export const NotificationTypes = {
  PAYDAY_REMINDER: 'payday-reminder',
  GOAL_MILESTONE: 'goal-milestone',
  PARTNER_ACTIVITY: 'partner-activity',
  ACHIEVEMENT_UNLOCKED: 'achievement-unlocked',
  CONTRIBUTION_REMINDER: 'contribution-reminder',
  SAFETY_POT_ALERT: 'safety-pot-alert',
  EXPENSE_ALERT: 'expense-alert',
  PARTNERSHIP_INVITE: 'partnership-invite'
} as const

// Predefined notification templates
export const NotificationTemplates = {
  [NotificationTypes.PAYDAY_REMINDER]: {
    title: '💰 Payday Reminder',
    body: 'Time to make your monthly contribution!',
    icon: '/icons/money.png',
    tag: 'payday-reminder'
  },
  [NotificationTypes.GOAL_MILESTONE]: {
    title: '🎯 Goal Milestone',
    body: 'Congratulations! You\'ve reached a savings milestone.',
    icon: '/icons/target.png',
    tag: 'goal-milestone'
  },
  [NotificationTypes.PARTNER_ACTIVITY]: {
    title: '🤝 Partner Activity',
    body: 'Your partner has made a new contribution.',
    icon: '/icons/partner.png',
    tag: 'partner-activity'
  },
  [NotificationTypes.ACHIEVEMENT_UNLOCKED]: {
    title: '🏆 Achievement Unlocked',
    body: 'You\'ve earned a new achievement!',
    icon: '/icons/achievement.png',
    tag: 'achievement-unlocked'
  },
  [NotificationTypes.CONTRIBUTION_REMINDER]: {
    title: '💡 Contribution Reminder',
    body: 'Don\'t forget to contribute to your goals this month.',
    icon: '/icons/reminder.png',
    tag: 'contribution-reminder'
  },
  [NotificationTypes.SAFETY_POT_ALERT]: {
    title: '🛡️ Safety Pot Alert',
    body: 'Your safety pot needs attention.',
    icon: '/icons/safety.png',
    tag: 'safety-pot-alert'
  },
  [NotificationTypes.EXPENSE_ALERT]: {
    title: '⚠️ Expense Alert',
    body: 'Unusual spending pattern detected.',
    icon: '/icons/expense.png',
    tag: 'expense-alert'
  },
  [NotificationTypes.PARTNERSHIP_INVITE]: {
    title: '📧 Partnership Invite',
    body: 'You have a new partnership invitation.',
    icon: '/icons/invite.png',
    tag: 'partnership-invite'
  }
} as const
