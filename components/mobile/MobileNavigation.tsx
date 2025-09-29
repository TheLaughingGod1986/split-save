'use client'

import { useState } from 'react'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { 
  HomeIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  CogIcon,
  UserIcon,
  BellIcon
} from '@heroicons/react/24/outline'

interface MobileNavigationProps {
  currentPage?: string
  onNavigate?: (page: string) => void
}

export function MobileNavigation({ currentPage = 'dashboard', onNavigate }: MobileNavigationProps) {
  const { isMobile } = useMobileDetection()
  const [isPWA, setIsPWA] = useState(false)

  // Detect PWA mode
  useState(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsPWA(isStandaloneMatch || isIOSStandalone)
    }
  })

  if (!isMobile) return null

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'expenses', label: 'Expenses', icon: CurrencyDollarIcon },
    { id: 'goals', label: 'Goals', icon: ChartBarIcon },
    { id: 'notifications', label: 'Alerts', icon: BellIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ]

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50 ${isPWA ? 'pb-safe' : ''}`}>
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}