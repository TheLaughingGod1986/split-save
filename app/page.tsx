'use client'

import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { LandingPage } from '@/components/LandingPage'
import { MobileLandingPage } from '@/components/mobile/MobileLandingPage'
import { StructuredData, structuredDataSchemas } from '@/components/ui/StructuredData'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useEffect, useRef, useState } from 'react'
import { analytics } from '@/lib/analytics'

export default function Home() {
  const { user, loading } = useAuth()
  const analyticsTracked = useRef(false)
  const [isStandalonePWA, setIsStandalonePWA] = useState(false)
  const { isMobile, isSmallScreen, isClient } = useMobileDetection()

  // Detect PWA mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const detectStandalone = () => {
        const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches
        const isIOSStandalone = (window.navigator as any).standalone === true
        const cameFromAndroidApp = typeof document !== 'undefined' && document.referrer.startsWith('android-app://')
        return isStandaloneMatch || isIOSStandalone || cameFromAndroidApp
      }

      setIsStandalonePWA(detectStandalone())

      const mediaQuery = window.matchMedia('(display-mode: standalone)')
      const handleDisplayModeChange = (event: MediaQueryListEvent) => {
        setIsStandalonePWA(event.matches || (window.navigator as any).standalone === true)
      }

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleDisplayModeChange)
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handleDisplayModeChange)
      }

      return () => {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleDisplayModeChange)
        } else if (typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(handleDisplayModeChange)
        }
      }
    }
  }, [])

  // Analytics tracking
  useEffect(() => {
    if (!loading && !analyticsTracked.current) {
      analyticsTracked.current = true
      
      if (user) {
        analytics.session.started()
        analytics.conversion.landingPageView('direct', {
          campaign: 'returning_user',
          source: 'direct'
        })
      } else {
        analytics.conversion.landingPageView('direct', {
          campaign: 'new_visitor',
          source: 'direct'
        })
      }
    }
  }, [loading, user])

  // Show loading only briefly
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Landing page for non-authenticated users
  if (!user) {
    return (
      <>
        <StructuredData type="website" data={structuredDataSchemas.website} />
        <StructuredData type="organization" data={structuredDataSchemas.organization} />
        <StructuredData type="webapp" data={structuredDataSchemas.webapp} />
        <StructuredData type="financialService" data={structuredDataSchemas.financialService} />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="px-4 pt-8 pb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                SplitSave
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                Smart financial management for couples
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Split expenses fairly, track savings goals together, and build financial harmony with your partner.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
                Get Started
              </button>
              <button className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Fair Expense Splitting
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Split bills proportionally based on income or equally - whatever works for your relationship.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Shared Goals
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Set and track savings goals together with real-time progress updates and celebrations.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Mobile First
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Works perfectly on mobile, desktop, and as a PWA. Install it like a native app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Main app for authenticated users
  return (
    <>
      <SplitsaveApp />
    </>
  )
}