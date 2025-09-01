import { Goal } from './api-client'

export enum GoalPriority {
  CRITICAL = 1,    // Must achieve (emergency fund, debt payoff)
  HIGH = 2,        // Very important (house down payment)
  MEDIUM = 3,      // Important (vacation, car)
  LOW = 4,         // Nice to have (luxury items)
  OPTIONAL = 5     // Future consideration
}

export interface GoalRecommendation {
  goalId: string
  type: 'amount' | 'deadline' | 'priority' | 'contribution'
  currentValue: any
  recommendedValue: any
  reason: string
  impact: 'high' | 'medium' | 'low'
  actionRequired: boolean
}

export interface GoalAllocation {
  goalId: string
  currentAllocation: number
  recommendedAllocation: number
  priority: number
  riskLevel: string
  feasibilityScore: number
}

export class GoalPrioritizationEngine {
  private goals: Goal[]
  private monthlyIncome: number
  private currentSavingsRate: number

  constructor(goals: Goal[], monthlyIncome: number, currentSavingsRate: number = 0.2) {
    this.goals = goals
    this.monthlyIncome = monthlyIncome
    this.currentSavingsRate = currentSavingsRate
  }

  /**
   * Calculate optimal allocation percentages for all goals
   */
  calculateOptimalAllocations(): GoalAllocation[] {
    const activeGoals = this.goals.filter(goal => 
      goal.target_date && 
      new Date(goal.target_date) > new Date() &&
      goal.current_amount < goal.target_amount
    )

    if (activeGoals.length === 0) {
      return []
    }

    // Calculate total priority weight (inverse priority - lower number = higher weight)
    const totalWeight = activeGoals.reduce((sum, goal) => {
      const priority = goal.priority || GoalPriority.MEDIUM
      const feasibility = goal.feasibility_score || 1.0
      return sum + ((6 - priority) * Math.max(feasibility, 0.1))
    }, 0)

    return activeGoals.map(goal => {
      const priority = goal.priority || GoalPriority.MEDIUM
      const feasibility = goal.feasibility_score || 1.0
      const weight = (6 - priority) * Math.max(feasibility, 0.1)
      const recommendedAllocation = totalWeight > 0 ? (weight / totalWeight) * 100 : 0

      return {
        goalId: goal.id,
        currentAllocation: goal.allocation_percentage || 0,
        recommendedAllocation: Math.round(recommendedAllocation * 100) / 100,
        priority,
        riskLevel: goal.risk_level || 'low',
        feasibilityScore: feasibility
      }
    }).sort((a, b) => a.priority - b.priority)
  }

