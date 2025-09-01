/**
 * Payday calculation utilities for SplitSave
 * Handles advanced payday options like "last Friday of month" and "last working day"
 */

export interface PaydayOption {
  value: string
  label: string
  type: 'fixed' | 'relative' | 'custom'
}

export const PAYDAY_OPTIONS: PaydayOption[] = [
  { value: '1', label: '1st of month', type: 'fixed' },
  { value: '15', label: '15th of month', type: 'fixed' },
  { value: 'last-friday', label: 'Last Friday of month', type: 'relative' },
  { value: 'last-working-day', label: 'Last working day of month', type: 'relative' },
  { value: 'custom', label: 'Custom date', type: 'custom' },
]

/**
 * Calculate the next payday based on the payday option
 */
export function calculateNextPayday(paydayOption: string, customDate?: string): Date {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  
  switch (paydayOption) {
    case '1':
      return getNextMonthDate(1, currentMonth, currentYear)
    
    case '15':
      return getNextMonthDate(15, currentMonth, currentYear)
    
    case 'last-friday':
      return getLastFridayOfMonth(currentMonth, currentYear)
    
    case 'last-working-day':
      return getLastWorkingDayOfMonth(currentMonth, currentYear)
    
    case 'custom':
      if (customDate) {
        return calculateCustomPayday(customDate, currentMonth, currentYear)
      }
      // Fallback to 1st of month if no custom date
      return getNextMonthDate(1, currentMonth, currentYear)
    
    default:
      // If it's a number, treat as day of month
      const day = parseInt(paydayOption)
      if (!isNaN(day) && day >= 1 && day <= 31) {
        return getNextMonthDate(day, currentMonth, currentYear)
      }
      // Fallback to 1st of month
      return getNextMonthDate(1, currentMonth, currentYear)
  }
}

/**
 * Get the next occurrence of a specific day in a month
 */
function getNextMonthDate(day: number, currentMonth: number, currentYear: number): Date {
  const currentDate = new Date()
  let targetMonth = currentMonth
  let targetYear = currentYear
  
  // If we're past this day this month, move to next month
  if (currentDate.getDate() >= day) {
    targetMonth++
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear++
    }
  }
  
  const nextPayday = new Date(targetYear, targetMonth, day)
  
  // Adjust for months with fewer days (e.g., Feb 30th becomes Feb 28th/29th)
  while (nextPayday.getMonth() !== targetMonth) {
    nextPayday.setDate(nextPayday.getDate() - 1)
  }
  
  return nextPayday
}

/**
 * Get the last Friday of the current or next month
 */
function getLastFridayOfMonth(currentMonth: number, currentYear: number): Date {
  const currentDate = new Date()
  let targetMonth = currentMonth
  let targetYear = currentYear
  
  // If we're past the last Friday this month, move to next month
  const lastFridayThisMonth = getLastFridayOfSpecificMonth(currentMonth, currentYear)
  if (currentDate > lastFridayThisMonth) {
    targetMonth++
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear++
    }
  }
  
  return getLastFridayOfSpecificMonth(targetMonth, targetYear)
}

/**
 * Get the last Friday of a specific month
 */
function getLastFridayOfSpecificMonth(month: number, year: number): Date {
  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const lastDayOfWeek = lastDay.getDay()
  
  // Calculate days to subtract to get to Friday (5)
  let daysToSubtract = (lastDayOfWeek - 5 + 7) % 7
  if (daysToSubtract === 0 && lastDayOfWeek !== 5) {
    daysToSubtract = 7
  }
  
  const lastFriday = new Date(lastDay)
  lastFriday.setDate(lastDay.getDate() - daysToSubtract)
  
  return lastFriday
}

/**
 * Get the last working day of the current or next month
 */
function getLastWorkingDayOfMonth(currentMonth: number, currentYear: number): Date {
  const currentDate = new Date()
  let targetMonth = currentMonth
  let targetYear = currentYear
  
  // If we're past the last working day this month, move to next month
  const lastWorkingDayThisMonth = getLastWorkingDayOfSpecificMonth(currentMonth, currentYear)
  if (currentDate > lastWorkingDayThisMonth) {
    targetMonth++
    if (targetMonth > 11) {
      targetMonth = 0
      targetYear++
    }
  }
  
  return getLastWorkingDayOfSpecificMonth(targetMonth, targetYear)
}

/**
 * Get the last working day of a specific month
 */
function getLastWorkingDayOfSpecificMonth(month: number, year: number): Date {
  // Get the last day of the month
  const lastDay = new Date(year, month + 1, 0)
  const currentDay = new Date(lastDay)
  
  // Go backwards until we find a working day (Monday-Friday)
  while (currentDay.getDay() === 0 || currentDay.getDay() === 6) { // Sunday = 0, Saturday = 6
    currentDay.setDate(currentDay.getDate() - 1)
  }
  
  return currentDay
}

/**
 * Calculate custom payday based on a specific date string
 */
