'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { notificationSystem } from '@/lib/notification-system'
import { NotificationCenter } from './NotificationCenter'

interface NotificationBellProps {
  userId: string
  className?: string
}

export function NotificationBell({ userId, className = '' }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  useEffect(() => {
    if (userId && !isInitialized) {
      initializeNotifications()
    }
  }, [userId, isInitialized])

  const initializeNotifications = async () => {
    try {
      await notificationSystem.initialize(userId)
      setIsInitialized(true)
      updateUnreadCount()
      
      // Set up periodic updates
      const interval = setInterval(updateUnreadCount, 30000) // Check every 30 seconds
      
      return () => clearInterval(interval)
    } catch (error) {
      console.error('Failed to initialize notifications:', error)
    }
  }

  const updateUnreadCount = () => {
    if (userId) {
      const count = notificationSystem.getUnreadCount(userId)
      console.log('🔔 Notification count updated:', count, 'for user:', userId)
      
      // If no notifications exist, create a demo notification for testing
      if (count === 0 && isInitialized) {
        console.log('🔔 No notifications found, creating demo notification...')
        notificationSystem.createApprovalRequest(
          userId,
          'demo-partnership',
          'expense',
          'Demo Expense',
          150.00,
          'GBP'
        )
        // Update count after creating demo notification
        setTimeout(() => {
          const newCount = notificationSystem.getUnreadCount(userId)
          console.log('🔔 Demo notification created, new count:', newCount)
          setUnreadCount(newCount)
        }, 100)
      } else {
        setUnreadCount(count)
      }
    }
  }

  const handleBellClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🔔 Bell clicked! Opening notification center...')
    setIsClicked(true)
    setIsOpen(true)
    updateUnreadCount() // Refresh count when opening
    
    // Reset clicked state after animation
    setTimeout(() => setIsClicked(false), 200)
  }

  const handleClose = () => {
    setIsOpen(false)
    updateUnreadCount() // Refresh count when closing
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          onClick={handleBellClick}
          className={`relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-lg cursor-pointer ${
            isClicked ? 'scale-95 bg-blue-50 dark:bg-blue-900/20' : ''
          }`}
          aria-label={`Notifications (${unreadCount} unread)`}
          type="button"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a2.25 2.25 0 0 1-2.25 2.25H4.5a2.25 2.25 0 0 1-2.25-2.25L4.5 14.25V9.75a6 6 0 0 1 6-6z" 
            />
          </svg>
          
          {/* Unread count badge */}
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Pulse animation for new notifications */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 1.2, opacity: 0 }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatType: "reverse" 
              }}
              className="absolute inset-0 bg-red-500 rounded-full"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Notification Center Modal */}
      <NotificationCenter
        userId={userId}
        isOpen={isOpen}
        onClose={handleClose}
      />
    </>
  )
}
