/**
 * Contribution utilities for SplitSave
 * Handles monthly contribution calculations, payment tracking, and partner status
 */

export interface MonthlyContribution {
  id: string
  partnership_id: string
  month: string // YYYY-MM format
  user1_amount: number
  user2_amount: number
  user1_paid: boolean
  user2_paid: boolean
  user1_paid_date?: string
  user2_paid_date?: string
  total_required: number
  created_at: string
  updated_at: string
}

export interface ContributionBreakdown {
  expenses: number
  goals: number
  safetyPot: number
  total: number
  user1Share: number
  user2Share: number
  user1Income: number
  user2Income: number
  splitRatio: number // user1:user2 ratio
}

export interface ContributionStatus {
  month: string
  totalRequired: number
  userAmount: number
  partnerAmount: number
  userPaid: boolean
  partnerPaid: boolean
  userPaidDate?: string
  partnerPaidDate?: string
  status: 'pending' | 'partial' | 'complete' | 'overdue'
  daysUntilDue: number
  isOverdue: boolean
}

export interface ContributionSummary {
  currentMonth: ContributionStatus
  previousMonths: ContributionStatus[]
  totalContributed: number
  totalRequired: number
  completionRate: number
  streakMonths: number
}

/**
 * Calculate monthly contribution breakdown based on expenses, goals, and safety pot
 */
export function calculateMonthlyContribution(
  expenses: Array<{ amount: number; frequency: string }>,
  goals: Array<{ target_amount: number; current_amount: number; priority: number }>,
  safetyPotTarget: number,
  user1Income: number,
  user2Income: number,
  month: string = getCurrentMonth()
): ContributionBreakdown {
  // Calculate monthly expenses (handle different frequencies)
  const monthlyExpenses = expenses.reduce((total, expense) => {
    switch (expense.frequency) {
      case 'monthly':
        return total + expense.amount
      case 'weekly':
        return total + (expense.amount * 4.33) // Average weeks per month
      case 'yearly':
        return total + (expense.amount / 12)
      case 'quarterly':
        return total + (expense.amount / 4)
      default:
        return total + expense.amount
    }
  }, 0)

  // Calculate monthly goal contributions
  const monthlyGoals = goals.reduce((total, goal) => {
    if (goal.current_amount >= goal.target_amount) return total
    
    // Calculate monthly contribution needed (equal distribution for all goals)
    const remaining = goal.target_amount - goal.current_amount
    const monthlyContribution = remaining / 12
    
    return total + monthlyContribution
  }, 0)

  // Calculate safety pot contribution needed
  const safetyPotContribution = Math.max(0, safetyPotTarget - (monthlyExpenses * 3)) / 12

  const total = monthlyExpenses + monthlyGoals + safetyPotContribution

  // Calculate proportional split based on income
  const totalIncome = user1Income + user2Income
  const splitRatio = user1Income / totalIncome
  const user1Share = total * splitRatio
  const user2Share = total * (1 - splitRatio)

  return {
    expenses: monthlyExpenses,
    goals: monthlyGoals,
    safetyPot: safetyPotContribution,
    total,
    user1Share,
    user2Share,
    user1Income,
    user2Income,
    splitRatio
  }
}

/**
 * Get current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Get month name from YYYY-MM format
 */