function calculateCustomPayday(customDate: string, currentMonth: number, currentYear: number): Date {
  // Parse custom date (format: "DD" or "DD-MM")
  const parts = customDate.split('-')
  let day: number
  let month: number
  
  if (parts.length === 1) {
    // Just day number
    day = parseInt(parts[0])
    month = currentMonth
  } else if (parts.length === 2) {
    // Day and month
    day = parseInt(parts[0])
    month = parseInt(parts[1]) - 1 // Month is 0-indexed
  } else {
    // Invalid format, fallback to 1st of month
    return getNextMonthDate(1, currentMonth, currentYear)
  }
  
  // Validate day and month
  if (isNaN(day) || day < 1 || day > 31 || isNaN(month) || month < 0 || month > 11) {
    return getNextMonthDate(1, currentMonth, currentYear)
  }
  
  return getNextMonthDate(day, month, currentYear)
}

/**
 * Get a human-readable description of when the next payday is
 */
export function getNextPaydayDescription(paydayOption: string, customDate?: string): string {
  const nextPayday = calculateNextPayday(paydayOption, customDate)
  const now = new Date()
  const diffTime = nextPayday.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today!'
  } else if (diffDays === 1) {
    return 'Tomorrow'
  } else if (diffDays < 0) {
    return 'Overdue'
  } else {
    return `In ${diffDays} day${diffDays === 1 ? '' : 's'}`
  }
}

/**
 * Check if today is payday
 */
export function isTodayPayday(paydayOption: string, customDate?: string): boolean {
  const nextPayday = calculateNextPayday(paydayOption, customDate)
  const today = new Date()
  
  return nextPayday.toDateString() === today.toDateString()
}

/**
 * Get the number of days until next payday
 */
export function getDaysUntilPayday(paydayOption: string, customDate?: string): number {
  const nextPayday = calculateNextPayday(paydayOption, customDate)
  const now = new Date()
  const diffTime = nextPayday.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Validate payday option
 */
export function validatePaydayOption(paydayOption: string): { isValid: boolean; error?: string } {
  if (!paydayOption) {
    return { isValid: false, error: 'Payday option is required' }
  }

  // Check if it's a predefined option
  const predefinedOption = PAYDAY_OPTIONS.find(opt => opt.value === paydayOption)
  if (predefinedOption) {
    return { isValid: true }
  }

  // Check if it's a valid day number (1-31)
  const dayNumber = parseInt(paydayOption)
  if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
    return { isValid: true }
  }

  // Check if it's a valid custom date format
  if (paydayOption.includes('-')) {
    const parts = paydayOption.split('-')
    if (parts.length === 2) {
      const day = parseInt(parts[0])
      const month = parseInt(parts[1])
      if (!isNaN(day) && !isNaN(month) && day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        return { isValid: true }
      }
    }
  }

  return { isValid: false, error: 'Invalid payday option format' }
}

/**
 * Get a detailed explanation of a payday option
 */
export function getPaydayExplanation(paydayOption: string): string {
  switch (paydayOption) {
    case 'last-friday':
      return 'You will be reminded on the last Friday of each month'
    case 'last-working-day':
      return 'You will be reminded on the last working day (Monday-Friday) of each month'
    case '1':
      return 'You will be reminded on the 1st of each month'
    case '15':
      return 'You will be reminded on the 15th of each month'
    case 'custom':
      return 'You will be reminded on your custom date'
    default:
      const dayNumber = parseInt(paydayOption)
      if (!isNaN(dayNumber) && dayNumber >= 1 && dayNumber <= 31) {
        const suffix = getDayNumberSuffix(dayNumber)
        return `You will be reminded on the ${dayNumber}${suffix} of each month`
      }
      return 'Custom payday schedule'
  }
}

/**
 * Get ordinal suffix for day numbers (1st, 2nd, 3rd, etc.)
 */
function getDayNumberSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

/**
 * Get upcoming paydays for preview (next 3 months)
 */
export function getUpcomingPaydays(paydayOption: string, customDate?: string): Date[] {
  const upcomingPaydays: Date[] = []
  const currentDate = new Date()
  
  for (let i = 0; i < 3; i++) {
    const targetMonth = currentDate.getMonth() + i
    const targetYear = currentDate.getFullYear() + Math.floor(targetMonth / 12)
    const adjustedMonth = targetMonth % 12
    
    try {
      let payday: Date
      
      switch (paydayOption) {
        case 'last-friday':
          payday = getLastFridayOfSpecificMonth(adjustedMonth, targetYear)
          break
        case 'last-working-day':
          payday = getLastWorkingDayOfSpecificMonth(adjustedMonth, targetYear)
          break
        default:
          const day = parseInt(paydayOption)
          if (!isNaN(day)) {
            payday = new Date(targetYear, adjustedMonth, day)
            // Adjust for months with fewer days
            while (payday.getMonth() !== adjustedMonth) {
              payday.setDate(payday.getDate() - 1)
            }
          } else {
            continue
          }
      }
      
      // Only include future paydays or today
      if (payday >= currentDate || payday.toDateString() === currentDate.toDateString()) {
        upcomingPaydays.push(payday)
      }
    } catch (error) {
      console.warn(`Error calculating payday for month ${adjustedMonth}:`, error)
    }
  }
  
  return upcomingPaydays.slice(0, 3) // Ensure we only return 3 paydays
}
