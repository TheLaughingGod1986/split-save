'use client'

import React from 'react'
import { useMobilePWA } from './MobilePWA'

interface MobileNavigationProps {
  currentView: string
  onViewChange: (view: string) => void
}

export function MobileNavigation({ currentView, onViewChange }: MobileNavigationProps) {
  const { isMobile, isStandalone } = useMobilePWA()

  if (!isMobile) return null

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: '🏠' },
    { id: 'expenses', label: 'Money', icon: '💰' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'partnerships', label: 'Partners', icon: '🤝' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'account', label: 'Account', icon: '👤' }
  ]

  return (
    <>
      {/* Mobile Bottom Navigation Only - No hamburger menu */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg ${isStandalone ? 'pb-safe' : ''}`}>
        <div className="flex items-center justify-around py-3">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors flex-1 min-w-0 ${
                currentView === item.id
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
            </button>
          ))}
        </div>
        
        {/* PWA Status Indicator in bottom bar */}
        {isStandalone && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" title="PWA Mode" />
          </div>
        )}
      </div>

      {/* Add padding only for bottom navigation */}
      <div className="h-20" /> {/* Bottom navigation height */}
    </>
  )
}
