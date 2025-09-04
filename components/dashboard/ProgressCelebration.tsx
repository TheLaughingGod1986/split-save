'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CelebrationProps {
  type: 'achievement' | 'goal' | 'streak' | 'milestone'
  title: string
  message: string
  icon: string
  points?: number
  isVisible: boolean
  onClose: () => void
}

export function ProgressCelebration({
  type,
  title,
  message,
  icon,
  points,
  isVisible,
  onClose
}: CelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([])

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true)
      generateConfetti()
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const generateConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
    const newParticles = []
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    
    setParticles(newParticles)
  }

  const getCelebrationColor = () => {
    switch (type) {
      case 'achievement': return 'from-purple-500 to-pink-500'
      case 'goal': return 'from-green-500 to-blue-500'
      case 'streak': return 'from-orange-500 to-red-500'
      case 'milestone': return 'from-blue-500 to-indigo-500'
      default: return 'from-purple-500 to-pink-500'
    }
  }

  const getCelebrationIcon = () => {
    switch (type) {
      case 'achievement': return '🏆'
      case 'goal': return '🎯'
      case 'streak': return '🔥'
      case 'milestone': return '🌟'
      default: return '🎉'
    }
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: particle.color,
                    left: `${particle.x}%`,
                    top: `${particle.y}%`
                  }}
                  initial={{ y: -100, opacity: 1, scale: 0 }}
                  animate={{
                    y: [0, 100, 200, 300],
                    opacity: [1, 1, 0.8, 0],
                    scale: [0, 1, 1.2, 0.8],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          )}

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center"
          >
            {/* Floating Icons */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -left-4 text-4xl"
            >
              🎊
            </motion.div>
            
            <motion.div
              animate={{
                y: [0, 10, 0],
                rotate: [0, -5, 5, 0]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-4 -right-4 text-4xl"
            >
              ✨
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Achievement Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-8xl mb-4"
              >
                {icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
              >
                {title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-gray-600 dark:text-gray-300 mb-4"
              >
                {message}
              </motion.p>

              {/* Points */}
              {points && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold"
                >
                  <span>💎</span>
                  <span>{points} Points Earned!</span>
                </motion.div>
              )}

              {/* Celebration Type Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className={`mt-4 inline-flex items-center space-x-2 bg-gradient-to-r ${getCelebrationColor()} text-white px-4 py-2 rounded-full text-sm font-medium`}
              >
                <span>{getCelebrationIcon()}</span>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </motion.div>
            </motion.div>

            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <span className="text-2xl">×</span>
            </motion.button>

            {/* Progress Bar Animation */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-b-2xl"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Hook for managing celebrations
export function useCelebration() {
  const [celebration, setCelebration] = useState<{
    type: 'achievement' | 'goal' | 'streak' | 'milestone'
    title: string
    message: string
    icon: string
    points?: number
  } | null>(null)

  const showCelebration = (celebrationData: {
    type: 'achievement' | 'goal' | 'streak' | 'milestone'
    title: string
    message: string
    icon: string
    points?: number
  }) => {
    setCelebration(celebrationData)
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

// Predefined celebration templates
export const celebrationTemplates = {
  achievement: {
    type: 'achievement' as const,
    title: 'Achievement Unlocked!',
    message: 'Congratulations on reaching this milestone!',
    icon: '🏆'
  },
  goal: {
    type: 'goal' as const,
    title: 'Goal Completed!',
    message: 'Amazing work! You\'ve reached your target!',
    icon: '🎯'
  },
  streak: {
    type: 'streak' as const,
    title: 'Streak Milestone!',
    message: 'Incredible consistency! Keep the momentum going!',
    icon: '🔥'
  },
  milestone: {
    type: 'milestone' as const,
    title: 'Milestone Reached!',
    message: 'Fantastic progress! You\'re doing great!',
    icon: '🌟'
  }
}

// Auto-celebration component for common events
export function AutoCelebration({ 
  trigger, 
  type, 
  customData 
}: { 
  trigger: any
  type: keyof typeof celebrationTemplates
  customData?: Partial<typeof celebrationTemplates[typeof type]>
}) {
  const { celebration, showCelebration, hideCelebration } = useCelebration()

  useEffect(() => {
    if (trigger) {
      const template = celebrationTemplates[type]
      showCelebration({
        ...template,
        ...customData
      })
    }
  }, [trigger, type, customData, showCelebration])

  return (
    <ProgressCelebration
      type={celebration?.type || 'achievement'}
      title={celebration?.title || ''}
      message={celebration?.message || ''}
      icon={celebration?.icon || '🎉'}
      points={celebration?.points}
      isVisible={!!celebration}
      onClose={hideCelebration}
    />
  )
}
