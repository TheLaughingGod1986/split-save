'use client'

import React, { useState, useEffect } from 'react'
import { serviceWorkerUtils } from '@/lib/service-worker'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if running on mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }

    // Check if already installed
    const checkInstalled = () => {
      const isStandalone = serviceWorkerUtils.isStandalone()
      setIsInstalled(isStandalone)
    }

    checkMobile()
    checkInstalled()

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show install prompt for mobile users after a delay
      if (isMobile && !isInstalled) {
        setTimeout(() => {
          setShowInstallPrompt(true)
        }, 3000) // Show after 3 seconds
      }
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('✅ PWA installed successfully')
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isMobile, isInstalled])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ User accepted PWA installation')
      } else {
        console.log('❌ User dismissed PWA installation')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('❌ Error during PWA installation:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Don't show again for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  // Don't show if already installed, dismissed, or not mobile
  if (isInstalled || !isMobile || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  // Check if user dismissed in this session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Install SplitSave
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add to your home screen for quick access and offline support.
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-purple-600 text-white text-sm font-medium py-2 px-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export function PWAStatus() {
  const [isPWA, setIsPWA] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsPWA(serviceWorkerUtils.isPWA())
    setIsStandalone(serviceWorkerUtils.isStandalone())
  }, [])

  if (!isPWA) return null

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs font-medium text-green-800 dark:text-green-200">
            {isStandalone ? 'PWA Mode' : 'PWA Ready'}
          </span>
        </div>
      </div>
    </div>
  )
}
