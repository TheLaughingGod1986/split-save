'use client'

import { useAuth } from '@/components/AuthProvider'
import { LoginForm } from '@/components/LoginForm'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { LandingPage } from '@/components/LandingPage'
import { ClientOnly } from '@/components/ClientOnly'
import { StructuredData, structuredDataSchemas } from '@/components/StructuredData'
import { MobileLoadingFallback } from '@/components/MobileLoadingFallback'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useEffect, useRef, useState } from 'react'
import { analytics } from '@/lib/analytics'

export default function Home() {
  const { user, loading } = useAuth()
  const analyticsTracked = useRef(false)
  const [showMobileFallback, setShowMobileFallback] = useState(false)
  const [isSafari, setIsSafari] = useState(false)
  const { isMobile, isSmallScreen, isClient } = useMobileDetection()

  // Detect Safari and redirect to Safari-specific page
  useEffect(() => {
    if (isClient) {
      const userAgent = navigator.userAgent
      const isSafariBrowser = /safari/i.test(userAgent) && !/chrome/i.test(userAgent)
      setIsSafari(isSafariBrowser)
      
      if (isSafariBrowser) {
        console.log('🍎 Detected Safari, redirecting to Safari-specific page')
        window.location.href = '/safari'
        return
      }
    }
  }, [isClient])

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

  if (loading) {
    // Use mobile fallback for mobile devices (only after client-side detection)
    if (isClient && (isMobile || isSmallScreen)) {
      return (
        <MobileLoadingFallback 
          onTimeout={() => setShowMobileFallback(true)}
          timeoutMs={6000}
        />
      )
    }
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
          <div className="mt-2 text-xs text-gray-500">
            Auth Loading: {loading ? 'true' : 'false'}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <StructuredData type="website" data={structuredDataSchemas.website} />
        <StructuredData type="organization" data={structuredDataSchemas.organization} />
        <StructuredData type="webapp" data={structuredDataSchemas.webapp} />
        <StructuredData type="financialService" data={structuredDataSchemas.financialService} />
        <LandingPage />
      </>
    )
  }

  return <SplitsaveApp />
}
