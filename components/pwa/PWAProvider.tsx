'use client'

import React, { useEffect } from 'react'
import { serviceWorkerManager } from '@/lib/service-worker'

interface PWAProviderProps {
  children: React.ReactNode
}

export function PWAProvider({ children }: PWAProviderProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    let isMounted = true

    // Register service worker on app load or once the window has finished loading.
    const registerServiceWorker = async () => {
      if (!isMounted) return

      try {
        console.log('🚀 PWA: Registering service worker...')
        await serviceWorkerManager.register()
        console.log('✅ PWA: Service worker registered successfully')
      } catch (error) {
        console.error('❌ PWA: Service worker registration failed:', error)
      }
    }

    if (document.readyState === 'complete') {
      registerServiceWorker()
    } else {
      window.addEventListener('load', registerServiceWorker, { once: true })
    }

    // Listen for service worker events
    const handleUpdateAvailable = () => {
      console.log('🔄 PWA: Update available')
      // You could show a notification to the user here
    }

    const handleControllerChange = () => {
      console.log('🔄 PWA: Controller changed - new service worker active')
      // Previously we forced a full reload here which caused mobile browsers to briefly
      // render the page and then flash to a white screen while the reload occurred.
      // Let the app continue running – the new service worker will serve updated assets
      // without interrupting the current session.
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
      isMounted = false
      window.removeEventListener('load', registerServiceWorker)
      // Clean up event listeners
      serviceWorkerManager.off('updateavailable', handleUpdateAvailable)
      serviceWorkerManager.off('controllerchange', handleControllerChange)
      serviceWorkerManager.off('online', handleOnline)
      serviceWorkerManager.off('offline', handleOffline)
    }
  }, [])

  return <>{children}</>
}
