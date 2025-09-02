'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

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
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true

    if (isInstalled) {
      return
    }

    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsVisible(false)
      setDeferredPrompt(null)
      toast.success('🎉 SplitSave installed successfully!')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Show prompt after a delay if no beforeinstallprompt event
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setIsVisible(true)
      }
    }, 10000) // 10 seconds delay

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      toast.success('📱 To install SplitSave, use your browser\'s "Add to Home Screen" option')
      return
    }

    setIsInstalling(true)

    try {
      // Show the install prompt
      await deferredPrompt.prompt()

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        toast.success('🎉 SplitSave installed successfully!')
      } else {
        console.log('User dismissed the install prompt')
        toast.success('Installation cancelled')
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null)
      setIsVisible(false)
    } catch (error) {
      console.error('Error during installation:', error)
      toast.error('Installation failed. Please try again.')
    } finally {
      setIsInstalling(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setHasBeenDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleManualInstall = () => {
    // Show manual installation instructions
    toast.success('📱 Use your browser\'s menu to "Add to Home Screen" or "Install App"')
  }

  if (!isVisible || hasBeenDismissed) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">📱</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Install App
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Better experience
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
          >
            <span className="text-lg">×</span>
          </button>
        </div>

        {/* Simple Action Button */}
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isInstalling ? 'Installing...' : 'Install'}
        </button>

        {/* Subtle Dismiss */}
        <div className="text-center mt-2">
          <button
            onClick={handleDismiss}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
