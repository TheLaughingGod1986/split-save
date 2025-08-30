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
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-fade-in-up">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Install SplitSave
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get the full mobile experience
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Access from home screen</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Works offline</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Faster loading</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700 dark:text-gray-300">Native app feel</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isInstalling ? '🔄 Installing...' : '📱 Install App'}
          </button>

          <button
            onClick={handleManualInstall}
            className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            How?
          </button>
        </div>

        {/* Dismiss Link */}
        <div className="text-center mt-4">
          <button
            onClick={handleDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
