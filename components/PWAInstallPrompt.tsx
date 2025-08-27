'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showMobileAppNotice, setShowMobileAppNotice] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('')

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Debug info
    const debug = []
    debug.push(`User Agent: ${navigator.userAgent}`)
    debug.push(`Standalone: ${(navigator as any).standalone}`)
    debug.push(`Display Mode: ${window.matchMedia('(display-mode: standalone)').matches}`)
    debug.push(`Service Worker: ${'serviceWorker' in navigator}`)
    debug.push(`PWA Install: ${'BeforeInstallPromptEvent' in window}`)
    setDebugInfo(debug.join('\n'))

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          (window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return true
      }
      return false
    }

    // Check immediately
    if (checkIfInstalled()) return

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired')
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('PWA: appinstalled event fired')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setShowMobileAppNotice(false)
    }

    // Check for existing prompt
    if ((window as any).deferredPrompt) {
      console.log('PWA: Found existing deferred prompt')
      setDeferredPrompt((window as any).deferredPrompt)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show mobile app notice after a delay if no install prompt
    const timer = setTimeout(() => {
      if (!showInstallPrompt && !isInstalled && !checkIfInstalled()) {
        console.log('PWA: Showing mobile app notice')
        setShowMobileAppNotice(true)
      }
    }, 5000) // Reduced to 5 seconds delay

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [showInstallPrompt, isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('PWA: No deferred prompt available')
      return
    }

    try {
      console.log('PWA: Prompting user to install')
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      console.log('PWA: User choice:', outcome)
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
        console.log('PWA: Installation accepted')
      } else {
        console.log('PWA: Installation declined')
      }
    } catch (error) {
      console.error('PWA: Error during install prompt:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    setShowMobileAppNotice(false)
  }

  if (isInstalled) return null

  return (
    <>
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg border border-purple-300">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📱</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Install SplitSave App</h3>
                <p className="text-purple-100 text-sm mb-3">
                  Get the full app experience with offline access and quick shortcuts!
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleInstallClick}
                    className="bg-white text-purple-600 px-4 py-2 rounded-md font-medium hover:bg-purple-50 transition-colors"
                  >
                    Install App
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-purple-200 hover:text-white transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-purple-200 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile App Coming Soon Notice */}
      {showMobileAppNotice && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg shadow-lg border border-green-300">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">🚀</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Install SplitSave App</h3>
                <p className="text-green-100 text-sm mb-3">
                  Get the full app experience with offline access and quick shortcuts!
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowInstallPrompt(true)}
                    className="bg-white text-green-600 px-4 py-2 rounded-md font-medium hover:bg-green-50 transition-colors"
                  >
                    Install Web App
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-green-200 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-green-200 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Install Instructions */}
      {!showInstallPrompt && !showMobileAppNotice && !isInstalled && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-lg border border-blue-300">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">📱</div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Install SplitSave</h3>
                <p className="text-blue-100 text-sm mb-3">
                  Tap the share button in your browser and select "Add to Home Screen"
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleDismiss}
                    className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-blue-200 hover:text-white text-xl"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 z-50">
          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg border border-gray-600 max-w-sm">
            <h3 className="font-semibold text-lg mb-2">PWA Debug Info</h3>
            <pre className="text-xs text-gray-300 whitespace-pre-wrap">{debugInfo}</pre>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => {
                  if ((window as any).deferredPrompt) {
                    console.log('Manual trigger of deferred prompt')
                    ;(window as any).deferredPrompt.prompt()
                  } else {
                    console.log('No deferred prompt available')
                  }
                }}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Test Install Prompt
              </button>
              <button
                onClick={() => setDebugInfo('')}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors ml-2"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
