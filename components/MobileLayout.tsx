'use client'

import React from 'react'

interface MobileLayoutProps {
  children: React.ReactNode
  currentView: string
  onNavigate: (view: string) => void
  isOnline: boolean
  hasNotifications: boolean
  notificationCount: number
}

export function MobileLayout({
  children,
  currentView,
  onNavigate,
  isOnline,
  hasNotifications,
  notificationCount
}: MobileLayoutProps) {
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
            {hasNotifications && (
              <div className="relative">
                <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {notificationCount}
                </div>
              </div>
            )}
            <button
              onClick={() => onNavigate('account')}
              className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center"
            >
              <span className="text-gray-600 dark:text-gray-300">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
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
        <div className="flex items-center justify-around px-2 py-3">
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
                className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
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
                <span className="text-xs font-medium">{item.label}</span>
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