export function getMonthName(monthString: string): string {
  const [year, month] = monthString.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Calculate contribution status for a specific month
 */
export function calculateContributionStatus(
  contribution: MonthlyContribution,
  currentUserId: string,
  partnerUserId: string
): ContributionStatus {
  const now = new Date()
  const monthDate = new Date(contribution.month + '-01')
  const daysUntilDue = Math.ceil((monthDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  const isOverdue = daysUntilDue < 0
  
  // For now, assume current user is user1 and partner is user2
  // This will be updated when we have proper user identification
  const userPaid = contribution.user1_paid
  const partnerPaid = contribution.user2_paid
  const userAmount = contribution.user1_amount
  const partnerAmount = contribution.user2_amount
  
  let status: ContributionStatus['status']
  if (userPaid && partnerPaid) {
    status = 'complete'
  } else if (userPaid || partnerPaid) {
    status = 'partial'
  } else if (isOverdue) {
    status = 'overdue'
  } else {
    status = 'pending'
  }

  return {
    month: contribution.month,
    totalRequired: contribution.total_required,
    userAmount,
    partnerAmount,
    userPaid,
    partnerPaid,
    userPaidDate: contribution.user1_paid_date,
    partnerPaidDate: contribution.user2_paid_date,
    status,
    daysUntilDue,
    isOverdue
  }
}

/**
 * Calculate contribution summary for dashboard
 */
export function calculateContributionSummary(
  contributions: MonthlyContribution[],
  currentUserId: string,
  partnerUserId: string
): ContributionSummary {
  if (contributions.length === 0) {
    return {
      currentMonth: {
        month: getCurrentMonth(),
        totalRequired: 0,
        userAmount: 0,
        partnerAmount: 0,
        userPaid: false,
        partnerPaid: false,
        status: 'pending',
        daysUntilDue: 0,
        isOverdue: false
      },
      previousMonths: [],
      totalContributed: 0,
      totalRequired: 0,
      completionRate: 0,
      streakMonths: 0
    }
  }

  // Sort contributions by month (newest first)
  const sortedContributions = contributions.sort((a, b) => b.month.localeCompare(a.month))
  
  // Current month
  const currentMonth = sortedContributions[0]
  const currentMonthStatus = calculateContributionStatus(currentMonth, currentUserId, partnerUserId)
  
  // Previous months
  const previousMonths = sortedContributions.slice(1).map(contribution => 
    calculateContributionStatus(contribution, currentUserId, partnerUserId)
  )
  
  // Calculate totals
  const totalContributed = contributions.reduce((total, contribution) => {
    const userPaid = contribution.user1_paid
    const userAmount = contribution.user1_amount
    return total + (userPaid ? userAmount : 0)
  }, 0)
  
  const totalRequired = contributions.reduce((total, contribution) => {
    const userAmount = contribution.user1_amount
    return total + userAmount
  }, 0)
  
  const completionRate = totalRequired > 0 ? (totalContributed / totalRequired) * 100 : 0
  
  // Calculate streak (consecutive months with complete contributions)
  let streakMonths = 0
  for (const contribution of sortedContributions) {
    const status = calculateContributionStatus(contribution, currentUserId, partnerUserId)
    if (status.status === 'complete') {
      streakMonths++
    } else {
      break
    }
  }
  
  return {
    currentMonth: currentMonthStatus,
    previousMonths,
    totalContributed,
    totalRequired,
    completionRate,
    streakMonths
  }
}

/**
 * Check if contribution is due soon (within 7 days)
 */
export function isContributionDueSoon(daysUntilDue: number): boolean {
  return daysUntilDue <= 7 && daysUntilDue >= 0
}

/**
 * Get contribution status color for UI
 */
export function getContributionStatusColor(status: ContributionStatus['status']): string {
  switch (status) {
    case 'complete':
      return 'text-green-600 dark:text-green-400'
    case 'partial':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'overdue':
      return 'text-red-600 dark:text-red-400'
    case 'pending':
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

/**
 * Get contribution status badge color for UI
 */
export function getContributionStatusBadgeColor(status: ContributionStatus['status']): string {
  switch (status) {
    case 'complete':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    case 'partial':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
    case 'overdue':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    case 'pending':
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
  }
}

/**
 * Format currency amount with proper formatting
 */
export function formatCurrency(amount: number, currencySymbol: string = '$'): string {
  return `${currencySymbol}${amount.toFixed(2)}`
}

/**
 * Get next month in YYYY-MM format
 */
export function getNextMonth(currentMonth: string): string {
  const [year, month] = currentMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  date.setMonth(date.getMonth() + 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Get previous month in YYYY-MM format
 */
export function getPreviousMonth(currentMonth: string): string {
  const [year, month] = currentMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  date.setMonth(date.getMonth() - 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

