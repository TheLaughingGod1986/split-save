'use client'

import { useAuth } from '@/components/auth/SmartAuthProvider'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { LandingPage } from '@/components/LandingPage'
import { StructuredData, structuredDataSchemas } from '@/components/ui/StructuredData'
import { MobileLoadingFallback } from '@/components/mobile/MobileLoadingFallback'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useEffect, useRef, useState } from 'react'
import { analytics } from '@/lib/analytics'

export default function Home() {
  const { user, loading } = useAuth()
  const analyticsTracked = useRef(false)
  const [showMobileFallback, setShowMobileFallback] = useState(false)
  const [forceShowLanding, setForceShowLanding] = useState(false)
  const [emergencyFallback, setEmergencyFallback] = useState(false)
  const { isMobile, isSmallScreen, isClient } = useMobileDetection()

  useEffect(() => {
    if (!loading && !analyticsTracked.current) {
      analyticsTracked.current = true
      
      // Hide iPhone fallback when React loads successfully AND we have content to show
      if (typeof window !== 'undefined' && /iPhone/.test(navigator.userAgent)) {
        const fallback = document.getElementById('iphone-fallback')
        const minimalTest = document.getElementById('minimal-test')
        if (fallback) {
          console.log('🍎 React loaded successfully, hiding iPhone fallback')
          fallback.style.display = 'none'
        }
        if (minimalTest) {
          console.log('🍎 React loaded successfully, hiding minimal test')
          minimalTest.style.display = 'none'
        }
      }
      
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

  // Force show landing page after shorter time if still loading (especially on mobile)
  useEffect(() => {
    if (loading) {
      // Even shorter timeout for iPhone Safari
      const isIPhone = isClient && /iPhone/.test(navigator.userAgent)
      const timeoutDuration = isIPhone ? 2000 : (isClient && (isMobile || isSmallScreen) ? 3000 : 5000)
      
      console.log('⏰ Setting page timeout', { 
        isIPhone, 
        isMobile, 
        isSmallScreen, 
        timeoutDuration,
        userAgent: isClient ? navigator.userAgent.substring(0, 50) : 'N/A'
      })
      
      const timeout = setTimeout(() => {
        console.log('⚠️ Page timeout: forcing landing page display', { isMobile, isSmallScreen, isIPhone, timeoutDuration })
        setForceShowLanding(true)
      }, timeoutDuration)
      
      return () => clearTimeout(timeout)
    } else {
      setForceShowLanding(false)
    }
  }, [loading, isClient, isMobile, isSmallScreen])

  // Emergency fallback for mobile devices - if nothing else works, show landing page
  useEffect(() => {
    if (isClient && (isMobile || isSmallScreen)) {
      const isIPhone = /iPhone/.test(navigator.userAgent)
      const emergencyTimeoutDuration = isIPhone ? 4000 : 6000 // Even shorter for iPhone
      
      console.log('🚨 Setting emergency fallback timeout', { 
        isIPhone, 
        emergencyTimeoutDuration,
        userAgent: navigator.userAgent.substring(0, 50)
      })
      
      const emergencyTimeout = setTimeout(() => {
        console.log('🚨 Emergency fallback: forcing landing page for mobile', { isIPhone })
        setEmergencyFallback(true)
        setForceShowLanding(true)
      }, emergencyTimeoutDuration)
      
      return () => clearTimeout(emergencyTimeout)
    }
  }, [isClient, isMobile, isSmallScreen])

  // Additional mobile-specific timeout - if we're on mobile and still loading after 4 seconds, force show landing
  useEffect(() => {
    if (isClient && (isMobile || isSmallScreen) && loading) {
      const isIPhone = /iPhone/.test(navigator.userAgent)
      const mobileTimeoutDuration = isIPhone ? 2500 : 4000 // Even shorter for iPhone
      
      console.log('📱 Setting mobile timeout', { 
        isIPhone, 
        mobileTimeoutDuration,
        userAgent: navigator.userAgent.substring(0, 50)
      })
      
      const mobileTimeout = setTimeout(() => {
        console.log('📱 Mobile timeout: forcing landing page', { isIPhone })
        setForceShowLanding(true)
      }, mobileTimeoutDuration)
      
      return () => clearTimeout(mobileTimeout)
    }
  }, [isClient, isMobile, isSmallScreen, loading])

  // iPhone-specific emergency fallback - if we detect iPhone and still loading, show basic HTML
  if (isClient && /iPhone/.test(navigator.userAgent) && loading) {
    console.log('🍎 iPhone emergency fallback: showing basic HTML')
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '1rem' 
          }}>
            SplitSave
          </h1>
          <p style={{ 
            fontSize: '1.125rem', 
            color: '#6b7280', 
            marginBottom: '2rem' 
          }}>
            Smart financial management for couples
          </p>
          <div style={{ 
            padding: '1rem', 
            backgroundColor: '#fef3c7', 
            border: '1px solid #f59e0b', 
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <p style={{ color: '#92400e', margin: 0 }}>
              🍎 iPhone Safari detected - Loading optimized version...
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  // If loading for too long, force show landing page
  if (loading && !forceShowLanding) {
    // For mobile devices, show landing page immediately instead of loading fallback
    if (isClient && (isMobile || isSmallScreen)) {
      console.log('📱 Mobile device detected during loading, showing landing page immediately')
      return (
        <>
          <StructuredData type="website" data={structuredDataSchemas.website} />
          <StructuredData type="organization" data={structuredDataSchemas.organization} />
          <StructuredData type="webapp" data={structuredDataSchemas.webapp} />
          <StructuredData type="financialService" data={structuredDataSchemas.financialService} />
          <LandingPage />
          {/* Debug overlay for mobile */}
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>Small: {isSmallScreen ? 'Yes' : 'No'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>User: {user ? 'Yes' : 'No'}</div>
            <div>Force: {forceShowLanding ? 'Yes' : 'No'}</div>
            <div>Emergency: {emergencyFallback ? 'Yes' : 'No'}</div>
          </div>
        </>
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

  // Show landing page if no user or if forced due to loading timeout
  if (!user || forceShowLanding) {
    return (
      <>
        <StructuredData type="website" data={structuredDataSchemas.website} />
        <StructuredData type="organization" data={structuredDataSchemas.organization} />
        <StructuredData type="webapp" data={structuredDataSchemas.webapp} />
        <StructuredData type="financialService" data={structuredDataSchemas.financialService} />
        <LandingPage />
        {/* Debug overlay for mobile */}
        {isClient && (isMobile || isSmallScreen) && (
          <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>Small: {isSmallScreen ? 'Yes' : 'No'}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>User: {user ? 'Yes' : 'No'}</div>
            <div>Force: {forceShowLanding ? 'Yes' : 'No'}</div>
            <div>Emergency: {emergencyFallback ? 'Yes' : 'No'}</div>
          </div>
        )}
      </>
    )
  }

  // For mobile devices, add additional safety check
  if (isClient && (isMobile || isSmallScreen)) {
    console.log('🔍 Mobile device detected, rendering SplitsaveApp', { isMobile, isSmallScreen, hasUser: !!user })
  }

  return (
    <>
      <SplitsaveApp />
      {/* Debug overlay for mobile */}
      {isClient && (isMobile || isSmallScreen) && (
        <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
          <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
          <div>Small: {isSmallScreen ? 'Yes' : 'No'}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>User: {user ? 'Yes' : 'No'}</div>
          <div>Force: {forceShowLanding ? 'Yes' : 'No'}</div>
          <div>Emergency: {emergencyFallback ? 'Yes' : 'No'}</div>
        </div>
      )}
    </>
  )
}
