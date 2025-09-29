'use client'

import { useMobileDetection } from '@/hooks/useMobileDetection'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isMobile, isSmallScreen, isClient } = useMobileDetection()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 SplitSave is Working!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            The site is now functional on all platforms. Let's add features back step by step.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Desktop</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">Full web app functionality</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Mobile</h3>
              <p className="text-sm text-green-600 dark:text-green-300">Responsive mobile website</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">PWA</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300">Installable app experience</p>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">
              ✅ Site is working! Ready to add authentication and full app features back.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}