  /**
   * Generate smart recommendations for goals
   */
  generateRecommendations(): GoalRecommendation[] {
    const recommendations: GoalRecommendation[] = []

    this.goals.forEach(goal => {
      if (!goal.target_date || goal.current_amount >= goal.target_amount) {
        return
      }

      const daysToDeadline = goal.days_to_deadline || 0
      const monthlyNeeded = goal.monthly_contribution_needed || 0
      const feasibility = goal.feasibility_score || 1.0
      const priority = goal.priority || GoalPriority.MEDIUM

      // Check if goal is at risk
      if (feasibility < 0.5) {
        recommendations.push(this.createAmountRecommendation(goal, monthlyNeeded))
        recommendations.push(this.createDeadlineRecommendation(goal, daysToDeadline))
      }

      // Check if priority should be adjusted
      if (priority > 3 && feasibility < 0.7) {
        recommendations.push(this.createPriorityRecommendation(goal, priority))
      }

      // Check if contribution rate should be increased
      if (monthlyNeeded > this.monthlyIncome * 0.3) {
        recommendations.push(this.createContributionRecommendation(goal, monthlyNeeded))
      }
    })

    return recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  private createAmountRecommendation(goal: Goal, monthlyNeeded: number): GoalRecommendation {
    const currentAmount = goal.target_amount
    const recommendedAmount = Math.round(monthlyNeeded * 12 * 1.2) // 20% buffer

    return {
      goalId: goal.id,
      type: 'amount',
      currentValue: currentAmount,
      recommendedValue: recommendedAmount,
      reason: `Current target requires £${monthlyNeeded.toFixed(0)}/month. Consider reducing to £${recommendedAmount.toFixed(0)} for better feasibility.`,
      impact: 'high',
      actionRequired: true
    }
  }

  private createDeadlineRecommendation(goal: Goal, daysToDeadline: number): GoalRecommendation {
    const currentDate = new Date(goal.target_date!)
    const recommendedDate = new Date(currentDate)
    recommendedDate.setMonth(recommendedDate.getMonth() + 3) // Extend by 3 months

    return {
      goalId: goal.id,
      type: 'deadline',
      currentValue: goal.target_date,
      recommendedValue: recommendedDate.toISOString().split('T')[0],
      reason: `Goal may not be achievable by current deadline. Consider extending to ${recommendedDate.toLocaleDateString()}.`,
      impact: 'medium',
      actionRequired: false
    }
  }

  private createPriorityRecommendation(goal: Goal, currentPriority: number): GoalRecommendation {
    const recommendedPriority = Math.max(currentPriority - 1, GoalPriority.HIGH)

    return {
      goalId: goal.id,
      type: 'priority',
      currentValue: currentPriority,
      recommendedValue: recommendedPriority,
      reason: `Consider increasing priority to get more allocation and improve chances of success.`,
      impact: 'medium',
      actionRequired: false
    }
  }

  private createContributionRecommendation(goal: Goal, monthlyNeeded: number): GoalRecommendation {
    const currentRate = this.currentSavingsRate
    const recommendedRate = Math.min(monthlyNeeded / this.monthlyIncome + 0.1, 0.5)

    return {
      goalId: goal.id,
      type: 'contribution',
      currentValue: currentRate,
      recommendedValue: recommendedRate,
      reason: `Consider increasing monthly savings rate to ${(recommendedRate * 100).toFixed(0)}% to meet this goal.`,
      impact: 'high',
      actionRequired: true
    }
  }

  /**
   * Get priority label and color
   */
  static getPriorityInfo(priority: number) {
    const priorityInfo: { [key: number]: { label: string; color: string; bgColor: string; borderColor: string } } = {
      [GoalPriority.CRITICAL]: { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-200' },
      [GoalPriority.HIGH]: { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
      [GoalPriority.MEDIUM]: { label: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100', borderColor: 'border-blue-200' },
      [GoalPriority.LOW]: { label: 'Low', color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-200' },
      [GoalPriority.OPTIONAL]: { label: 'Optional', color: 'text-purple-600', bgColor: 'bg-purple-100', borderColor: 'border-purple-200' }
    }

    return priorityInfo[priority] || priorityInfo[GoalPriority.MEDIUM]
  }

  /**
   * Get risk level info
   */
  static getRiskLevelInfo(riskLevel: string) {
    const riskInfo = {
      low: { label: 'Low Risk', color: 'text-green-600', bgColor: 'bg-green-100', borderColor: 'border-green-200' },
      medium: { label: 'Medium Risk', color: 'text-yellow-600', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' },
      high: { label: 'High Risk', color: 'text-orange-600', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
      critical: { label: 'Critical Risk', color: 'text-red-600', bgColor: 'bg-red-100', borderColor: 'border-red-200' }
    }

    return riskInfo[riskLevel as keyof typeof riskInfo] || riskInfo.low
  }

  /**
   * Calculate feasibility score for a goal
   */
  static calculateFeasibility(goal: Goal, monthlyIncome: number): number {
    if (!goal.target_date || monthlyIncome <= 0) {
      return 0
    }

    const daysToDeadline = Math.max(1, Math.floor((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    const monthsToDeadline = daysToDeadline / 30
    const amountNeeded = goal.target_amount - goal.current_amount
    const monthlyNeeded = amountNeeded / monthsToDeadline
    const maxAffordable = monthlyIncome * 0.3 // Assume 30% of income can go to savings

    return Math.min(1.0, maxAffordable / monthlyNeeded)
  }
}
