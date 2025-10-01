'use client'

import { useState } from 'react'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { MobileNavigation } from './MobileNavigation'
import { useAuth } from '@/components/auth/SimpleAuthProvider'

interface MobileAppLayoutProps {
  children: React.ReactNode
}

export function MobileAppLayout({ children }: MobileAppLayoutProps) {
  const { isMobile } = useMobileDetection()
  const { user, signOut } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isPWA, setIsPWA] = useState(false)

  // Detect PWA mode
  useState(() => {
    if (typeof window !== 'undefined') {
      const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches
      const isIOSStandalone = (window.navigator as any).standalone === true
      setIsPWA(isStandaloneMatch || isIOSStandalone)
    }
  })

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className={`bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 ${isPWA ? 'pt-safe' : ''}`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                SplitSave
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isPWA ? 'PWA' : 'Mobile'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`pb-20 ${isPWA ? 'pb-safe' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
      />
    </div>
  )
}
