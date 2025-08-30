/**
 * Monthly Progress utilities for SplitSave
 * Handles monthly progress tracking, analytics, and partner accountability
 */

export interface MonthlyProgressData {
  month: string // YYYY-MM format
  year: number
  monthNumber: number
  monthName: string
  totalExpected: number
  totalActual: number
  userContribution: number
  partnerContribution: number
  overUnderAmount: number
  overUnderPercentage: number
  status: 'on-track' | 'behind' | 'ahead' | 'completed'
  goalsProgress: GoalProgress[]
  expensesCovered: number
  safetyPotContribution: number
  notes?: string
  lastUpdated: string
}

export interface GoalProgress {
  goalId: string
  goalName: string
  targetAmount: number
  currentAmount: number
  monthlyTarget: number
  actualContribution: number
  progress: number
  status: 'on-track' | 'behind' | 'ahead' | 'completed'
}

export interface MonthlyTrends {
  averageMonthlyContribution: number
  contributionGrowthRate: number
  consistencyScore: number
  bestMonth: string
  worstMonth: string
  totalMonthsTracked: number
  monthsOnTrack: number
  monthsBehind: number
  monthsAhead: number
}

export interface PartnerAccountability {
  partnerId: string
  partnerName: string
  monthlyContributions: number[]
  consistencyScore: number
  lastContributionDate: string
  averageContribution: number
  reliabilityRating: 'excellent' | 'good' | 'fair' | 'poor'
  nextExpectedContribution: string
}

export interface ProgressInsights {
  financialHealth: 'excellent' | 'good' | 'fair' | 'needs-attention'
  recommendations: string[]
  nextMonthProjection: number
  riskFactors: string[]
  opportunities: string[]
}

/**
 * Calculate comprehensive monthly progress data
 */
