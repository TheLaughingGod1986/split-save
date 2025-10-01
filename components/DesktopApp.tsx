'use client'

import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { LandingPage } from '@/components/LandingPage'
import { useEffect, useState } from 'react'

export function DesktopApp() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show loading while checking authentication
  if (!mounted || loading) {
    return (
      <div className="hidden md:block">
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 animate-pulse">
              Loading SplitSave...
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Preparing your financial harmony.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show main app for authenticated users
  if (user) {
    return (
      <div className="hidden md:block">
        <SplitsaveApp />
      </div>
    )
  }

  // Show landing page for non-authenticated users
  return (
    <div className="hidden md:block">
      <LandingPage />
    </div>
  )
}
