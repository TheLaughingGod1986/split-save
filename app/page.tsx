'use client'

import { useAuth } from '@/components/auth/AuthProvider'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { LandingPage } from '@/components/LandingPage'
import { StructuredData, structuredDataSchemas } from '@/components/ui/StructuredData'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useCallback, useEffect, useRef, useState } from 'react'
import { analytics } from '@/lib/analytics'
import { MobileLandingPage } from '@/components/mobile/MobileLandingPage'
import { MobilePlainMarkup } from '@/components/mobile/MobilePlainMarkup'

export default function Home() {
  const { user, loading } = useAuth()
  const analyticsTracked = useRef(false)
  const [isStandalonePWA, setIsStandalonePWA] = useState(false)
  const [hasAuthToken, setHasAuthToken] = useState<boolean | null>(null)
  const { isMobile, isSmallScreen, isClient } = useMobileDetection()

  const checkStoredAuthToken = useCallback(() => {
    if (typeof window === 'undefined') {
      return false
    }

    try {
      const localToken = window.localStorage.getItem('splitsave-auth-token')
      const sessionToken = window.sessionStorage.getItem('splitsave-auth-token')
      const tokenExists = Boolean(localToken || sessionToken)

      setHasAuthToken(tokenExists)
      return tokenExists
    } catch (error) {
      console.warn('⚠️ Auth token storage check failed', error)
      setHasAuthToken(false)
      return false
    }
  }, [])

  // Quickly detect if the visitor has no stored session so we can show the landing
  useEffect(() => {
    checkStoredAuthToken()

    if (typeof window === 'undefined') {
      return
    }

    const handleStorageChange = () => {
      checkStoredAuthToken()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [checkStoredAuthToken])

  // Keep token state in sync with auth changes
  useEffect(() => {
    if (user) {
      setHasAuthToken(true)
      return
    }

    if (!loading) {
      checkStoredAuthToken()
    }
  }, [user, loading, checkStoredAuthToken])

  // DEBUG: Log auth state changes
  useEffect(() => {
    console.log('🏠 Home: Auth state changed', { 
      user: user ? { id: user.id, email: user.email } : null, 
      loading,
      hasUser: !!user 
    })
  }, [user, loading])

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

  // DEBUG: Add mobile-specific loading timeout
  useEffect(() => {
    if (loading && (isMobile || isSmallScreen)) {
      console.log('🔍 Mobile loading detected, setting timeout')
      const timeout = setTimeout(() => {
        console.log('⏰ Mobile loading timeout - forcing render')
        // Don't force loading to false here, let AuthProvider handle it
      }, 3000)
      return () => clearTimeout(timeout)
    }
  }, [loading, isMobile, isSmallScreen])

  const landingContent = (
    <>
      <StructuredData type="website" data={structuredDataSchemas.website} />
      <StructuredData type="organization" data={structuredDataSchemas.organization} />
      <StructuredData type="webapp" data={structuredDataSchemas.webapp} />
      <StructuredData type="financialService" data={structuredDataSchemas.financialService} />
      <LandingPage />
    </>
  )

  if (loading) {
    const shouldBypassLoading = isClient && hasAuthToken === false

    if (shouldBypassLoading) {
      console.log('🚀 No stored session detected - showing marketing site while auth resolves')
      return landingContent
    }

    console.log('⏳ Showing loading screen', { loading, user: !!user, isMobile, isSmallScreen, isClient })
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          <div className="mt-2 text-xs text-gray-500">
            Auth Loading: {loading ? 'true' : 'false'}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Mobile: {isMobile ? 'true' : 'false'} | Client: {isClient ? 'true' : 'false'}
          </div>
          <div className="mt-4 text-xs text-gray-400">
            If this takes too long, <button 
              onClick={() => window.location.reload()} 
              className="text-purple-600 hover:text-purple-700 underline"
            >
              refresh the page
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    if (isClient && isMobile && !isStandalonePWA) {
      console.log('📱 Home: Showing tailored mobile landing experience')

      return (
        <>
          <StructuredData type="website" data={structuredDataSchemas.website} />
          <StructuredData type="organization" data={structuredDataSchemas.organization} />
          <StructuredData type="webapp" data={structuredDataSchemas.webapp} />
          <StructuredData type="financialService" data={structuredDataSchemas.financialService} />
          <MobileLandingPage />
          <noscript>
            <MobilePlainMarkup />
          </noscript>
        </>
      )
    }

    console.log('🏠 Home: Showing landing page', {
      hasUser: false
    })
    return landingContent
  }

  // For mobile devices, add additional safety check
  if (isClient && (isMobile || isSmallScreen)) {
    console.log('🔍 Mobile device detected, rendering SplitsaveApp', { isMobile, isSmallScreen, hasUser: !!user })
  }

  console.log('🏠 Home: Rendering SplitsaveApp', { 
    hasUser: !!user, 
    userEmail: user?.email,
    userId: user?.id,
    loading,
    isMobile,
    isSmallScreen,
    isClient
  })

  // Safety fallback - if we get here but something is wrong, show debug info
  if (!isClient) {
    console.log('🔄 Not client-side yet, showing minimal fallback')
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Initializing...</p>
        </div>
      </div>
    )
  }

  // TEMPORARY: Add mobile website test
  if (isMobile && !isStandalonePWA) {
    console.log('📱 Mobile website detected (not PWA)', { isMobile, isStandalonePWA })
    return (
      <>
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-blue-100/60 bg-white/90 p-4 text-left shadow-lg backdrop-blur-sm dark:border-blue-800/50 dark:bg-gray-900/85">
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">Mobile website</p>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-300">
              You're viewing SplitSave in the browser. Add it to your home screen for the full PWA experience.
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div>
                <dt className="font-medium text-gray-700 dark:text-gray-200">Mobile</dt>
                <dd>{isMobile ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700 dark:text-gray-200">Standalone</dt>
                <dd>{isStandalonePWA ? 'Yes' : 'No'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700 dark:text-gray-200">User</dt>
                <dd>{user ? 'Logged in' : 'Not logged in'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-700 dark:text-gray-200">Client ready</dt>
                <dd>{isClient ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        </div>

        <SplitsaveApp />
      </>
    )
  }

  return (
    <>
      <SplitsaveApp />
    </>
  )
}
