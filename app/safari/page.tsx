'use client'

import { SafariAuthProvider, useAuth } from '@/components/SafariAuthProvider'
import { SafariErrorBoundary } from '@/components/SafariErrorBoundary'
import { LoginForm } from '@/components/LoginForm'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { LandingPage } from '@/components/LandingPage'
import { StructuredData, structuredDataSchemas } from '@/components/StructuredData'
import { useEffect, useRef, useState } from 'react'
import { analytics } from '@/lib/analytics'

function SafariHomeContent() {
  const { user, loading } = useAuth()
  const analyticsTracked = useRef(false)
  const [showSafariFallback, setShowSafariFallback] = useState(false)

  useEffect(() => {
    if (!loading && !analyticsTracked.current) {
      analyticsTracked.current = true
      
      if (user) {
        analytics.session.started()
        analytics.conversion.landingPageView('direct', {
          campaign: 'returning_user',
          source: 'safari'
        })
      } else {
        analytics.conversion.landingPageView('direct', {
          campaign: 'new_visitor',
          source: 'safari'
        })
      }
    }
  }, [loading, user])

  // Safari-specific loading with longer timeout
  useEffect(() => {
    const safariTimeout = setTimeout(() => {
      setShowSafariFallback(true)
    }, 10000) // 10 second timeout for Safari

    return () => clearTimeout(safariTimeout)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
          {/* Safari-specific loading animation */}
          <div className="mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          </div>

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading SplitSave...
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Optimizing for Safari
          </p>
          
          {showSafariFallback && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Safari is taking longer to load. This might be due to private browsing or security settings.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          )}
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Safari Loading: {loading ? 'true' : 'false'}
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

export default function SafariHome() {
  return (
    <SafariErrorBoundary>
      <SafariAuthProvider>
        <SafariHomeContent />
      </SafariAuthProvider>
    </SafariErrorBoundary>
  )
}