export function calculateMonthlyProgress(
  month: string,
  contributions: any[],
  goals: any[],
  expenses: any[],
  safetyPotAmount: number,
  userProfile: any,
  partnerProfile: any
): MonthlyProgressData {
  const [year, monthNum] = month.split('-').map(Number)
  const monthName = getMonthNameFromNumber(monthNum)
  
  // Get monthly contributions
  const monthlyContributions = contributions.filter(c => {
    const contributionMonth = new Date(c.created_at).toISOString().substring(0, 7)
    return contributionMonth === month
  })

  // Calculate expected monthly amount
  const totalExpected = calculateExpectedMonthlyAmount(expenses, goals, safetyPotAmount, userProfile, partnerProfile)
  
  // Calculate actual contributions
  const userContribution = monthlyContributions
    .filter(c => c.user_id === userProfile.id)
    .reduce((sum, c) => sum + (c.amount || 0), 0)
  
  const partnerContribution = monthlyContributions
    .filter(c => c.user_id === partnerProfile.id)
    .reduce((sum, c) => sum + (c.amount || 0), 0)
  
  const totalActual = userContribution + partnerContribution
  
  // Calculate over/under
  const overUnderAmount = totalActual - totalExpected
  const overUnderPercentage = totalExpected > 0 ? (overUnderAmount / totalExpected) * 100 : 0
  
  // Determine status
  const status = determineProgressStatus(overUnderPercentage, totalActual, totalExpected)
  
  // Calculate goal progress
  const goalsProgress = calculateGoalsProgress(goals, monthlyContributions, month)
  
  // Calculate expenses covered
  const expensesCovered = calculateExpensesCovered(expenses, totalActual)
  
  // Calculate safety pot contribution
  const safetyPotContribution = calculateSafetyPotContribution(totalActual, totalExpected, safetyPotAmount)

  return {
    month,
    year,
    monthNumber: monthNum,
    monthName,
    totalExpected,
    totalActual,
    userContribution,
    partnerContribution,
    overUnderAmount,
    overUnderPercentage,
    status,
    goalsProgress,
    expensesCovered,
    safetyPotContribution,
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Calculate expected monthly amount based on expenses, goals, and safety pot
 */
function calculateExpectedMonthlyAmount(
  expenses: any[],
  goals: any[],
  safetyPotAmount: number,
  userProfile: any,
  partnerProfile: any
): number {
  // Monthly expenses
  const monthlyExpenses = expenses
    .filter(e => e.status === 'active')
    .reduce((sum, e) => {
      if (e.frequency === 'monthly') return sum + e.amount
      if (e.frequency === 'yearly') return sum + (e.amount / 12)
      if (e.frequency === 'weekly') return sum + (e.amount * 4.33)
      return sum + e.amount
    }, 0)

  // Monthly goal contributions
  const monthlyGoalContributions = goals
    .filter(g => g.status === 'active')
    .reduce((sum, g) => {
      const remaining = g.target_amount - g.current_amount
      const monthsToTarget = Math.max(1, g.target_date ? 
        monthsBetween(new Date(), new Date(g.target_date)) : 12)
      return sum + (remaining / monthsToTarget)
    }, 0)

  // Safety pot target (6 months of expenses)
  const safetyPotTarget = monthlyExpenses * 6
  const safetyPotMonthly = safetyPotAmount < safetyPotTarget ? 
    (safetyPotTarget - safetyPotAmount) / 12 : 0

  return monthlyExpenses + monthlyGoalContributions + safetyPotMonthly
}

/**
 * Calculate goal progress for the month
 */
function calculateGoalsProgress(goals: any[], monthlyContributions: any[], month: string): GoalProgress[] {
  return goals.map(goal => {
    const monthlyTarget = goal.monthly_target || 0
    const actualContribution = monthlyContributions
      .filter(c => c.goal_id === goal.id)
      .reduce((sum, c) => sum + (c.amount || 0), 0)
    
    const progress = monthlyTarget > 0 ? (actualContribution / monthlyTarget) * 100 : 0
    const status = determineGoalStatus(progress, actualContribution, monthlyTarget)

    return {
      goalId: goal.id,
      goalName: goal.name,
      targetAmount: goal.target_amount,
      currentAmount: goal.current_amount,
      monthlyTarget,
      actualContribution,
      progress,
      status
    }
  })
}

/**
 * Calculate expenses covered by contributions
 */
function calculateExpensesCovered(expenses: any[], totalActual: number): number {
  const monthlyExpenses = expenses
    .filter(e => e.status === 'active')
    .reduce((sum, e) => {
      if (e.frequency === 'monthly') return sum + e.amount
      if (e.frequency === 'yearly') return sum + (e.amount / 12)
      if (e.frequency === 'weekly') return sum + (e.amount * 4.33)
      return sum + e.amount
    }, 0)

  return Math.min(totalActual, monthlyExpenses)
}

/**
 * Calculate safety pot contribution
 */
function calculateSafetyPotContribution(totalActual: number, totalExpected: number, currentSafetyPot: number): number {
  if (totalActual <= totalExpected) return 0
  
  const excess = totalActual - totalExpected
  const safetyPotTarget = totalExpected * 6 // 6 months buffer
  const safetyPotNeeded = Math.max(0, safetyPotTarget - currentSafetyPot)
  
  return Math.min(excess, safetyPotNeeded)
}

/**
 * Determine overall progress status
 */
function determineProgressStatus(overUnderPercentage: number, actual: number, expected: number): MonthlyProgressData['status'] {
  if (actual >= expected) return 'completed'
  if (overUnderPercentage >= -10) return 'on-track'
  if (overUnderPercentage >= -25) return 'behind'
  return 'behind'
}

/**
 * Determine goal progress status
 */
function determineGoalStatus(progress: number, actual: number, target: number): GoalProgress['status'] {
  if (actual >= target) return 'completed'
  if (progress >= 90) return 'on-track'
  if (progress >= 75) return 'ahead'
  if (progress >= 50) return 'behind'
  return 'behind'
}

/**
 * Calculate monthly trends from historical data
 */
export function calculateMonthlyTrends(monthlyData: MonthlyProgressData[]): MonthlyTrends {
  if (monthlyData.length === 0) {
    return {
      averageMonthlyContribution: 0,
      contributionGrowthRate: 0,
      consistencyScore: 0,
      bestMonth: '',
      worstMonth: '',
      totalMonthsTracked: 0,
      monthsOnTrack: 0,
      monthsBehind: 0,
      monthsAhead: 0
    }
  }

  // Sort by month (newest first)
  const sortedData = monthlyData.sort((a, b) => b.month.localeCompare(a.month))
  
  // Calculate averages and counts
  const totalContributions = sortedData.reduce((sum, d) => sum + d.totalActual, 0)
  const averageMonthlyContribution = totalContributions / sortedData.length
  
  // Calculate growth rate (comparing last 3 months to previous 3 months)
  let contributionGrowthRate = 0
  if (sortedData.length >= 6) {
    const recent3Months = sortedData.slice(0, 3).reduce((sum, d) => sum + d.totalActual, 0) / 3
    const previous3Months = sortedData.slice(3, 6).reduce((sum, d) => sum + d.totalActual, 0) / 3
    contributionGrowthRate = previous3Months > 0 ? ((recent3Months - previous3Months) / previous3Months) * 100 : 0
  }

  // Calculate consistency score
  const monthsOnTrack = sortedData.filter(d => d.status === 'on-track' || d.status === 'completed').length
  const monthsBehind = sortedData.filter(d => d.status === 'behind').length
  const monthsAhead = sortedData.filter(d => d.status === 'ahead').length
  const consistencyScore = (monthsOnTrack / sortedData.length) * 100

  // Find best and worst months
  const bestMonth = sortedData.reduce((best, current) => 
    current.totalActual > best.totalActual ? current : best
  ).monthName

  const worstMonth = sortedData.reduce((worst, current) => 
    current.totalActual < worst.totalActual ? current : worst
  ).monthName

  return {
    averageMonthlyContribution,
    contributionGrowthRate,
    consistencyScore,
    bestMonth,
    worstMonth,
    totalMonthsTracked: sortedData.length,
    monthsOnTrack,
    monthsBehind,
    monthsAhead
  }
}

/**
 * Calculate partner accountability metrics
 */
export function calculatePartnerAccountability(
  partnerId: string,
  partnerName: string,
  monthlyData: MonthlyProgressData[],
  contributions: any[]
): PartnerAccountability {
  const partnerContributions = monthlyData.map(d => d.partnerContribution)
  const averageContribution = partnerContributions.reduce((sum, c) => sum + c, 0) / partnerContributions.length
  
  // Calculate consistency score
  const consistentMonths = partnerContributions.filter(c => c > 0).length
  const consistencyScore = monthlyData.length > 0 ? (consistentMonths / monthlyData.length) * 100 : 0
  
  // Find last contribution date
  const lastContribution = contributions
    .filter(c => c.user_id === partnerId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
  
  const lastContributionDate = lastContribution?.created_at || ''
  
  // Calculate reliability rating
  let reliabilityRating: PartnerAccountability['reliabilityRating'] = 'poor'
  if (consistencyScore >= 90) reliabilityRating = 'excellent'
  else if (consistencyScore >= 75) reliabilityRating = 'good'
  else if (consistencyScore >= 50) reliabilityRating = 'fair'
  
  // Calculate next expected contribution
  const nextExpectedContribution = calculateNextExpectedContribution(lastContributionDate, averageContribution)

  return {
    partnerId,
    partnerName,
    monthlyContributions: partnerContributions,
    consistencyScore,
    lastContributionDate,
    averageContribution,
    reliabilityRating,
    nextExpectedContribution
  }
}

/**
 * Generate progress insights and recommendations
 */
export function generateProgressInsights(
  monthlyData: MonthlyProgressData[],
  trends: MonthlyTrends,
  partnerAccountability: PartnerAccountability
): ProgressInsights {
  const insights: ProgressInsights = {
    financialHealth: 'good',
    recommendations: [],
    nextMonthProjection: 0,
    riskFactors: [],
    opportunities: []
  }

  // Determine financial health
  if (trends.consistencyScore >= 90 && trends.contributionGrowthRate >= 0) {
    insights.financialHealth = 'excellent'
  } else if (trends.consistencyScore >= 75 && trends.contributionGrowthRate >= -5) {
    insights.financialHealth = 'good'
  } else if (trends.consistencyScore >= 50) {
    insights.financialHealth = 'fair'
  } else {
    insights.financialHealth = 'needs-attention'
  }

  // Generate recommendations
  if (trends.consistencyScore < 80) {
    insights.recommendations.push('Set up monthly reminders to improve contribution consistency')
  }
  
  if (trends.contributionGrowthRate < 0) {
    insights.recommendations.push('Review your budget to identify areas for increased savings')
  }
  
  if (partnerAccountability.reliabilityRating === 'poor') {
    insights.recommendations.push('Have a conversation with your partner about contribution expectations')
  }

  // Calculate next month projection
  const recentMonths = monthlyData.slice(0, 3)
  if (recentMonths.length > 0) {
    const recentAverage = recentMonths.reduce((sum, d) => sum + d.totalActual, 0) / recentMonths.length
    insights.nextMonthProjection = recentAverage * (1 + (trends.contributionGrowthRate / 100))
  }

  // Identify risk factors
  if (trends.monthsBehind > trends.monthsOnTrack) {
    insights.riskFactors.push('Consistently falling behind monthly targets')
  }
  
  if (partnerAccountability.consistencyScore < 70) {
    insights.riskFactors.push('Partner contribution inconsistency may affect joint goals')
  }

  // Identify opportunities
  if (trends.contributionGrowthRate > 0) {
    insights.opportunities.push('Your savings rate is improving - consider increasing goal targets')
  }
  
  if (trends.consistencyScore > 85) {
    insights.opportunities.push('Excellent consistency - you could take on more ambitious financial goals')
  }

  return insights
}

/**
 * Calculate months between two dates
 */
function monthsBetween(date1: Date, date2: Date): number {
  return (date2.getFullYear() - date1.getFullYear()) * 12 + 
         (date2.getMonth() - date1.getMonth())
}

/**
 * Calculate next expected contribution date
 */
function calculateNextExpectedContribution(lastContributionDate: string, averageContribution: number): string {
  if (!lastContributionDate) return 'Unknown'
  
  const lastDate = new Date(lastContributionDate)
  const nextDate = new Date(lastDate)
  nextDate.setMonth(nextDate.getMonth() + 1)
  
  return nextDate.toISOString().split('T')[0]
}

/**
 * Get month name from month number
 */
function getMonthNameFromNumber(monthNumber: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[monthNumber - 1] || 'Unknown'
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Get status color for progress indicators
 */
export function getProgressStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 dark:text-green-400'
    case 'on-track':
      return 'text-blue-600 dark:text-blue-400'
    case 'ahead':
      return 'text-purple-600 dark:text-purple-400'
    case 'behind':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

/**
 * Get status background color
 */
export function getProgressStatusBgColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    case 'on-track':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    case 'ahead':
      return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
    case 'behind':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    default:
      return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
  }
}
