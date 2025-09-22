'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { pushNotificationManager, NotificationTypes, NotificationTemplates } from '@/lib/push-notifications'

interface NotificationPreference {
  type: string
  enabled: boolean
  methods: {
    push: boolean
    email: boolean
    inApp: boolean
  }
}

export function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeNotifications()
  }, [])

  const initializeNotifications = async () => {
    try {
      setLoading(true)
      
      // Check if notifications are supported
      const supported = pushNotificationManager.isSupportedInBrowser()
      setIsSupported(supported)

      // Get permission status
      const permissionStatus = pushNotificationManager.getPermissionStatus()
      setPermission(permissionStatus)
      setIsEnabled(permissionStatus === 'granted')
      
      // Initialize notification preferences
      const defaultPreferences = Object.values(NotificationTypes).map(type => ({
        type,
        enabled: true,
        methods: {
          push: true,
          email: false,
          inApp: true
        }
      }))
      
      setPreferences(defaultPreferences)
    } catch (error) {
      console.error('Failed to initialize notifications:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }

  const requestPermission = async () => {
    try {
      const success = await pushNotificationManager.initialize()
      
      if (success) {
        setIsEnabled(true)
        setPermission('granted')
        toast.success('Push notifications enabled!')
        
        // Subscribe to push notifications
        await pushNotificationManager.subscribeToPush()
      } else {
        toast.error('Push notifications were denied')
      }
    } catch (error) {
      console.error('Failed to request permission:', error)
      toast.error('Failed to enable push notifications')
    }
  }

  const disableNotifications = async () => {
    try {
      await pushNotificationManager.unsubscribeFromPush()
      setIsEnabled(false)
      setPermission('denied')
      toast.success('Push notifications disabled')
    } catch (error) {
      console.error('Failed to disable notifications:', error)
      toast.error('Failed to disable push notifications')
    }
  }

  const testNotification = async () => {
    try {
      await pushNotificationManager.showNotification({
        title: 'Test Notification',
        body: 'This is a test notification from SplitSave!',
        icon: '/icon-192x192.png',
        tag: 'test-notification'
      })
      toast.success('Test notification sent!')
    } catch (error) {
      console.error('Failed to send test notification:', error)
      toast.error('Failed to send test notification')
    }
  }

  const updatePreference = (type: string, field: string, value: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.type === type 
          ? { ...pref, [field]: value }
          : pref
      )
    )
  }

  const updateMethodPreference = (type: string, method: string, value: boolean) => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.type === type 
          ? { 
              ...pref, 
              methods: { ...pref.methods, [method]: value }
            }
          : pref
      )
    )
  }

  const savePreferences = async () => {
    try {
      // Save preferences to server
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ preferences })
      })

      if (response.ok) {
        toast.success('Notification preferences saved!')
      } else {
        throw new Error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Failed to save preferences:', error)
      toast.error('Failed to save notification preferences')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="text-yellow-600 dark:text-yellow-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
              Push Notifications Not Supported
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300">
              Your browser doesn&apos;t support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Push Notifications
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Status: <span className={`font-medium ${
                permission === 'granted' ? 'text-green-600' : 
                permission === 'denied' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {permission === 'granted' ? 'Enabled' : 
                 permission === 'denied' ? 'Disabled' : 
                 'Not Set'}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            {permission === 'granted' ? (
              <>
                <button
                  onClick={testNotification}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Test
                </button>
                <button
                  onClick={disableNotifications}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Disable
                </button>
              </>
            ) : (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Enable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      {permission === 'granted' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            {preferences.map((preference) => {
              const template = NotificationTemplates[preference.type as keyof typeof NotificationTemplates]
              return (
                <div key={preference.type} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{template?.icon || '🔔'}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {template?.title || preference.type}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {template?.body || 'Notification description'}
                        </p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preference.enabled}
                        onChange={(e) => updatePreference(preference.type, 'enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {preference.enabled && (
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preference.methods.push}
                          onChange={(e) => updateMethodPreference(preference.type, 'push', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Push</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preference.methods.email}
                          onChange={(e) => updateMethodPreference(preference.type, 'email', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Email</span>
                      </label>
                      
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preference.methods.inApp}
                          onChange={(e) => updateMethodPreference(preference.type, 'inApp', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">In-App</span>
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={savePreferences}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
