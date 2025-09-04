'use client'

import { useState, useEffect } from 'react'

export function MobileFallback() {
  const [showFallback, setShowFallback] = useState(false)

  useEffect(() => {
    // Show fallback after 15 seconds if nothing else loads
    const timer = setTimeout(() => {
      setShowFallback(true)
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  if (!showFallback) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-500/20 rounded-full flex items-center justify-center">
          <span className="text-3xl">📱</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-4">SplitSave</h1>
        <p className="text-white/70 mb-6 leading-relaxed">
          Having trouble loading? This might be a network or browser compatibility issue.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
          <button
            onClick={() => window.location.href = 'https://splitsave.app'}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Desktop Version
          </button>
        </div>
        <div className="mt-6 text-xs text-white/50">
          <p>If the problem persists, try:</p>
          <ul className="mt-2 space-y-1">
            <li>• Clearing your browser cache</li>
            <li>• Using a different browser</li>
            <li>• Checking your internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
