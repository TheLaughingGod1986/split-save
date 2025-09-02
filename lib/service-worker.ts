/**
 * Service Worker Registration and Management
 * Handles registration, updates, and communication with the service worker
 */

export interface ServiceWorkerMessage {
  type: string
  data?: any
}

export interface ServiceWorkerRegistration {
  registration: globalThis.ServiceWorkerRegistration | null
  isSupported: boolean
  isRegistered: boolean
  isOnline: boolean
}

class ServiceWorkerManager {
  private registration: globalThis.ServiceWorkerRegistration | null = null
  private isSupported: boolean = false
  private isRegistered: boolean = false
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : true
  private updateAvailable: boolean = false
  private listeners: Map<string, Function[]> = new Map()

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator
    if (typeof window !== 'undefined') {
      this.setupEventListeners()
    }
  }

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported) {
      console.warn('⚠️ Service Worker not supported in this browser')
      return this.getStatus()
    }

    try {
      console.log('🔧 Registering Service Worker...')
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      this.isRegistered = true
      console.log('✅ Service Worker registered successfully')

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        console.log('🔄 Service Worker update found')
        this.handleUpdate()
      })

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker controller changed')
        this.emit('controllerchange')
      })

      return this.getStatus()
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
      throw error
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      const result = await this.registration.unregister()
      this.isRegistered = false
      this.registration = null
      console.log('🗑️ Service Worker unregistered')
      return result
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error)
      return false
    }
  }

  /**
   * Check for updates
   */
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      return false
    }

    try {
      await this.registration.update()
      return this.updateAvailable
    } catch (error) {
      console.error('❌ Failed to check for updates:', error)
      return false
    }
  }

  /**
   * Apply pending update
   */
  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.updateAvailable) {
      return
    }

    try {
      // Send message to service worker to skip waiting
      if (this.registration.waiting) {
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch (error) {
      console.error('❌ Failed to apply update:', error)
    }
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: ServiceWorkerMessage): Promise<any> {
    if (!this.registration || !this.registration.active) {
      throw new Error('Service Worker not active')
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel()
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error))
        } else {
          resolve(event.data)
        }
      }

      this.registration!.active!.postMessage(message, [messageChannel.port2])
    })
  }

  /**
   * Get service worker version
   */
  async getVersion(): Promise<string> {
    try {
      const response = await this.sendMessage({ type: 'GET_VERSION' })
      return response.version || 'unknown'
    } catch (error) {
      console.error('❌ Failed to get version:', error)
      return 'unknown'
    }
  }

  /**
   * Handle service worker update
   */
  private handleUpdate(): void {
    if (!this.registration) return

    const newWorker = this.registration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New content is available
          this.updateAvailable = true
          this.emit('updateavailable')
          console.log('🔄 New version available')
        } else {
          // Content is cached for the first time
          console.log('✅ Content cached for offline use')
          this.emit('cached')
        }
      }
    })
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return
    
    // Online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true
      this.emit('online')
      console.log('🌐 Connection restored')
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.emit('offline')
      console.log('📴 Connection lost')
    })

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.emit('message', event.data)
      })
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  /**
   * Get current status
   */
  getStatus(): ServiceWorkerRegistration {
    return {
      registration: this.registration,
      isSupported: this.isSupported,
      isRegistered: this.isRegistered,
      isOnline: this.isOnline
    }
  }

  /**
   * Check if service worker is ready
   */
  isReady(): boolean {
    return this.isSupported && this.isRegistered && !!this.registration?.active
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    if (!this.registration) return 0

    try {
      const cacheNames = await caches.keys()
      let totalSize = 0

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName)
        const keys = await cache.keys()
        totalSize += keys.length
      }

      return totalSize
    } catch (error) {
      console.error('❌ Failed to get cache size:', error)
      return 0
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('🗑️ All caches cleared')
    } catch (error) {
      console.error('❌ Failed to clear caches:', error)
    }
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager()

// React hook for service worker
export function useServiceWorker() {
  const [status, setStatus] = React.useState<ServiceWorkerRegistration>(
    serviceWorkerManager.getStatus()
  )
  const [updateAvailable, setUpdateAvailable] = React.useState(false)

  React.useEffect(() => {
    // Register service worker on mount
    serviceWorkerManager.register().then(setStatus)

    // Listen for events
    const handleUpdateAvailable = () => setUpdateAvailable(true)
    const handleControllerChange = () => {
      setStatus(serviceWorkerManager.getStatus())
      setUpdateAvailable(false)
    }

    serviceWorkerManager.on('updateavailable', handleUpdateAvailable)
    serviceWorkerManager.on('controllerchange', handleControllerChange)

    return () => {
      serviceWorkerManager.off('updateavailable', handleUpdateAvailable)
      serviceWorkerManager.off('controllerchange', handleControllerChange)
    }
  }, [])

  const applyUpdate = React.useCallback(async () => {
    await serviceWorkerManager.applyUpdate()
  }, [])

  const checkForUpdates = React.useCallback(async () => {
    await serviceWorkerManager.checkForUpdates()
  }, [])

  return {
    ...status,
    updateAvailable,
    applyUpdate,
    checkForUpdates,
    isReady: serviceWorkerManager.isReady()
  }
}

// Utility functions
export const serviceWorkerUtils = {
  /**
   * Check if service worker is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'serviceWorker' in navigator
  },

  /**
   * Get service worker registration
   */
  async getRegistration(): Promise<globalThis.ServiceWorkerRegistration | null> {
    if (!this.isSupported()) return null
    const registration = await navigator.serviceWorker.getRegistration()
    return registration || null
  },

  /**
   * Check if app is running in standalone mode (PWA)
   */
  isStandalone(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  },

  /**
   * Check if app is running in PWA mode
   */
  isPWA(): boolean {
    if (typeof window === 'undefined') return false
    return this.isStandalone() || 
           window.location.protocol === 'https:' && 
           this.isSupported()
  }
}

// Import React for the hook
import React from 'react'
