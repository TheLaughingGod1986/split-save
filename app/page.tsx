'use client'

import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { LandingPage } from '@/components/LandingPage'
import { StructuredData, structuredDataSchemas } from '@/components/ui/StructuredData'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useEffect, useRef, useState } from 'react'
import { trackPageView } from '@/lib/analytics'

export default function Home() {
  const { user, loading: authLoading } = useAuth()
  const { isMobile, isClient } = useMobileDetection()
  const [mounted, setMounted] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const loadingScreenTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
    trackPageView('home', !!user)

    // Set a timeout to hide the loading screen even if auth takes too long
    loadingScreenTimeoutRef.current = setTimeout(() => {
      setShowLoadingScreen(false)
    }, 3000) // 3 seconds timeout

    return () => {
      if (loadingScreenTimeoutRef.current) {
        clearTimeout(loadingScreenTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!authLoading && mounted) {
      // Hide loading screen once authentication is resolved and component is mounted
      if (loadingScreenTimeoutRef.current) {
        clearTimeout(loadingScreenTimeoutRef.current)
      }
      setShowLoadingScreen(false)
    }
  }, [authLoading, mounted])

  if (!mounted || showLoadingScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-pulse">
            Loading SplitSave...
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Preparing your financial harmony.
          </p>
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
        
        {/* Mobile Landing Page */}
        <div className="block md:hidden">
          <div style={{
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {/* Mobile Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '30px',
              padding: '20px 0'
            }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#1e293b',
                marginBottom: '10px'
              }}>
                SplitSave
              </h1>
              <p style={{
                fontSize: '1.2rem',
                color: '#64748b',
                marginBottom: '20px'
              }}>
                Smart financial management for couples
              </p>
              <p style={{
                fontSize: '1rem',
                color: '#64748b',
                maxWidth: '600px',
                margin: '0 auto',
                lineHeight: '1.6'
              }}>
                Split expenses fairly, track savings goals together, and build financial harmony with your partner.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
              marginBottom: '40px',
              maxWidth: '400px',
              margin: '0 auto 40px auto'
            }}>
              <button style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Get Started
              </button>
              <button style={{
                backgroundColor: 'transparent',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                padding: '15px 30px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                Learn More
              </button>
            </div>

            {/* Features */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '20px',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💰</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '10px'
                }}>
                  Fair Expense Splitting
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.5'
                }}>
                  Split bills proportionally based on income or equally - whatever works for your relationship.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '10px'
                }}>
                  Shared Goals
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.5'
                }}>
                  Set and track savings goals together with real-time progress updates and celebrations.
                </p>
              </div>

              <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📱</div>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '10px'
                }}>
                  Mobile First
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.5'
                }}>
                  Works perfectly on mobile, desktop, and as a PWA. Install it like a native app.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: '50px',
              padding: '20px',
              color: '#64748b',
              fontSize: '0.9rem'
            }}>
              <p>© 2024 SplitSave. Built with ❤️ for couples everywhere.</p>
            </div>
          </div>
        </div>

        {/* Desktop Landing Page */}
        <div className="hidden md:block">
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