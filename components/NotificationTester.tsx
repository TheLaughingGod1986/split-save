'use client'

import React, { useState } from 'react'
import { notificationSystem } from '@/lib/notification-system'
import { toast } from '@/lib/toast'

interface NotificationTesterProps {
  userId: string
  partnershipId?: string
  currency?: string
}

export function NotificationTester({ userId, partnershipId, currency = 'GBP' }: NotificationTesterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const testNotifications = [
    {
      name: 'Payday Reminder',
      description: 'Test payday reminder notification',
      action: () => {
        notificationSystem.schedulePaydayReminder({
          userId,
          payday: '15',
          nextPayday: new Date(Date.now() + 60000), // 1 minute from now
          expectedContribution: 500,
          currency,
          partnershipId
        })
        toast.success('Payday reminder scheduled for 1 minute from now')
      }
    },
    {
      name: 'Partner Activity',
      description: 'Test partner activity notification',
      action: () => {
        document.dispatchEvent(new CustomEvent('partnerActivity', {
          detail: {
            partnerId: userId,
            partnerName: 'Test Partner',
            activityType: 'expense_added',
            amount: 75.50,
            currency,
            entityName: 'Test Expense',
            partnershipId
          }
        }))
        toast.success('Partner activity notification triggered')
      }
    },
    {
      name: 'Missed Contribution',
      description: 'Test missed contribution alert',
      action: () => {
        document.dispatchEvent(new CustomEvent('missedContribution', {
          detail: {
            userId,
            expectedAmount: 500,
            actualAmount: 300,
            currency,
            month: new Date().toISOString().slice(0, 7),
            partnershipId
          }
        }))
        toast.success('Missed contribution notification triggered')
      }
    },
    {
      name: 'Goal Milestone',
      description: 'Test goal milestone celebration',
      action: () => {
        document.dispatchEvent(new CustomEvent('goalMilestone', {
          detail: {
            goalId: 'test-goal',
            goalName: 'Test Goal',
            milestoneType: 'percentage',
            milestoneValue: 50,
            currentAmount: 1000,
            targetAmount: 2000,
            currency,
            partnershipId
          }
        }))
        toast.success('Goal milestone notification triggered')
      }
    },
    {
      name: 'Approval Request',
      description: 'Test approval request notification',
      action: () => {
        notificationSystem.createApprovalRequest(
          userId,
          partnershipId || 'test-partnership',
          'expense',
          'Test Expense',
          150.00,
          currency
        )
        toast.success('Approval request notification triggered')
      }
    },
    {
      name: 'Safety Pot Alert',
      description: 'Test safety pot alert',
      action: () => {
        notificationSystem.createSafetyPotAlert(
          userId,
          partnershipId || 'test-partnership',
          'low_balance'
        )
        toast.success('Safety pot alert triggered')
      }
    },
    {
      name: 'Streak Achievement',
      description: 'Test streak achievement notification',
      action: () => {
        notificationSystem.createStreakAchievement(
          userId,
          'monthly',
          5
        )
        toast.success('Streak achievement notification triggered')
      }
    }
  ]

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors z-40"
        title="Test Notifications"
      >
        🧪
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={() => setIsOpen(false)}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-purple-500 to-blue-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🧪</span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Notification Tester</h3>
                  <p className="text-purple-100 text-sm">Test different notification types</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-purple-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {testNotifications.map((test, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{test.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{test.description}</p>
                    </div>
                    <button
                      onClick={test.action}
                      className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                    >
                      Test
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
