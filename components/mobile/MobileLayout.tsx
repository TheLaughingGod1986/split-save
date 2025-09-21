'use client'

import React, { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { NotificationDropdown } from '../notifications/NotificationDropdown'

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
  isDarkMode?: boolean
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
  onToggleTheme,
  isDarkMode
}: MobileLayoutProps) {
  const [realNotificationCount, setRealNotificationCount] = useState(0)

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
  
  const viewLabels: Record<string, string> = {
    overview: 'Overview',
    expenses: 'Money',
    goals: 'Goals',
    partnerships: 'Partners',
    analytics: 'Analytics',
    account: 'Account',
    'monthly-progress': 'Monthly Progress'
  }

  const currentViewLabel = viewLabels[currentView] || 'Dashboard'
  const displayName = profile?.name && profile.name.trim().length > 0
    ? profile.name.trim().split(' ')[0]
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex flex-col">
      <div
        className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-700"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold">S</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {displayName ? `Hi, ${displayName}` : 'SplitSave'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{currentViewLabel}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onNavigate('account')}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open settings"
            >
              <span className="text-xl">⚙️</span>
            </button>
            <div className="relative">
              <NotificationDropdown
                userId={user?.id || ''}
              />
              {realNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" aria-hidden="true"></span>
              )}
            </div>
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                <span className="text-xl">{isDarkMode ? '☀️' : '🌙'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

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
