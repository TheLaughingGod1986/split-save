'use client'

import { useEffect, useState } from 'react'

interface MobileLoadingFallbackProps {
  onTimeout?: () => void
  timeoutMs?: number
}

export function MobileLoadingFallback({ onTimeout, timeoutMs = 8000 }: MobileLoadingFallbackProps) {
  const [showFallback, setShowFallback] = useState(false)
  const [timeoutReached, setTimeoutReached] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [progress, setProgress] = useState(12)
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: '',
    screenSize: '',
    platform: '',
    isOnline: false
  })

  useEffect(() => {
    // Set client-side flag and gather device info
    setIsClient(true)
    setDeviceInfo({
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      platform: navigator.platform,
      isOnline: navigator.onLine
    })

    // Show fallback after 3 seconds
    const fallbackTimer = setTimeout(() => {
      setShowFallback(true)
    }, 3000)

    // Trigger timeout callback after specified time
    const timeoutTimer = setTimeout(() => {
      setTimeoutReached(true)
      setProgress(100)
      onTimeout?.()
    }, timeoutMs)

    return () => {
      clearTimeout(fallbackTimer)
      clearTimeout(timeoutTimer)
    }
  }, [onTimeout, timeoutMs])

  useEffect(() => {
    if (timeoutReached) {
      return
    }

    const progressTimer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 90) {
          return prevProgress
        }
        return Math.min(90, prevProgress + Math.max(1, Math.round(Math.random() * 6)))
      })
    }, 700)

    return () => clearInterval(progressTimer)
  }, [timeoutReached])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoToLanding = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        {/* Loading Animation */}
        <div className="mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
        </div>

        {/* Loading Message */}
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Loading SplitSave...
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Setting up your financial dashboard
        </p>

        {/* Mobile Debug Info */}
        {showFallback && isClient && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Debug Info:
            </h3>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>User Agent: {deviceInfo.userAgent.substring(0, 60)}...</div>
              <div>Screen: {deviceInfo.screenSize}</div>
              <div>Platform: {deviceInfo.platform}</div>
              <div>Online: {deviceInfo.isOnline ? 'Yes' : 'No'}</div>
              <div>Loading Time: {timeoutReached ? 'Timeout' : 'In Progress'}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {timeoutReached && (
          <div className="space-y-3">
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Loading is taking longer than expected. This might be a network issue.
            </p>
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleRefresh}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Refresh Page
              </button>
              <button
                onClick={handleGoToLanding}
                className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mt-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ 
                width: `${progress}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
