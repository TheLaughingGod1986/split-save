export interface GoalCalculation {
  daysRemaining: number
  monthsRemaining: number
  weeklyContribution: number
  monthlyContribution: number
  isOverdue: boolean
  isCompleted: boolean
  progressPercentage: number
}

export interface RedistributionPlan {
  goalId: string
  currentAmount: number
  targetAmount: number
  excessAmount: number
  newTargetAmount: number
  redistributionAmount: number
}

export function calculateGoalProgress(goal: any): GoalCalculation {
  const currentAmount = goal.current_amount || 0
  const targetAmount = goal.target_amount || 0
  const targetDate = goal.target_date ? new Date(goal.target_date) : null
  
  const progressPercentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0
  const isCompleted = progressPercentage >= 100
  
  let daysRemaining = 0
  let monthsRemaining = 0
  let weeklyContribution = 0
  let monthlyContribution = 0
  let isOverdue = false
  
  if (targetDate) {
    const today = new Date()
    const timeDiff = targetDate.getTime() - today.getTime()
    daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24))
    monthsRemaining = Math.ceil(daysRemaining / 30)
    
    if (daysRemaining < 0) {
      isOverdue = true
      daysRemaining = Math.abs(daysRemaining)
    }
    
    if (daysRemaining > 0) {
      const remainingAmount = targetAmount - currentAmount
      weeklyContribution = remainingAmount / (daysRemaining / 7)
      monthlyContribution = remainingAmount / (daysRemaining / 30)
    }
  }
  
  return {
    daysRemaining,
    monthsRemaining,
    weeklyContribution,
    monthlyContribution,
    isOverdue,
    isCompleted,
    progressPercentage
  }
}

export function calculateSmartRedistribution(goals: any[]): RedistributionPlan[] {
  const completedGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal)
    return progress.isCompleted
  })
  
  const activeGoals = goals.filter(goal => {
    const progress = calculateGoalProgress(goal)
    return !progress.isCompleted
  })
  
  if (completedGoals.length === 0 || activeGoals.length === 0) {
    return []
  }
  
  // Calculate total excess from completed goals
  let totalExcess = 0
  completedGoals.forEach(goal => {
    const excess = goal.current_amount - goal.target_amount
    if (excess > 0) {
      totalExcess += excess
    }
  })
  
  if (totalExcess <= 0) {
    return []
  }
  
  // Calculate redistribution based on priority and remaining amounts
  const redistributionPlans: RedistributionPlan[] = []
  
  activeGoals.forEach(goal => {
    const remainingAmount = goal.target_amount - goal.current_amount
    if (remainingAmount > 0) {
      // Distribute excess proportionally based on remaining amounts
      const totalRemaining = activeGoals.reduce((sum, g) => sum + (g.target_amount - g.current_amount), 0)
      const redistributionAmount = (remainingAmount / totalRemaining) * totalExcess
      
      redistributionPlans.push({
        goalId: goal.id,
        currentAmount: goal.current_amount,
        targetAmount: goal.target_amount,
        excessAmount: 0,
        newTargetAmount: goal.target_amount,
        redistributionAmount: Math.min(redistributionAmount, remainingAmount)
      })
    }
  })
  
  return redistributionPlans
}

export function formatTimeRemaining(daysRemaining: number, monthsRemaining: number, isOverdue: boolean): string {
  if (isOverdue) {
    if (monthsRemaining > 0) {
      return `${monthsRemaining} month${monthsRemaining > 1 ? 's' : ''} overdue`
    } else if (daysRemaining > 0) {
      return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} overdue`
    } else {
      return 'Overdue'
    }
  }
  
  if (monthsRemaining > 0) {
    return `${monthsRemaining} month${monthsRemaining > 1 ? 's' : ''} remaining`
  } else if (daysRemaining > 0) {
    return `${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining`
  } else {
    return 'Due today!'
  }
}

export function getContributionRecommendation(weeklyContribution: number, monthlyContribution: number): string {
  if (monthlyContribution <= 0) return 'Goal completed!'
  
  if (monthlyContribution < 100) {
    return `£${monthlyContribution.toFixed(2)}/month`
  } else if (weeklyContribution < 50) {
    return `£${weeklyContribution.toFixed(2)}/week`
  } else {
    return `£${monthlyContribution.toFixed(2)}/month`
  }
}
