'use client'

import React from 'react'

/**
 * Performance optimization utilities for SplitSave
 * Monitors and optimizes app performance
 */

export interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage: number
  bundleSize: number
  cacheHitRate: number
  apiResponseTime: number
}

export interface PerformanceConfig {
  enableMonitoring: boolean
  enableCaching: boolean
  enableLazyLoading: boolean
  enableCodeSplitting: boolean
  enableImageOptimization: boolean
  enableBundleAnalysis: boolean
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer
  private config: PerformanceConfig
  private metrics: PerformanceMetrics
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    this.config = {
      enableMonitoring: true,
      enableCaching: true,
      enableLazyLoading: true,
      enableCodeSplitting: true,
      enableImageOptimization: true,
      enableBundleAnalysis: true
    }

    this.metrics = {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      bundleSize: 0,
      cacheHitRate: 0,
      apiResponseTime: 0
    }

    this.initialize()
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer()
    }
    return PerformanceOptimizer.instance
  }

  private initialize() {
    if (typeof window === 'undefined') return

    if (this.config.enableMonitoring) {
      this.setupPerformanceMonitoring()
    }

    if (this.config.enableCaching) {
      this.setupCaching()
    }

    if (this.config.enableLazyLoading) {
      this.setupLazyLoading()
    }
  }

  private setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      this.measureLoadTime()
      this.measureMemoryUsage()
    })

    // Monitor navigation timing
    if ('performance' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.metrics.loadTime = entry.duration
          }
        })
      })
      
      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.set('navigation', navigationObserver)
    }

    // Monitor resource loading
    if ('performance' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.entryType === 'resource') {
            this.measureResourcePerformance(entry as PerformanceResourceTiming)
          }
        })
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', resourceObserver)
    }

    // Monitor long tasks
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.warn('Long task detected:', entry)
          }
        })
      })
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] })
        this.observers.set('longtask', longTaskObserver)
      } catch (e) {
        // Long task observer not supported
      }
    }
  }

  private setupCaching() {
    // Implement service worker caching strategies
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Cache critical resources
        this.cacheCriticalResources()
      })
    }
  }

  private setupLazyLoading() {
    // Implement intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]')
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            img.src = img.dataset.src || ''
            img.classList.remove('lazy')
            imageObserver.unobserve(img)
          }
        })
      })

      lazyImages.forEach((img) => imageObserver.observe(img))
    }
  }

  private measureLoadTime() {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart
    }
  }

  private measureMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
    }
  }

  private measureResourcePerformance(entry: PerformanceResourceTiming) {
    // Track API response times
    if (entry.name.includes('/api/')) {
      this.metrics.apiResponseTime = entry.responseEnd - entry.requestStart
    }
  }

  private async cacheCriticalResources() {
    const criticalResources = [
      '/',
      '/manifest.json',
      '/icon-192x192.png',
      '/icon-512x512.png'
    ]

    if ('caches' in window) {
      const cache = await caches.open('critical-resources-v1')
      await cache.addAll(criticalResources)
    }
  }

  /**
   * Optimize images
   */
  optimizeImage(src: string, options: { width?: number; height?: number; quality?: number } = {}) {
    const { width, height, quality = 80 } = options
    
    // Use Next.js Image Optimization if available
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      const params = new URLSearchParams()
      if (width) params.set('w', width.toString())
      if (height) params.set('h', height.toString())
      if (quality) params.set('q', quality.toString())
      
      return `/_next/image?url=${encodeURIComponent(src)}&${params.toString()}`
    }
    
    return src
  }

  /**
   * Preload critical resources
   */
  preloadResource(href: string, as: string) {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }

  /**
   * Prefetch resources
   */
  prefetchResource(href: string) {
    if (typeof document === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = href
    document.head.appendChild(link)
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.initialize()
  }

  /**
   * Clean up observers
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect())
    this.observers.clear()
  }
}

// Create global instance
export const performanceOptimizer = PerformanceOptimizer.getInstance()

// Utility functions
export const performanceUtils = {
  /**
   * Debounce function calls
   */
  debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
    let timeout: NodeJS.Timeout
    return ((...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }) as T
  },

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: any[]) => any>(func: T, limit: number): T {
    let inThrottle: boolean
    return ((...args: any[]) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }) as T
  },

  /**
   * Measure function execution time
   */
  measureExecutionTime<T>(func: () => T, label?: string): T {
    const start = performance.now()
    const result = func()
    const end = performance.now()
    
    if (label) {
      console.log(`${label} took ${end - start} milliseconds`)
    }
    
    return result
  },

  /**
   * Check if device is low-end
   */
  isLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false
    
    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 1
    
    // Check memory (if available)
    const memory = (performance as any).memory
    const hasLowMemory = memory && memory.jsHeapSizeLimit < 100000000 // 100MB
    
    return cores <= 2 || hasLowMemory
  },

  /**
   * Get connection information
   */
  getConnectionInfo() {
    if (typeof navigator === 'undefined') return null
    
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (!connection) return null
    
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  },

  /**
   * Optimize for slow connections
   */
  optimizeForSlowConnection() {
    const connectionInfo = this.getConnectionInfo()
    
    if (!connectionInfo) return false
    
    const isSlowConnection = 
      connectionInfo.effectiveType === 'slow-2g' ||
      connectionInfo.effectiveType === '2g' ||
      connectionInfo.downlink < 1 ||
      connectionInfo.saveData
    
    if (isSlowConnection) {
      // Disable animations
      document.documentElement.classList.add('reduced-motion')
      
      // Reduce image quality
      const images = document.querySelectorAll('img')
      images.forEach((img) => {
        if (img.src.includes('?')) {
          img.src += '&q=50'
        } else {
          img.src += '?q=50'
        }
      })
    }
    
    return isSlowConnection
  }
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState(performanceOptimizer.getMetrics())

  React.useEffect(() => {
    const updateMetrics = () => {
      setMetrics(performanceOptimizer.getMetrics())
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000)

    return () => clearInterval(interval)
  }, [])

  return {
    metrics,
    optimizeImage: performanceOptimizer.optimizeImage.bind(performanceOptimizer),
    preloadResource: performanceOptimizer.preloadResource.bind(performanceOptimizer),
    prefetchResource: performanceOptimizer.prefetchResource.bind(performanceOptimizer),
    isLowEndDevice: performanceUtils.isLowEndDevice,
    getConnectionInfo: performanceUtils.getConnectionInfo,
    optimizeForSlowConnection: performanceUtils.optimizeForSlowConnection
  }
}
