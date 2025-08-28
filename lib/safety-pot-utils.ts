/**
 * Safety Pot utilities for SplitSave
 * Handles emergency buffer calculations, fund reallocation suggestions, and safety net management
 */

export interface SafetyPotConfig {
  targetMonths: number // How many months of expenses to keep in safety pot
  minAmount: number // Minimum amount to maintain
  maxAmount: number // Maximum amount before suggesting reallocation
  reallocationThreshold: number // Percentage of excess to suggest reallocating
}

export interface SafetyPotStatus {
  currentAmount: number
  targetAmount: number
  monthlyExpenses: number
  monthsCovered: number
  status: 'low' | 'adequate' | 'excess' | 'critical'
  message: string
  suggestions: string[]
  reallocationAmount: number
}

export interface FundReallocationSuggestion {
  type: 'safety-pot' | 'savings-goals' | 'emergency-fund'
  amount: number
  priority: 'high' | 'medium' | 'low'
  reason: string
  impact: string
}

// Default safety pot configuration
export const DEFAULT_SAFETY_POT_CONFIG: SafetyPotConfig = {
  targetMonths: 3, // Keep 3 months of expenses
  minAmount: 500, // Minimum $500
  maxAmount: 10000, // Maximum $10,000 before suggesting reallocation
  reallocationThreshold: 0.7 // Suggest reallocating 70% of excess
}

/**
 * Calculate the current safety pot status
 */
export function calculateSafetyPotStatus(
  currentAmount: number,
  monthlyExpenses: number,
  config: Partial<SafetyPotConfig> = {}
): SafetyPotStatus {
  const finalConfig = { ...DEFAULT_SAFETY_POT_CONFIG, ...config }
  
  const targetAmount = Math.max(
    monthlyExpenses * finalConfig.targetMonths,
    finalConfig.minAmount
  )
  
  const monthsCovered = monthlyExpenses > 0 ? currentAmount / monthlyExpenses : 0
  
  let status: SafetyPotStatus['status']
  let message: string
  let suggestions: string[] = []
  let reallocationAmount = 0
  
  if (currentAmount < finalConfig.minAmount) {
    status = 'critical'
    message = 'Your safety pot is critically low. Consider adding funds immediately.'
    suggestions = [
      'Add funds to reach minimum safety amount',
      'Review monthly expenses to reduce costs',
      'Consider temporary contribution increase'
    ]
  } else if (monthsCovered < 1) {
    status = 'low'
    message = 'Your safety pot covers less than 1 month of expenses. Consider adding funds.'
    suggestions = [
      'Add funds to reach 3-month coverage',
      'Review and reduce monthly expenses',
      'Set up automatic monthly contributions'
    ]
  } else if (monthsCovered < finalConfig.targetMonths) {
    status = 'adequate'
    message = `Your safety pot covers ${monthsCovered.toFixed(1)} months. Aim for ${finalConfig.targetMonths} months coverage.`
    suggestions = [
      'Continue building towards 3-month coverage',
      'Consider increasing monthly contributions',
      'Monitor expenses to maintain target'
    ]
  } else if (currentAmount > finalConfig.maxAmount) {
    status = 'excess'
    const excess = currentAmount - finalConfig.maxAmount
    reallocationAmount = excess * finalConfig.reallocationThreshold
    message = `Your safety pot has excess funds. Consider reallocating ${reallocationAmount.toFixed(0)} to savings goals.`
    suggestions = [
      'Reallocate excess funds to savings goals',
      'Increase monthly savings contributions',
      'Consider early goal completion'
    ]
  } else {
    status = 'adequate'
    message = `Your safety pot is well-funded, covering ${monthsCovered.toFixed(1)} months of expenses.`
    suggestions = [
      'Maintain current funding level',
      'Monitor expenses for changes',
      'Consider goal-based savings'
    ]
  }
  
  return {
    currentAmount,
    targetAmount,
    monthlyExpenses,
    monthsCovered,
    status,
    message,
    suggestions,
    reallocationAmount
  }
}

/**
 * Generate fund reallocation suggestions based on safety pot status
 */
