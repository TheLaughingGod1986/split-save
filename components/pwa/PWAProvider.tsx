'use client'

import React, { useEffect } from 'react'
import { serviceWorkerManager } from '@/lib/service-worker'

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    // Register service worker on app load
    const registerServiceWorker = async () => {
      try {
        console.log('🚀 PWA: Registering service worker...')
        await serviceWorkerManager.register()
        console.log('✅ PWA: Service worker registered successfully')
      } catch (error) {
        console.error('❌ PWA: Service worker registration failed:', error)
      }
    }

    // Only register if supported
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker()
    }

    // Listen for service worker events
    const handleUpdateAvailable = () => {
      console.log('🔄 PWA: Update available')
      // You could show a notification to the user here
    }

    const handleControllerChange = () => {
      console.log('🔄 PWA: Controller changed')
      // Reload the page to get the new version
      window.location.reload()
    }

    const handleOnline = () => {
      console.log('🌐 PWA: Back online')
    }

    const handleOffline = () => {
      console.log('📴 PWA: Gone offline')
    }

    // Add event listeners
    serviceWorkerManager.on('updateavailable', handleUpdateAvailable)
    serviceWorkerManager.on('controllerchange', handleControllerChange)
    serviceWorkerManager.on('online', handleOnline)
    serviceWorkerManager.on('offline', handleOffline)

    return () => {
      // Clean up event listeners
      serviceWorkerManager.off('updateavailable', handleUpdateAvailable)
      serviceWorkerManager.off('controllerchange', handleControllerChange)
      serviceWorkerManager.off('online', handleOnline)
      serviceWorkerManager.off('offline', handleOffline)
    }
  }, [])

  return <>{children}</>
}
