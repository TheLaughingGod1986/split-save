import React from 'react'

interface MobileHeaderProps {
  user: any
  isDark: boolean
  toggleDarkMode: () => void
  onSignOut: () => void
  onPWAInstall: () => void
  isOnline: boolean
  hasNotifications: boolean
  notificationCount: number
}

export function MobileHeader({
  user,
  isDark,
  toggleDarkMode,
  onSignOut,
  onPWAInstall,
  isOnline,
  hasNotifications,
  notificationCount
}: MobileHeaderProps) {
  return (
    <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
      {/* Top Bar */}
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

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          {hasNotifications && (
            <button className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-lg">🔔</span>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
          </button>

          {/* PWA Install */}
          <button
            onClick={onPWAInstall}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Install SplitSave App"
          >
            <span className="text-lg">📱</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="text-lg">👤</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Welcome,</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
              {user?.email}
            </span>
          </div>
          
          <button
            onClick={onSignOut}
            className="text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 py-1 rounded"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button className="flex-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            💰 Add Expense
          </button>
          <button className="flex-1 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 px-3 py-2 rounded-lg text-sm font-medium border border-green-200 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors">
            🎯 Add Goal
          </button>
        </div>
      </div>
    </div>
  )
}