export function generateReallocationSuggestions(
  safetyPotStatus: SafetyPotStatus,
  savingsGoals: Array<{ id: string; name: string; current_amount: number; target_amount: number; priority: number }>,
  availableFunds: number
): FundReallocationSuggestion[] {
  const suggestions: FundReallocationSuggestion[] = []
  
  // If safety pot has excess, suggest reallocation
  if (safetyPotStatus.status === 'excess' && safetyPotStatus.reallocationAmount > 0) {
    suggestions.push({
      type: 'safety-pot',
      amount: safetyPotStatus.reallocationAmount,
      priority: 'high',
      reason: 'Safety pot exceeds maximum recommended amount',
      impact: `Free up ${safetyPotStatus.reallocationAmount.toFixed(0)} for other financial goals`
    })
  }
  
  // Suggest reallocation to savings goals
  if (availableFunds > 0) {
    const incompleteGoals = savingsGoals
      .filter(goal => goal.current_amount < goal.target_amount)
      .sort((a, b) => (a.target_amount - a.current_amount) - (b.target_amount - b.current_amount)) // Sort by remaining amount
    
    incompleteGoals.forEach(goal => {
      const remaining = goal.target_amount - goal.current_amount
      const suggestedAmount = Math.min(remaining, availableFunds * 0.4) // Suggest 40% of available funds
      
      if (suggestedAmount > 0) {
        suggestions.push({
          type: 'savings-goals',
          amount: suggestedAmount,
          priority: 'medium',
          reason: `Savings goal: ${goal.name}`,
          impact: `Progress: ${((goal.current_amount + suggestedAmount) / goal.target_amount * 100).toFixed(1)}%`
        })
      }
    })
  }
  
  // Sort suggestions by priority and amount
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return b.amount - a.amount
  })
}

/**
 * Calculate optimal monthly contribution to safety pot
 */
export function calculateOptimalSafetyPotContribution(
  currentAmount: number,
  monthlyExpenses: number,
  targetMonths: number = 3,
  monthsToTarget: number = 12
): number {
  const targetAmount = monthlyExpenses * targetMonths
  const deficit = Math.max(0, targetAmount - currentAmount)
  
  if (deficit <= 0) {
    return 0 // Already at target
  }
  
  // Calculate monthly contribution needed to reach target in specified months
  const monthlyContribution = deficit / monthsToTarget
  
  // Cap at 20% of monthly expenses to avoid over-contributing
  const maxContribution = monthlyExpenses * 0.2
  
  return Math.min(monthlyContribution, maxContribution)
}

/**
 * Check if safety pot needs immediate attention
 */
export function needsImmediateAttention(safetyPotStatus: SafetyPotStatus): boolean {
  return safetyPotStatus.status === 'critical' || safetyPotStatus.monthsCovered < 1
}

/**
 * Get safety pot health score (0-100)
 */
export function getSafetyPotHealthScore(safetyPotStatus: SafetyPotStatus): number {
  const { monthsCovered, status } = safetyPotStatus
  
  if (status === 'critical') return 0
  if (status === 'low') return Math.min(50, monthsCovered * 25)
  if (status === 'adequate') return 50 + Math.min(40, (monthsCovered - 1) * 20)
  if (status === 'excess') return 90 + Math.min(10, Math.max(0, 6 - monthsCovered) * 5)
  
  return 100
}

/**
 * Generate monthly safety pot report
 */
export function generateMonthlyReport(
  safetyPotStatus: SafetyPotStatus,
  previousMonthAmount: number,
  currentAmount: number,
  contributions: number,
  withdrawals: number
): {
  summary: string
  changes: string[]
  recommendations: string[]
} {
  const change = currentAmount - previousMonthAmount
  const changePercent = previousMonthAmount > 0 ? (change / previousMonthAmount) * 100 : 0
  
  const summary = `Safety pot ${change >= 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(2)} (${changePercent.toFixed(1)}%) this month.`
  
  const changes = []
  if (contributions > 0) changes.push(`Added: ${contributions.toFixed(2)}`)
  if (withdrawals > 0) changes.push(`Withdrew: ${withdrawals.toFixed(2)}`)
  if (change !== contributions - withdrawals) {
    changes.push(`Other changes: ${(change - (contributions - withdrawals)).toFixed(2)}`)
  }
  
  const recommendations = [...safetyPotStatus.suggestions]
  
  // Add month-specific recommendations
  if (safetyPotStatus.status === 'critical') {
    recommendations.unshift('URGENT: Add funds to safety pot immediately')
  } else if (safetyPotStatus.monthsCovered < 2) {
    recommendations.unshift('Consider increasing monthly safety pot contributions')
  }
  
  return { summary, changes, recommendations }
}
