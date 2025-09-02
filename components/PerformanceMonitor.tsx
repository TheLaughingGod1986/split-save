'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number | null // Largest Contentful Paint
  fid: number | null // First Input Delay
  cls: number | null // Cumulative Layout Shift
  ttfb: number | null // Time to First Byte
  fcp: number | null // First Contentful Paint
  
  // Custom metrics
  componentRenderTime: number
  apiResponseTime: number
  memoryUsage: number
  bundleSize: number
  
  // User interaction metrics
  timeToInteractive: number
  timeToFirstMeaningfulPaint: number
  
  // Resource loading metrics
  resourceLoadTime: number
  imageLoadTime: number
  
  // Error metrics
  errorCount: number
  warningCount: number
}

interface PerformanceMonitorProps {
  enabled?: boolean
  showMetrics?: boolean
  logToConsole?: boolean
  sendToAnalytics?: boolean
  threshold?: {
    lcp: number
    fid: number
    cls: number
    ttfb: number
    fcp: number
  }
}

export function PerformanceMonitor({
  enabled = true,
  showMetrics = false,
  logToConsole = false,
  sendToAnalytics = false,
  threshold = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
    fcp: 1800
  }
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    fcp: null,
    componentRenderTime: 0,
    apiResponseTime: 0,
    memoryUsage: 0,
    bundleSize: 0,
    timeToInteractive: 0,
    timeToFirstMeaningfulPaint: 0,
    resourceLoadTime: 0,
    imageLoadTime: 0,
    errorCount: 0,
    warningCount: 0
  })
  
  const [isVisible, setIsVisible] = useState(false)
  const [alerts, setAlerts] = useState<string[]>([])
  const observerRef = useRef<PerformanceObserver | null>(null)
  const startTimeRef = useRef<number>(performance.now())
  const renderStartTimeRef = useRef<number>(0)

  // Initialize performance monitoring




  const startMonitoring = useCallback(() => {
    try {
      // Monitor Core Web Vitals
      if ('PerformanceObserver' in window) {
        // LCP (Largest Contentful Paint)
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as PerformanceEntry
          if (lastEntry) {
            const lcp = lastEntry.startTime
            updateMetric('lcp', lcp)
            checkThreshold('lcp', lcp, threshold.lcp)
          }
        })
        observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] })

        // FID (First Input Delay)
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime
            updateMetric('fid', fid)
            checkThreshold('fid', fid, threshold.fid)
          })
        })
        observerRef.current.observe({ entryTypes: ['first-input'] })

        // CLS (Cumulative Layout Shift)
        let clsValue = 0
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              updateMetric('cls', clsValue)
              checkThreshold('cls', clsValue, threshold.cls)
            }
          })
        })
        observerRef.current.observe({ entryTypes: ['layout-shift'] })

        // FCP (First Contentful Paint)
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const fcp = entries[0]?.startTime
          if (fcp) {
            updateMetric('fcp', fcp)
            checkThreshold('fcp', fcp, threshold.fcp)
          }
        })
        observerRef.current.observe({ entryTypes: ['paint'] })
      }

      // Monitor TTFB (Time to First Byte)
      if ('navigation' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (navigation) {
          const ttfb = navigation.responseStart - navigation.requestStart
          updateMetric('ttfb', ttfb)
          checkThreshold('ttfb', ttfb, threshold.ttfb)
        }
      }

      // Monitor memory usage
      if ('memory' in performance) {
        const memory = (performance as any).memory
        updateMetric('memoryUsage', memory.usedJSHeapSize / 1024 / 1024) // Convert to MB
      }

      // Monitor resource loading
      monitorResourceLoading()
      
      // Monitor errors and warnings
      monitorErrors()
      
      // Calculate bundle size (approximate)
      calculateBundleSize()
      
      // Measure time to interactive
      measureTimeToInteractive()
      
    } catch (error) {
      console.error('Failed to start performance monitoring:', error)
    }
  }, [threshold, logToConsole])

  const stopMonitoring = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }
  }, [])

  // Start monitoring when component mounts
  useEffect(() => {
    if (!enabled) return

    // Start monitoring when component mounts
    startMonitoring()
    
    // Monitor component render time
    renderStartTimeRef.current = performance.now()
    
    return () => {
      stopMonitoring()
    }
  }, [enabled, startMonitoring, stopMonitoring])

  const updateMetric = useCallback((key: keyof PerformanceMetrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  // Monitor component render time
  useEffect(() => {
    if (renderStartTimeRef.current > 0) {
      const renderTime = performance.now() - renderStartTimeRef.current
      updateMetric('componentRenderTime', renderTime)
      
      if (logToConsole) {
        console.log(`Component render time: ${renderTime.toFixed(2)}ms`)
      }
    }
  }, [logToConsole, updateMetric])

  const checkThreshold = useCallback((metric: string, value: number, threshold: number) => {
    if (value > threshold) {
      const alert = `${metric.toUpperCase()} exceeded threshold: ${value.toFixed(2)} > ${threshold}`
      setAlerts(prev => [...prev, alert])
      
      if (logToConsole) {
        console.warn(`Performance Alert: ${alert}`)
      }
      
      if (sendToAnalytics) {
        sendMetricToAnalytics(metric, value, threshold)
      }
    }
  }, [logToConsole, sendToAnalytics])

  const monitorResourceLoading = useCallback(() => {
    if ('PerformanceObserver' in window) {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        let totalLoadTime = 0
        let imageLoadTime = 0
        let imageCount = 0
        
        entries.forEach((entry: any) => {
          const loadTime = entry.responseEnd - entry.fetchStart
          totalLoadTime += loadTime
          
          if (entry.initiatorType === 'img') {
            imageLoadTime += loadTime
            imageCount++
          }
        })
        
        if (entries.length > 0) {
          updateMetric('resourceLoadTime', totalLoadTime / entries.length)
        }
        
        if (imageCount > 0) {
          updateMetric('imageLoadTime', imageLoadTime / imageCount)
        }
      })
      
      resourceObserver.observe({ entryTypes: ['resource'] })
    }
  }, [])

  const monitorErrors = useCallback(() => {
    let errorCount = 0
    let warningCount = 0
    
    const originalError = console.error
    const originalWarn = console.warn
    
    console.error = (...args) => {
      errorCount++
      updateMetric('errorCount', errorCount)
      originalError.apply(console, args)
    }
    
    console.warn = (...args) => {
      warningCount++
      updateMetric('warningCount', warningCount)
      originalWarn.apply(console, args)
    }
    
    // Monitor unhandled errors
    window.addEventListener('error', () => {
      errorCount++
      updateMetric('errorCount', errorCount)
    })
    
    window.addEventListener('unhandledrejection', () => {
      errorCount++
      updateMetric('errorCount', errorCount)
    })
  }, [])

  const calculateBundleSize = useCallback(() => {
    // This is a rough estimation - in production you'd get this from webpack stats
    const estimatedSize = 500 // KB
    updateMetric('bundleSize', estimatedSize)
  }, [])

  const measureTimeToInteractive = useCallback(() => {
    // Measure time to interactive based on when the component is fully rendered
    const timeToInteractive = performance.now() - startTimeRef.current
    updateMetric('timeToInteractive', timeToInteractive)
    
    // Measure time to first meaningful paint
    const timeToFirstMeaningfulPaint = performance.now() - startTimeRef.current
    updateMetric('timeToFirstMeaningfulPaint', timeToFirstMeaningfulPaint)
  }, [])

  const sendMetricToAnalytics = useCallback((metric: string, value: number, threshold: number) => {
    // In production, send to your analytics service
    const metricData = {
      metric,
      value,
      threshold,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    // Example: Send to your API
    // fetch('/api/performance-metrics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metricData)
    // })
    
    if (logToConsole) {
      console.log('Performance metric sent to analytics:', metricData)
    }
  }, [logToConsole])

  const getPerformanceScore = useCallback(() => {
    let score = 100
    
    // Deduct points for poor performance
    if (metrics.lcp && metrics.lcp > threshold.lcp) {
      score -= Math.min(20, (metrics.lcp - threshold.lcp) / 100)
    }
    
    if (metrics.fid && metrics.fid > threshold.fid) {
      score -= Math.min(15, (metrics.fid - threshold.fid) / 10)
    }
    
    if (metrics.cls && metrics.cls > threshold.cls) {
      score -= Math.min(15, (metrics.cls - threshold.cls) * 100)
    }
    
    if (metrics.ttfb && metrics.ttfb > threshold.ttfb) {
      score -= Math.min(10, (metrics.ttfb - threshold.ttfb) / 100)
    }
    
    if (metrics.fcp && metrics.fcp > threshold.fcp) {
      score -= Math.min(10, (metrics.fcp - threshold.fcp) / 100)
    }
    
    return Math.max(0, Math.round(score))
  }, [metrics, threshold])

  const getPerformanceGrade = useCallback((score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' }
    if (score >= 80) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' }
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' }
    if (score >= 60) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' }
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' }
  }, [])

  const exportMetrics = useCallback(() => {
    const metricsData = {
      ...metrics,
      performanceScore: getPerformanceScore(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    
    const blob = new Blob([JSON.stringify(metricsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [metrics, getPerformanceScore])

  if (!enabled || !showMetrics) return null

  const performanceScore = getPerformanceScore()
  const performanceGrade = getPerformanceGrade(performanceScore)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isVisible ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📊 Performance Monitor
              </h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Performance Score */}
            <div className="text-center mb-4">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${performanceGrade.bgColor} dark:bg-opacity-20`}>
                <span className={`text-2xl font-bold ${performanceGrade.color}`}>
                  {performanceGrade.grade}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {performanceScore}/100
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Performance Score
                </div>
              </div>
            </div>

            {/* Core Web Vitals */}
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Core Web Vitals</h4>
              
              {metrics.lcp !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">LCP</span>
                  <span className={metrics.lcp > threshold.lcp ? 'text-red-600' : 'text-green-600'}>
                    {metrics.lcp.toFixed(0)}ms
                  </span>
                </div>
              )}
              
              {metrics.fid !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">FID</span>
                  <span className={metrics.fid > threshold.fid ? 'text-red-600' : 'text-green-600'}>
                    {metrics.fid.toFixed(0)}ms
                  </span>
                </div>
              )}
              
              {metrics.cls !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">CLS</span>
                  <span className={metrics.cls > threshold.cls ? 'text-red-600' : 'text-green-600'}>
                    {metrics.cls.toFixed(3)}
                  </span>
                </div>
              )}
            </div>

            {/* Custom Metrics */}
            <div className="space-y-3 mb-4">
              <h4 className="font-medium text-gray-900 dark:text-white">Custom Metrics</h4>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Render Time</span>
                <span className="text-blue-600">
                  {metrics.componentRenderTime.toFixed(0)}ms
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Memory Usage</span>
                <span className="text-blue-600">
                  {metrics.memoryUsage.toFixed(1)}MB
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Bundle Size</span>
                <span className="text-blue-600">
                  {metrics.bundleSize}KB
                </span>
              </div>
            </div>

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                  ⚠️ Performance Alerts
                </h4>
                <div className="space-y-1">
                  {alerts.slice(-3).map((alert, index) => (
                    <div key={index} className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={exportMetrics}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                📥 Export
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsVisible(true)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
            title="Show Performance Monitor"
          >
            📊
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook for performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const [renderTime, setRenderTime] = useState(0)
  const startTime = useRef(performance.now())

  useEffect(() => {
    const endTime = performance.now()
    const time = endTime - startTime.current
    setRenderTime(time)
    
    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render time: ${time.toFixed(2)}ms`)
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // sendPerformanceMetric(componentName, 'render', time)
    }
  }, [])

  return { renderTime }
}

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function WithPerformanceMonitoring(props: P) {
    const { renderTime } = usePerformanceMonitor(componentName)
    
    return (
      <div data-performance-monitor={componentName} data-render-time={renderTime}>
        <Component {...props} />
      </div>
    )
  }
}
