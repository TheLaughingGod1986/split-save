'use client'
import React, { useEffect, useState } from 'react'
import { Achievement } from '@/lib/achievement-utils'

interface AchievementCelebrationProps {
  achievement: Achievement | null
  onClose: () => void
}

export function AchievementCelebration({ achievement, onClose }: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (achievement) {
      setIsVisible(true)
      setIsAnimating(true)
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [achievement])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 300)
  }

  if (!achievement || !isVisible) return null

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-500 to-gray-700'
      case 'rare':
        return 'from-blue-500 to-blue-700'
      case 'epic':
        return 'from-purple-500 to-purple-700'
      case 'legendary':
        return 'from-orange-500 to-red-600'
      default:
        return 'from-gray-500 to-gray-700'
    }
  }

  const getRarityParticles = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common':
        return ['✨', '⭐']
      case 'rare':
        return ['💙', '✨', '⭐']
      case 'epic':
        return ['💜', '🌟', '✨', '⭐']
      case 'legendary':
        return ['🔥', '💎', '🌟', '✨', '⭐']
      default:
        return ['✨']
    }
  }

  const particles = getRarityParticles(achievement.rarity)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Achievement Card */}
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-gray-200 dark:border-gray-700 transform transition-all duration-500 ${
          isAnimating 
            ? 'scale-100 opacity-100 rotate-0' 
            : 'scale-50 opacity-0 rotate-12'
        }`}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {particles.map((particle, index) => (
            <div
              key={index}
              className={`absolute text-2xl animate-bounce`}
              style={{
                left: `${20 + index * 15}%`,
                top: `${10 + (index % 3) * 20}%`,
                animationDelay: `${index * 0.2}s`,
                animationDuration: `${2 + index * 0.3}s`
              }}
            >
              {particle}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} mb-4 shadow-lg`}>
            <span className="text-4xl">{achievement.icon}</span>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 Achievement Unlocked!
          </h2>
          
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            achievement.rarity === 'common' ? 'bg-gray-100 text-gray-800' :
            achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
            achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
            'bg-orange-100 text-orange-800'
          }`}>
            {achievement.rarity}
          </div>
        </div>

        {/* Achievement Details */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {achievement.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {achievement.description}
          </p>
          
          {/* Points */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">💎</span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              +{achievement.points} points
            </span>
          </div>
        </div>

        {/* Progress Celebration */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} transition-all duration-1000 ease-out`}
              style={{ width: '100%' }}
            />
          </div>
          <div className="text-center mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            100% Complete!
          </div>
        </div>

        {/* Requirements Met */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Requirements Completed:
          </h4>
          <div className="space-y-1">
            {achievement.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {req.description}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium transition-colors"
          >
            Continue
          </button>
          <button
            onClick={() => {
              // Could navigate to achievements page
              handleClose()
            }}
            className={`flex-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105`}
          >
            View All
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Confetti Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, index) => (
          <div
            key={index}
            className={`absolute w-2 h-2 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-full animate-ping`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Custom hook for managing achievement celebrations
export function useAchievementCelebration() {
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null)

  const celebrateAchievement = (achievement: Achievement) => {
    setCelebratingAchievement(achievement)
  }

  const closeCelebration = () => {
    setCelebratingAchievement(null)
  }

  return {
    celebratingAchievement,
    celebrateAchievement,
    closeCelebration
  }
}
