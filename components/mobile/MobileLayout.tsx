'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

interface MobileLayoutProps {
  children: React.ReactNode
  currentView: string
  onNavigate: (view: string) => void
  isOnline: boolean
  hasNotifications: boolean
  notificationCount: number
  user?: any
  profile?: any
  onSignOut?: () => Promise<void>
  onToggleTheme?: () => void
}

export function MobileLayout({
  children,
  currentView,
  onNavigate,
  isOnline,
  hasNotifications,
  notificationCount,
  user,
  profile,
  onSignOut,
  onToggleTheme
}: MobileLayoutProps) {
  const [realNotificationCount, setRealNotificationCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Fetch real notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await apiClient.get('/notifications')
        setRealNotificationCount(response.data.unreadCount || 0)
      } catch (error) {
        console.error('Failed to fetch notification count:', error)
        // Fallback to the passed notificationCount
        setRealNotificationCount(notificationCount)
      }
    }

    if (user?.id) {
      fetchNotificationCount()
      // Refresh every 30 seconds
      const interval = setInterval(fetchNotificationCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.id, notificationCount])

  console.log('🔄 MobileLayout render:', { currentView, hasUser: !!user, isOnline, realNotificationCount })
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* App Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white font-bold">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">SplitSave</h1>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            {/* Bell Notification Icon */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg"
              aria-label={`Notifications (${realNotificationCount} unread)`}
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25L4.5 14.25V9.75a6 6 0 0 1 6-6z" 
                />
              </svg>
              
              {/* Unread count badge */}
              {realNotificationCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {realNotificationCount > 99 ? '99+' : realNotificationCount}
                </div>
              )}
            </button>
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
                title="Toggle Theme"
              >
                <span className="text-gray-600 dark:text-gray-300">🌙</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('account')}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
              title="Account"
            >
              <span className="text-gray-600 dark:text-gray-300">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute top-16 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-w-sm w-80">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            {realNotificationCount > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  You have {realNotificationCount} unread notification{realNotificationCount !== 1 ? 's' : ''}
                </div>
                <button
                  onClick={() => {
                    onNavigate('partners')
                    setShowNotifications(false)
                  }}
                  className="w-full text-left p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  View in Partner Hub →
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No new notifications
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg pointer-events-auto">
        {/* Online/Offline Indicator */}
        <div className={`px-4 py-2 text-center text-xs font-medium ${
          isOnline ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          <span className="flex items-center justify-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-1 py-3">
          {[
            { id: 'overview', label: 'Overview', icon: '🏠' },
            { id: 'expenses', label: 'Money', icon: '💰' },
            { id: 'goals', label: 'Goals', icon: '🎯' },
            { id: 'partnerships', label: 'Partners', icon: '🤝' },
            { id: 'analytics', label: 'Analytics', icon: '📊' },
            { id: 'account', label: 'Account', icon: '👤' }
          ].map((item) => {
            const isActive = currentView === item.id
            const hasBadge = item.id === 'partnerships' && hasNotifications

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center space-y-1 px-1 py-1 rounded-lg transition-colors flex-1 min-w-0 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="relative">
                  <span className="text-lg">{item.icon}</span>
                  {hasBadge && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">!</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </button>
            )
          })}
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-20 right-4">
          <button
            onClick={() => onNavigate('expenses')}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
            title="Add Expense"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>

      {/* Bottom Safe Area Spacer */}
      <div className="h-6"></div>
    </div>
  )
}
