'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ProfileManager } from './forms/ProfileManager'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface OnboardingFlowProps {
  user: any
  onComplete: () => void
}

export function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canProceed, setCanProceed] = useState(false)

  const steps = [
    {
      id: 1,
      title: 'Welcome to SplitSave! 👋',
      description: 'Let\'s get you set up for financial success',
      icon: '🎯',
      required: true
    },
    {
      id: 2,
      title: 'Complete Your Profile 💰',
      description: 'Set up your financial details for accurate calculations',
      icon: '📊',
      required: true
    },
    {
      id: 3,
      title: 'Choose Your Goals 🎯',
      description: 'Set your first savings targets',
      icon: '🚀',
      required: false
    },
    {
      id: 4,
      title: 'You\'re All Set! 🎉',
      description: 'Ready to start your financial journey',
      icon: '✨',
      required: false
    }
  ]

  const checkProfileCompletion = useCallback(async () => {
    try {
      setLoading(true)
      const profileData = await apiClient.get('/auth/profile')
      setProfile(profileData)
      
      // Check if profile is complete (has income and payday set)
      if (profileData.data?.income && profileData.data?.payday) {
        // Profile is already complete, skip onboarding
        onComplete()
        return
      }
      
      // Profile needs completion, show onboarding
      setCurrentStep(profileData.data?.income ? 2 : 1)
      setCanProceed(false) // User must complete profile first
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }, [onComplete])

  // Check profile completion when component mounts
  useEffect(() => {
    checkProfileCompletion()
  }, [checkProfileCompletion])

  const handleProfileUpdate = async (updatedProfile: any) => {
    setProfile(updatedProfile)
    
    // Check if profile is now complete
    if (updatedProfile.income && updatedProfile.payday) {
      setCanProceed(true)
      setCurrentStep(3)
      toast.success('Profile completed successfully! 🎉')
    }
  }

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinishOnboarding = () => {
    // Track completion analytics
    toast.success('Welcome to SplitSave! You\'re ready to start managing your shared finances. 🚀')
    onComplete()
  }

  const handleSkipForNow = () => {
    if (canProceed) {
      toast.info('You can complete the remaining steps anytime from your dashboard')
      onComplete()
    } else {
      toast.error('Please complete your profile setup first to continue')
    }
  }

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to SplitSave!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                The smart way for couples to manage shared expenses, track savings goals, and build financial harmony together.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  What you&apos;ll get:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Shared Expense Tracking</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Split bills fairly with your partner</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Savings Goals</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Set and track financial targets</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Progress Insights</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Visualize your financial journey</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🤝</span>
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">Partner Collaboration</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">Work together on finances</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
            >
              Get Started →
            </button>
          </div>
        )

      case 2:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Complete Your Profile
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                This information helps us provide accurate financial calculations and personalized recommendations.
              </p>
            </div>
            <ProfileManager onProfileUpdate={handleProfileUpdate} />
            <div className="text-center mt-8">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  💡 <strong>Tip:</strong> Your profile information is private and secure. We use it only to calculate your financial recommendations.
                </p>
              </div>
              {canProceed && (
                <button
                  onClick={handleNextStep}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  Continue to Goals →
                </button>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Set Your First Savings Goal
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Goals help you stay motivated and track your progress. You can always add more later!
              </p>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-semibold text-green-900 dark:text-green-100 mb-4">
                  Popular First Goals:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="text-2xl mb-2">🏠</div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Emergency Fund</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">3-6 months of expenses</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="text-2xl mb-2">✈️</div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Vacation Fund</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">Your next big trip</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="text-2xl mb-2">🚗</div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Car Fund</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">Down payment or repairs</p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="text-2xl mb-2">💍</div>
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Wedding Fund</h4>
                    <p className="text-sm text-green-600 dark:text-green-300">Your special day</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Continue →
              </button>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                You&apos;re All Set!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Congratulations! Your SplitSave profile is complete and you&apos;re ready to start your financial journey.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  What&apos;s next?
                </h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="font-medium text-purple-800 dark:text-purple-200">Add your first expense</p>
                      <p className="text-sm text-purple-600 dark:text-purple-300">Start tracking shared costs</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <p className="font-medium text-purple-800 dark:text-purple-200">Create a savings goal</p>
                      <p className="text-sm text-purple-600 dark:text-purple-300">Set your first target</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🤝</span>
                    <div>
                      <p className="font-medium text-purple-800 dark:text-purple-200">Invite your partner</p>
                      <p className="text-sm text-purple-600 dark:text-purple-300">Start collaborating together</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleFinishOnboarding}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
              >
                Start Using SplitSave! 🚀
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Progress Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Getting Started
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Step {currentStep} of {steps.length}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id <= currentStep
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.id <= currentStep ? '✓' : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step.id < currentStep ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        {getStepContent()}
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? <button className="text-purple-600 dark:text-purple-400 hover:underline">Contact support</button>
          </p>
          {currentStep > 1 && (
            <button
              onClick={handleSkipForNow}
              className="mt-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
