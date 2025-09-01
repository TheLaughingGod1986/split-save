import { calculateNextPayday, isTodayPayday } from './payday-utils'
import { notificationSystem, type PaydayReminderData } from './notification-system'

interface PaydayReminderConfig {
  userId: string
  payday: string
  customDate?: string
  expectedContribution: number
  currency: string
  partnershipId?: string
  reminderTime?: 'morning' | 'afternoon' | 'evening' // When to send the reminder
}

class PaydayReminderSystem {
  private static instance: PaydayReminderSystem
  private scheduledReminders: Map<string, NodeJS.Timeout> = new Map()
  private isInitialized = false

  static getInstance(): PaydayReminderSystem {
    if (!PaydayReminderSystem.instance) {
      PaydayReminderSystem.instance = new PaydayReminderSystem()
    }
    return PaydayReminderSystem.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Check for payday reminders every hour
      setInterval(() => {
        this.checkPaydayReminders()
      }, 60 * 60 * 1000) // Every hour

      // Also check immediately on initialization
      this.checkPaydayReminders()
      
      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize payday reminder system:', error)
    }
  }

  /**
   * Schedule a payday reminder for a user
   */
  async schedulePaydayReminder(config: PaydayReminderConfig): Promise<void> {
    try {
      const nextPayday = calculateNextPayday(config.payday, config.customDate)
      const reminderTime = this.getReminderTime(config.reminderTime || 'morning')
      
      // Set the reminder time on the payday
      const reminderDateTime = new Date(nextPayday)
      reminderDateTime.setHours(reminderTime.hours, reminderTime.minutes, 0, 0)

      // If the reminder time has already passed today, schedule for next payday
      if (reminderDateTime <= new Date()) {
        const nextMonthPayday = calculateNextPayday(config.payday, config.customDate)
        reminderDateTime.setFullYear(nextMonthPayday.getFullYear())
        reminderDateTime.setMonth(nextMonthPayday.getMonth())
        reminderDateTime.setDate(nextMonthPayday.getDate())
      }

      const reminderId = `payday_${config.userId}_${reminderDateTime.getTime()}`
      
      // Clear any existing reminder for this user
      this.clearPaydayReminder(config.userId)

      // Schedule the reminder
      const timeoutId = setTimeout(async () => {
        await this.triggerPaydayReminder(config)
        this.scheduledReminders.delete(config.userId)
      }, reminderDateTime.getTime() - Date.now())

      this.scheduledReminders.set(config.userId, timeoutId)

      console.log(`Payday reminder scheduled for ${config.userId} on ${reminderDateTime.toLocaleString()}`)
    } catch (error) {
      console.error('Failed to schedule payday reminder:', error)
    }
  }

  /**
   * Clear a scheduled payday reminder
   */
  clearPaydayReminder(userId: string): void {
    const existingTimeout = this.scheduledReminders.get(userId)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
      this.scheduledReminders.delete(userId)
    }
  }

  /**
   * Check if today is payday and trigger reminders
   */
  private async checkPaydayReminders(): Promise<void> {
    // This would typically check the database for all users with payday reminders enabled
    // For now, we'll just log that we're checking
    console.log('Checking for payday reminders...')
  }

  /**
   * Trigger a payday reminder
   */
  private async triggerPaydayReminder(config: PaydayReminderConfig): Promise<void> {
    try {
      const reminderData: PaydayReminderData = {
        userId: config.userId,
        payday: config.payday,
        nextPayday: calculateNextPayday(config.payday, config.customDate),
        expectedContribution: config.expectedContribution,
        currency: config.currency,
        partnershipId: config.partnershipId
      }

      await notificationSystem.schedulePaydayReminder(reminderData)
      
      // Schedule the next reminder
      await this.schedulePaydayReminder(config)
      
      console.log(`Payday reminder triggered for ${config.userId}`)
    } catch (error) {
      console.error('Failed to trigger payday reminder:', error)
    }
  }

  /**
   * Get reminder time based on preference
   */
  private getReminderTime(preference: 'morning' | 'afternoon' | 'evening'): { hours: number; minutes: number } {
    switch (preference) {
      case 'morning':
        return { hours: 9, minutes: 0 } // 9:00 AM
      case 'afternoon':
        return { hours: 14, minutes: 0 } // 2:00 PM
      case 'evening':
        return { hours: 18, minutes: 0 } // 6:00 PM
      default:
        return { hours: 9, minutes: 0 } // Default to morning
    }
  }

  /**
   * Check if a user should receive a payday reminder today
   */
  shouldReceiveReminderToday(userId: string, payday: string, customDate?: string): boolean {
    return isTodayPayday(payday, customDate)
  }

  /**
   * Get the next payday for a user
   */
  getNextPayday(payday: string, customDate?: string): Date {
    return calculateNextPayday(payday, customDate)
  }

  /**
   * Get all scheduled reminders (for debugging)
   */
  getScheduledReminders(): Map<string, NodeJS.Timeout> {
    return new Map(this.scheduledReminders)
  }

  /**
   * Clear all scheduled reminders
   */
  clearAllReminders(): void {
    this.scheduledReminders.forEach((timeout) => {
      clearTimeout(timeout)
    })
    this.scheduledReminders.clear()
  }
}

export const paydayReminderSystem = PaydayReminderSystem.getInstance()

/**
 * Utility function to set up payday reminders for a user
 */
export async function setupPaydayReminders(
  userId: string,
  profile: any,
  partnerships: any[]
): Promise<void> {
  if (!profile?.payday) return

  try {
    // Calculate expected contribution based on income and partnership
    let expectedContribution = 0
    
    if (partnerships.length > 0) {
      // In a real app, this would calculate based on shared expenses and income split
      expectedContribution = profile.income * 0.3 // Example: 30% of income
    }

    const config = {
      userId,
      payday: profile.payday,
      customDate: profile.customPayday,
      expectedContribution,
      currency: profile.currency || 'GBP',
      partnershipId: partnerships.length > 0 ? partnerships[0].id : undefined,
      reminderTime: 'morning' as const
    }

    await paydayReminderSystem.schedulePaydayReminder(config)
  } catch (error) {
    console.error('Failed to setup payday reminders:', error)
  }
}

/**
 * Utility function to check and trigger missed contribution alerts
 */
export async function checkMissedContributions(
  userId: string,
  profile: any,
  partnerships: any[],
  monthlyProgress: any
): Promise<void> {
  if (!profile?.payday || partnerships.length === 0) return

  try {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format
    const expectedAmount = profile.income * 0.3 // Example calculation
    const actualAmount = monthlyProgress?.totalContributed || 0

    if (actualAmount < expectedAmount) {
      // Dispatch missed contribution event
      document.dispatchEvent(new CustomEvent('missedContribution', {
        detail: {
          userId,
          expectedAmount,
          actualAmount,
          currency: profile.currency || 'GBP',
          month: currentMonth,
          partnershipId: partnerships[0].id
        }
      }))
    }
  } catch (error) {
    console.error('Failed to check missed contributions:', error)
  }
}
