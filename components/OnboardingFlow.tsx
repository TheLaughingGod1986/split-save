'use client'

import React, { useState, useEffect } from 'react'
import { ProfileManager } from './ProfileManager'
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

  const steps = [
    {
      id: 1,
      title: 'Welcome to SplitSave!',
      description: 'Let\'s set up your profile to get started',
      icon: '👋'
    },
    {
      id: 2,
      title: 'Complete Your Profile',
      description: 'Add your financial details for accurate calculations',
      icon: '💰'
    },
    {
      id: 3,
      title: 'You\'re All Set!',
      description: 'Your profile is complete and you\'re ready to start',
      icon: '🎉'
    }
  ]

  useEffect(() => {
    checkProfileCompletion()
  }, [])

  const checkProfileCompletion = async () => {
    try {
      setLoading(true)
      const profileData = await apiClient.get('/auth/profile')
      setProfile(profileData)
      
      // Check if profile is complete (has income and payday set)
      if (profileData.income && profileData.payday) {
        // Profile is already complete, skip onboarding
        onComplete()
        return
      }
      
      // Profile needs completion, show onboarding
      setCurrentStep(profileData.income ? 2 : 1)
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (updatedProfile: any) => {
    setProfile(updatedProfile)
    
    // Check if profile is now complete
    if (updatedProfile.income && updatedProfile.payday) {
      setCurrentStep(3)
      toast.success('Profile completed successfully!')
    }
  }

  const handleFinishOnboarding = () => {
    // Track completion analytics
    toast.success('Welcome to SplitSave! You\'re ready to start managing your shared finances.')
    onComplete()
  }

  const handleSkipForNow = () => {
    toast.info('You can complete your profile anytime from the Account settings')
    onComplete()
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
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {currentStep === 1 && (
            <div className="text-center">
              <div className="text-6xl mb-6">{steps[0].icon}</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {steps[0].title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {steps[0].description}
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                <h3 className="text-xl font-semibold mb-4">What you'll set up:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">💰</div>
                    <h4 className="font-medium">Income</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your monthly income for fair splitting</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">📅</div>
                    <h4 className="font-medium">Payday</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">When you get paid each month</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">🌍</div>
                    <h4 className="font-medium">Currency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your preferred currency</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium"
                >
                  Get Started
                </button>
                <button
                  onClick={handleSkipForNow}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Skip for Now
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">{steps[1].icon}</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {steps[1].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {steps[1].description}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <ProfileManager onProfileUpdate={handleProfileUpdate} />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSkipForNow}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Skip and finish later
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="text-center">
              <div className="text-6xl mb-6">{steps[2].icon}</div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {steps[2].title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {steps[2].description}
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
                <h3 className="text-xl font-semibold mb-4">What's next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">🤝</div>
                    <h4 className="font-medium">Invite Your Partner</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Share expenses and goals together</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-medium">Set Goals</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create savings goals to work towards</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2">💸</div>
                    <h4 className="font-medium">Track Expenses</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Log and split your shared expenses</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFinishOnboarding}
                className="bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 transition-colors font-medium text-lg"
              >
                Start Using SplitSave
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
