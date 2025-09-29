'use client'

import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isMobile, isSmallScreen, isClient } = useMobileDetection()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ SplitSave is Working!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            The site is now functional. Let's add the full app back step by step.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Current Status:
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p>Mobile: {isMobile ? '✅ Yes' : '❌ No'}</p>
              <p>Small Screen: {isSmallScreen ? '✅ Yes' : '❌ No'}</p>
              <p>Client: {isClient ? '✅ Yes' : '❌ No'}</p>
              <p>Mounted: {mounted ? '✅ Yes' : '❌ No'}</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Next step: Add authentication and main app components back gradually.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}