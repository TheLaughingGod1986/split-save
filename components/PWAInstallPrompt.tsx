'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showMobileAppNotice, setShowMobileAppNotice] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setShowMobileAppNotice(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show mobile app notice after a delay if no install prompt
    const timer = setTimeout(() => {
      if (!showInstallPrompt && !isInstalled) {
        setShowMobileAppNotice(true)
      }
    }, 10000) // 10 seconds delay

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [showInstallPrompt, isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
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
                <h3 className="font-semibold text-lg mb-1">Mobile Apps Coming Soon!</h3>
                <p className="text-green-100 text-sm mb-3">
                  SplitSave will be available on iOS and Android app stores soon. 
                  For now, you can install this web app for a native experience!
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
    </>
  )
}
