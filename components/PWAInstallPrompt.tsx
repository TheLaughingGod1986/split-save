'use client'

import { useState, useEffect } from 'react'

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

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
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
    }

    // Check for existing prompt
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallPrompt(false)
      }
    } catch (error) {
      console.error('PWA: Error during install prompt:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
  }

  if (isInstalled) return null

  return (
    <>
      {/* Single PWA Install Prompt */}
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
    </>
  )
}
