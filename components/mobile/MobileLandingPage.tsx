'use client'

import { useState } from 'react'
import { useMobileDetection } from '@/hooks/useMobileDetection'
import { LoginForm } from '@/components/auth/LoginForm'

export function MobileLandingPage() {
  const { isMobile, isSmallScreen } = useMobileDetection()
  const [showLogin, setShowLogin] = useState(false)

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setShowLogin(false)}
            className="mb-4 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to overview
          </button>
          <LoginForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="px-4 pt-8 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            SplitSave
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            Smart financial management for couples
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Split expenses fairly, track savings goals together, and build financial harmony with your partner.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <button
            onClick={() => setShowLogin(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Get Started
          </button>
          <button className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
            Learn More
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Fair Expense Splitting
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Split bills proportionally based on income or equally - whatever works for your relationship.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Shared Goals
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Set and track savings goals together with real-time progress updates and celebrations.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Mobile First
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Works perfectly on mobile, desktop, and as a PWA. Install it like a native app.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sign Up Together
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create accounts and invite your partner to join your financial journey.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Add Expenses
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Log shared expenses and let SplitSave calculate fair splits automatically.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Track Progress
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor your financial health and celebrate milestones together.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-specific features */}
        {isMobile && (
          <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              📱 Mobile Optimized
            </h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>Touch-friendly interface</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>Install as PWA app</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>Offline support</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                <span>Push notifications</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}