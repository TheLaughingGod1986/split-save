'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Achievement } from '@/lib/achievement-utils'

interface AchievementCelebrationProps {
  achievement: Achievement | null
  isVisible: boolean
  onClose: () => void
}

export function AchievementCelebration({ achievement, isVisible, onClose }: AchievementCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible && achievement) {
      setShowConfetti(true)
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, achievement, onClose])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500'
      case 'epic': return 'from-purple-500 to-pink-500'
      case 'rare': return 'from-blue-500 to-cyan-500'
      default: return 'from-green-500 to-emerald-500'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'shadow-yellow-400/50'
      case 'epic': return 'shadow-purple-500/50'
      case 'rare': return 'shadow-blue-500/50'
      default: return 'shadow-green-500/50'
    }
  }

  if (!achievement) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -10,
                    rotate: 0,
                    scale: 0
                  }}
                  animate={{
                    y: window.innerHeight + 10,
                    rotate: 360,
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  onAnimationComplete={() => {
                    if (i === 49) setShowConfetti(false)
                  }}
                />
              ))}
            </div>
          )}

          {/* Achievement Card */}
          <motion.div
            className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700"
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Achievement Icon */}
            <motion.div
              className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r ${getRarityColor(achievement.rarity)} flex items-center justify-center text-4xl shadow-lg ${getRarityGlow(achievement.rarity)}`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 200 }}
            >
              {achievement.icon}
            </motion.div>

            {/* Achievement Title */}
            <motion.h2
              className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              🎉 Achievement Unlocked!
            </motion.h2>

            <motion.h3
              className="text-xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {achievement.name}
            </motion.h3>

            {/* Achievement Description */}
            <motion.p
              className="text-center text-gray-600 dark:text-gray-400 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {achievement.description}
            </motion.p>

            {/* Rarity Badge */}
            <motion.div
              className="flex items-center justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}>
                {achievement.rarity.toUpperCase()}
              </span>
            </motion.div>

            {/* Points Earned */}
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Points Earned</div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                +{achievement.points}
              </div>
            </motion.div>

            {/* Celebration Message */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Keep up the great work! 🚀
              </p>
            </motion.div>

            {/* Floating Particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  initial={{
                    x: Math.random() * 300,
                    y: Math.random() * 400,
                    opacity: 0
                  }}
                  animate={{
                    y: Math.random() * -100,
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 1,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

