import React, { useState, useEffect } from 'react'

interface MobileNavigationProps {
  currentView: string
  onNavigate: (view: string) => void
  isOnline: boolean
  hasNotifications: boolean
  notificationCount: number
}

interface NavigationItem {
  id: string
  label: string
  icon: string
  description: string
  badge?: number
}

export function MobileNavigation({
  currentView,
  onNavigate,
  isOnline,
  hasNotifications,
  notificationCount
}: MobileNavigationProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)

  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '🏠',
      description: 'Dashboard & Summary'
    },
    {
      id: 'money',
      label: 'Money',
      icon: '💰',
      description: 'Expenses & Contributions'
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: '🎯',
      description: 'Savings & Achievements'
    },
    {
      id: 'partner',
      label: 'Partner',
      icon: '🤝',
      description: 'Collaboration Hub'
    },
    {
      id: 'account',
      label: 'Account',
      icon: '👤',
      description: 'Profile & Settings'
    }
  ]

  // Handle scroll-based visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY
      const scrollingUp = currentScrollY < lastScrollY

      // Hide navigation when scrolling down, show when scrolling up
      if (scrollingDown && currentScrollY > 100) {
        setIsVisible(false)
      } else if (scrollingUp || currentScrollY < 100) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
      setIsScrolling(true)

      // Reset scrolling state after a delay
      setTimeout(() => setIsScrolling(false), 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Handle touch gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    const startY = touch.clientY

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      const currentY = touch.clientY
      const deltaY = startY - currentY

      // Swipe up to show navigation, swipe down to hide
      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      }
    }

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }

    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)
  }

  return (
    <>
      {/* Mobile Navigation Bar */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        onTouchStart={handleTouchStart}
      >
        {/* Navigation Container */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl">
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
            {navigationItems.map((item) => {
              const isActive = currentView === item.id
              const hasBadge = item.id === 'partner-collaboration' && hasNotifications

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1 transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {/* Icon with Badge */}
                  <div className="relative mb-1">
                    <span className="text-2xl">{item.icon}</span>
                    {hasBadge && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-xs font-medium truncate w-full text-center ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}>
                    {item.label}
                  </span>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Home Indicator (for devices with home indicator) */}
          <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-4 mb-2 opacity-50"></div>
        </div>
      </div>

      {/* Floating Action Button for Quick Actions */}
      <div className={`fixed bottom-20 right-4 z-40 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}>
        <button
          onClick={() => onNavigate('expenses')}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110 flex items-center justify-center"
        >
          <span className="text-2xl">+</span>
        </button>
      </div>

      {/* Pull to Show Navigation Indicator */}
      <div className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-300 ${
        !isVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}>
        <div className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-3 py-1 rounded-t-lg text-xs font-medium">
          ↑ Pull up to show navigation
        </div>
      </div>

      {/* Bottom Safe Area Spacer */}
      <div className="h-24"></div>
    </>
  )
}

// Mobile-specific utility components
export function MobileCard({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  className = '',
  disabled = false
}: {
  children: React.ReactNode
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'danger'
  size?: 'small' | 'medium' | 'large'
  className?: string
  disabled?: boolean
}) {
  const baseClasses = 'w-full font-medium rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
  }

  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}

export function MobileInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  className = ''
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  className?: string
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
      />
    </div>
  )
}

export function MobileSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  className = ''
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string, label: string }[]
  required?: boolean
  className?: string
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
