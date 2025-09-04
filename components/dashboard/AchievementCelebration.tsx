'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AchievementCelebrationProps {
  achievement: {
    id: string
    name: string
    description: string
    icon: string
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    points: number
    category: string
  }
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  autoCloseDelay?: number
}

export function AchievementCelebration({
  achievement,
  isVisible,
  onClose,
  autoClose = true,
  autoCloseDelay = 5000
}: AchievementCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      
      if (autoClose) {
        const timer = setTimeout(() => {
          onClose()
        }, autoCloseDelay)
        
        return () => clearTimeout(timer)
      }
    }
  }, [isVisible, autoClose, autoCloseDelay, onClose])

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600'
      case 'rare':
        return 'from-blue-400 to-blue-600'
      case 'epic':
        return 'from-purple-400 to-purple-600'
      case 'legendary':
        return 'from-yellow-400 to-orange-500'
      default:
        return 'from-gray-400 to-gray-600'
    }
  }

  const getRarityGlow = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'shadow-gray-400/50'
      case 'rare':
        return 'shadow-blue-400/50'
      case 'epic':
        return 'shadow-purple-400/50'
      case 'legendary':
        return 'shadow-yellow-400/50'
      default:
        return 'shadow-gray-400/50'
    }
  }

  const getRarityText = () => {
    switch (achievement.rarity) {
      case 'common':
        return 'Common'
      case 'rare':
        return 'Rare'
      case 'epic':
        return 'Epic'
      case 'legendary':
        return 'Legendary'
      default:
        return 'Common'
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ 
                    x: Math.random() * 400, 
                    y: -10, 
                    rotate: 0,
                    scale: 0
                  }}
                  animate={{ 
                    y: 400, 
                    rotate: 360,
                    scale: [0, 1, 0],
                    x: Math.random() * 400
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Achievement Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className={`relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${getRarityColor()} shadow-lg ${getRarityGlow()} mb-6`}
          >
            <span className="text-4xl">{achievement.icon}</span>
            
            {/* Rarity Glow Effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className={`absolute inset-0 rounded-full bg-gradient-to-br ${getRarityColor()} opacity-50`}
            />
          </motion.div>

          {/* Achievement Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
          >
            🎉 Achievement Unlocked!
          </motion.h2>

          {/* Achievement Name */}
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2"
          >
            {achievement.name}
          </motion.h3>

          {/* Achievement Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-gray-600 dark:text-gray-400 mb-4"
          >
            {achievement.description}
          </motion.p>

          {/* Rarity Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${getRarityColor()} text-white mb-4`}
          >
            <span className="mr-2">✨</span>
            {getRarityText()} Achievement
          </motion.div>

          {/* Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center space-x-2 text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6"
          >
            <span>🏆</span>
            <span>{achievement.points} points earned!</span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex space-x-3 justify-center"
          >
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Awesome!
            </button>
            <button
              onClick={() => {
                // In a real app, this would navigate to achievements page
                console.log('Navigate to achievements')
                onClose()
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View All
            </button>
          </motion.div>

          {/* Auto-close indicator */}
          {autoClose && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-2xl"
            />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for managing achievement celebrations
export function useAchievementCelebration() {
  const [celebration, setCelebration] = useState<{
    achievement: any
    isVisible: boolean
  } | null>(null)

  const showCelebration = (achievement: any) => {
    setCelebration({
      achievement,
      isVisible: true
    })
  }

  const hideCelebration = () => {
    setCelebration(null)
  }

  return {
    celebration,
    showCelebration,
    hideCelebration
  }
}

// Auto-celebration component that triggers on achievement unlock
interface AutoAchievementCelebrationProps {
  trigger: boolean
  achievement: any
  onClose?: () => void
}

export function AutoAchievementCelebration({ 
  trigger, 
  achievement, 
  onClose 
}: AutoAchievementCelebrationProps) {
  const { celebration, showCelebration, hideCelebration } = useAchievementCelebration()

  useEffect(() => {
    if (trigger && achievement) {
      showCelebration(achievement)
    }
  }, [trigger, achievement, showCelebration])

  const handleClose = () => {
    hideCelebration()
    if (onClose) {
      onClose()
    }
  }

  if (!celebration) return null

  return (
    <AchievementCelebration
      achievement={celebration.achievement}
      isVisible={celebration.isVisible}
      onClose={handleClose}
    />
  )
}
