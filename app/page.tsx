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
        <div className="mobile-landing-container block md:hidden">
          <MobileLandingPage />
        </div>
        <div className="desktop-landing-container hidden md:block">
          <LandingPage />
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