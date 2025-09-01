import { supabaseAdmin } from './supabase'

// Types for ML Learning Engine
export interface UserBehaviorPattern {
  userId: string
  patternType: 'under_saving' | 'over_saving' | 'consistent' | 'irregular'
  confidence: number
  factors: string[]
  lastUpdated: Date
}

export interface LearningInsight {
  id: string
  userId: string
  insightType: 'saving_behavior' | 'goal_optimization' | 'contribution_pattern' | 'risk_assessment'
  title: string
  description: string
  confidence: number
  recommendations: string[]
  dataPoints: number
  createdAt: Date
  expiresAt?: Date
}

export interface AdaptiveRecommendation {
  id: string
  userId: string
  recommendationType: 'goal_adjustment' | 'contribution_change' | 'safety_pot_optimization' | 'priority_reweighting'
  title: string
  description: string
  suggestedAction: string
  expectedImpact: {
    shortTerm: string
    longTerm: string
  }
  confidence: number
  reasoning: string[]
  createdAt: Date
}

export interface BehaviorAnalysis {
  userId: string
  analysisPeriod: 'week' | 'month' | 'quarter' | 'year'
  savingConsistency: number // 0-100
  goalAchievementRate: number // 0-100
  riskTolerance: 'low' | 'medium' | 'high'
  preferredTiming: 'early_month' | 'mid_month' | 'late_month' | 'irregular'
  stressFactors: string[]
  successPatterns: string[]
  improvementAreas: string[]
  lastAnalyzed: Date
}

export interface MLModelConfig {
  minDataPoints: number
  confidenceThreshold: number
  learningRate: number
  analysisFrequency: 'daily' | 'weekly' | 'monthly'
  retentionPeriod: number // days
}

class MLLearningEngine {
  private config: MLModelConfig = {
    minDataPoints: 10,
    confidenceThreshold: 0.7,
    learningRate: 0.1,
    analysisFrequency: 'weekly',
    retentionPeriod: 365
  }

  /**
   * Analyze user's saving behavior and create insights
   */
  async analyzeUserBehavior(userId: string): Promise<BehaviorAnalysis> {
    try {
      console.log('🤖 ML Engine: Analyzing behavior for user:', userId)

      // Get user's contribution history
      const { data: contributions, error: contribError } = await supabaseAdmin
        .from('goal_contributions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (contribError) {
        console.error('❌ ML Engine: Failed to fetch contributions:', contribError)
        throw new Error('Failed to fetch contribution data')
      }

      // Get user's goals and progress
      const { data: goals, error: goalsError } = await supabaseAdmin
        .from('goals')
        .select('*')
        .eq('added_by_user_id', userId)

      if (goalsError) {
        console.error('❌ ML Engine: Failed to fetch goals:', goalsError)
        throw new Error('Failed to fetch goal data')
      }

      // Analyze saving consistency
      const savingConsistency = this.calculateSavingConsistency(contributions)
      
      // Calculate goal achievement rate
      const goalAchievementRate = this.calculateGoalAchievementRate(goals)
      
      // Determine risk tolerance
      const riskTolerance = this.assessRiskTolerance(contributions, goals)
      
      // Analyze timing preferences
      const preferredTiming = this.analyzeTimingPreferences(contributions)
      
      // Identify stress factors
      const stressFactors = this.identifyStressFactors(contributions, goals)
      
      // Find success patterns
      const successPatterns = this.identifySuccessPatterns(contributions, goals)
      
      // Identify improvement areas
      const improvementAreas = this.identifyImprovementAreas(contributions, goals)

      const analysis: BehaviorAnalysis = {
        userId,
        analysisPeriod: 'month',
        savingConsistency,
        goalAchievementRate,
        riskTolerance,
        preferredTiming,
        stressFactors,
        successPatterns,
        improvementAreas,
        lastAnalyzed: new Date()
      }

      // Store the analysis
      await this.storeBehaviorAnalysis(analysis)

      console.log('✅ ML Engine: Behavior analysis completed:', {
        savingConsistency,
        goalAchievementRate,
        riskTolerance,
        preferredTiming
      })

      return analysis
    } catch (error) {
      console.error('❌ ML Engine: Behavior analysis failed:', error)
      throw error
    }
  }

  /**
   * Generate adaptive recommendations based on behavior analysis
   */
  async generateAdaptiveRecommendations(userId: string): Promise<AdaptiveRecommendation[]> {
    try {
      console.log('🤖 ML Engine: Generating adaptive recommendations for user:', userId)

      // Get recent behavior analysis
      const analysis = await this.getLatestBehaviorAnalysis(userId)
      if (!analysis) {
        console.log('⚠️ ML Engine: No behavior analysis found, creating initial analysis')
        await this.analyzeUserBehavior(userId)
        return []
      }

      const recommendations: AdaptiveRecommendation[] = []

      // Goal adjustment recommendations
      if (analysis.goalAchievementRate < 70) {
        recommendations.push(await this.generateGoalAdjustmentRecommendation(userId, analysis))
      }

      // Contribution change recommendations
      if (analysis.savingConsistency < 80) {
        recommendations.push(await this.generateContributionChangeRecommendation(userId, analysis))
      }

      // Safety pot optimization
      if (analysis.riskTolerance === 'low' && analysis.stressFactors.length > 0) {
        recommendations.push(await this.generateSafetyPotOptimizationRecommendation(userId, analysis))
      }

      // Priority reweighting
      if (analysis.improvementAreas.length > 0) {
        recommendations.push(await this.generatePriorityReweightingRecommendation(userId, analysis))
      }

      // Store recommendations
      await this.storeAdaptiveRecommendations(recommendations)

      console.log('✅ ML Engine: Generated', recommendations.length, 'adaptive recommendations')
      return recommendations
    } catch (error) {
      console.error('❌ ML Engine: Failed to generate adaptive recommendations:', error)
      throw error
    }
  }

  /**
   * Learn from under-saving behavior and update models
   */
  async learnFromUnderSaving(userId: string, reason: string, context: any): Promise<void> {
    try {
      console.log('🤖 ML Engine: Learning from under-saving behavior:', { userId, reason })

      // Create learning insight
      const insight: LearningInsight = {
        id: crypto.randomUUID(),
        userId,
        insightType: 'saving_behavior',
        title: 'Under-Saving Pattern Detected',
        description: `User reported under-saving due to: ${reason}`,
        confidence: 0.8,
        recommendations: this.generateUnderSavingRecommendations(reason, context),
        dataPoints: 1,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }

      // Store the insight
      await this.storeLearningInsight(insight)

      // Update behavior pattern
      await this.updateBehaviorPattern(userId, 'under_saving', reason, context)

      // Generate immediate recommendations
      await this.generateAdaptiveRecommendations(userId)

      console.log('✅ ML Engine: Successfully learned from under-saving behavior')
    } catch (error) {
      console.error('❌ ML Engine: Failed to learn from under-saving behavior:', error)
      throw error
    }
  }

  /**
   * Calculate saving consistency score
   */
  private calculateSavingConsistency(contributions: any[]): number {
    if (contributions.length < 3) return 50 // Default for insufficient data

    const monthlyContributions = this.groupByMonth(contributions)
    const expectedMonths = Math.min(6, Object.keys(monthlyContributions).length)
    const actualMonths = Object.keys(monthlyContributions).length

    const consistencyScore = (actualMonths / expectedMonths) * 100
    return Math.min(100, Math.max(0, consistencyScore))
  }

  /**
   * Calculate goal achievement rate
   */
  private calculateGoalAchievementRate(goals: any[]): number {
    if (goals.length === 0) return 0

    const completedGoals = goals.filter(goal => 
      goal.current_amount >= goal.target_amount || 
      (goal.target_date && new Date() > new Date(goal.target_date))
    )

    return (completedGoals.length / goals.length) * 100
  }

  /**
   * Assess user's risk tolerance
   */
  private assessRiskTolerance(contributions: any[], goals: any[]): 'low' | 'medium' | 'high' {
    // Analyze contribution variability
    const amounts = contributions.map(c => parseFloat(c.amount))
    const variance = this.calculateVariance(amounts)
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const coefficientOfVariation = variance / avgAmount

    // Analyze goal deadlines
    const urgentGoals = goals.filter(goal => {
      if (!goal.target_date) return false
      const daysUntilDeadline = (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      return daysUntilDeadline < 30 && goal.current_amount < goal.target_amount * 0.8
    })

    if (coefficientOfVariation > 0.5 || urgentGoals.length > 0) {
      return 'high'
    } else if (coefficientOfVariation > 0.2) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  /**
   * Analyze timing preferences
   */
  private analyzeTimingPreferences(contributions: any[]): 'early_month' | 'mid_month' | 'late_month' | 'irregular' {
    if (contributions.length < 3) return 'irregular'

    const dayOfMonthCounts = new Map<number, number>()
    
    contributions.forEach(contribution => {
      const day = new Date(contribution.created_at).getDate()
      dayOfMonthCounts.set(day, (dayOfMonthCounts.get(day) || 0) + 1)
    })

    const maxDay = Array.from(dayOfMonthCounts.entries()).reduce((a, b) => a[1] > b[1] ? a : b)[0]

    if (maxDay <= 10) return 'early_month'
    if (maxDay <= 20) return 'mid_month'
    if (maxDay <= 31) return 'late_month'
    return 'irregular'
  }

  /**
   * Identify stress factors
   */
  private identifyStressFactors(contributions: any[], goals: any[]): string[] {
    const stressFactors: string[] = []

    // Check for missed contributions
    const missedContributions = contributions.filter(c => c.over_under_amount < 0)
    if (missedContributions.length > 0) {
      stressFactors.push('frequent_missed_contributions')
    }

    // Check for urgent goals
    const urgentGoals = goals.filter(goal => {
      if (!goal.target_date) return false
      const daysUntilDeadline = (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      return daysUntilDeadline < 30 && goal.current_amount < goal.target_amount * 0.8
    })
    if (urgentGoals.length > 0) {
      stressFactors.push('urgent_goal_deadlines')
    }

    // Check for high contribution variability
    const amounts = contributions.map(c => parseFloat(c.amount))
    const variance = this.calculateVariance(amounts)
    if (variance > 1000) { // High variance threshold
      stressFactors.push('inconsistent_contribution_amounts')
    }

    return stressFactors
  }

  /**
   * Identify success patterns
   */
  private identifySuccessPatterns(contributions: any[], goals: any[]): string[] {
    const successPatterns: string[] = []

    // Check for consistent contributions
    const consistentContributions = contributions.filter(c => c.over_under_amount >= 0)
    if (consistentContributions.length > contributions.length * 0.8) {
      successPatterns.push('consistent_contributions')
    }

    // Check for goal achievements
    const achievedGoals = goals.filter(goal => goal.current_amount >= goal.target_amount)
    if (achievedGoals.length > 0) {
      successPatterns.push('goal_achievements')
    }

    // Check for early contributions
    const earlyContributions = contributions.filter(c => {
      const day = new Date(c.created_at).getDate()
      return day <= 15
    })
    if (earlyContributions.length > contributions.length * 0.6) {
      successPatterns.push('early_month_contributions')
    }

    return successPatterns
  }

  /**
   * Identify improvement areas
   */
  private identifyImprovementAreas(contributions: any[], goals: any[]): string[] {
    const improvementAreas: string[] = []

    // Check for low contribution amounts
    const avgAmount = contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0) / contributions.length
    if (avgAmount < 100) {
      improvementAreas.push('increase_contribution_amounts')
    }

    // Check for late contributions
    const lateContributions = contributions.filter(c => {
      const day = new Date(c.created_at).getDate()
      return day > 25
    })
    if (lateContributions.length > contributions.length * 0.3) {
      improvementAreas.push('earlier_contribution_timing')
    }

    // Check for missed goals
    const missedGoals = goals.filter(goal => {
      if (!goal.target_date) return false
      return new Date() > new Date(goal.target_date) && goal.current_amount < goal.target_amount
    })
    if (missedGoals.length > 0) {
      improvementAreas.push('goal_deadline_management')
    }

    return improvementAreas
  }

  /**
   * Generate goal adjustment recommendation
   */
  private async generateGoalAdjustmentRecommendation(userId: string, analysis: BehaviorAnalysis): Promise<AdaptiveRecommendation> {
    return {
      id: crypto.randomUUID(),
      userId,
      recommendationType: 'goal_adjustment',
      title: 'Adjust Goal Targets for Better Achievability',
      description: `Based on your ${analysis.goalAchievementRate.toFixed(0)}% goal achievement rate, consider adjusting your targets.`,
      suggestedAction: 'Review and adjust goal amounts or deadlines to match your saving capacity',
      expectedImpact: {
        shortTerm: 'Reduce stress from unrealistic targets',
        longTerm: 'Improve overall goal achievement rate'
      },
      confidence: 0.85,
      reasoning: [
        `Current achievement rate: ${analysis.goalAchievementRate.toFixed(0)}%`,
        'Goals may be too ambitious for current income',
        'Consider extending deadlines or reducing target amounts'
      ],
      createdAt: new Date()
    }
  }

  /**
   * Generate contribution change recommendation
   */
  private async generateContributionChangeRecommendation(userId: string, analysis: BehaviorAnalysis): Promise<AdaptiveRecommendation> {
    return {
      id: crypto.randomUUID(),
      userId,
      recommendationType: 'contribution_change',
      title: 'Optimize Contribution Timing and Amounts',
      description: `Your saving consistency is ${analysis.savingConsistency.toFixed(0)}%. Let's improve this.`,
      suggestedAction: `Contribute ${analysis.preferredTiming === 'early_month' ? 'earlier' : 'more consistently'} in the month`,
      expectedImpact: {
        shortTerm: 'Build better saving habits',
        longTerm: 'Achieve goals more reliably'
      },
      confidence: 0.8,
      reasoning: [
        `Current consistency: ${analysis.savingConsistency.toFixed(0)}%`,
        `Preferred timing: ${analysis.preferredTiming}`,
        'Consider setting up automatic reminders'
      ],
      createdAt: new Date()
    }
  }

  /**
   * Generate safety pot optimization recommendation
   */
  private async generateSafetyPotOptimizationRecommendation(userId: string, analysis: BehaviorAnalysis): Promise<AdaptiveRecommendation> {
    return {
      id: crypto.randomUUID(),
      userId,
      recommendationType: 'safety_pot_optimization',
      title: 'Optimize Your Safety Pot for Peace of Mind',
      description: 'Your risk tolerance is low, but you have stress factors. Let\'s optimize your safety buffer.',
      suggestedAction: 'Increase safety pot contributions to reduce financial stress',
      expectedImpact: {
        shortTerm: 'Reduce financial anxiety',
        longTerm: 'Build stronger financial foundation'
      },
      confidence: 0.9,
      reasoning: [
        'Risk tolerance: Low',
        `Stress factors: ${analysis.stressFactors.join(', ')}`,
        'Safety pot provides financial security'
      ],
      createdAt: new Date()
    }
  }

  /**
   * Generate priority reweighting recommendation
   */
  private async generatePriorityReweightingRecommendation(userId: string, analysis: BehaviorAnalysis): Promise<AdaptiveRecommendation> {
    return {
      id: crypto.randomUUID(),
      userId,
      recommendationType: 'priority_reweighting',
      title: 'Reorganize Goal Priorities for Better Success',
      description: 'Let\'s focus on your most achievable goals first.',
      suggestedAction: 'Review and reorder goal priorities based on achievability',
      expectedImpact: {
        shortTerm: 'Focus on achievable targets',
        longTerm: 'Build momentum and confidence'
      },
      confidence: 0.75,
      reasoning: [
        `Improvement areas: ${analysis.improvementAreas.join(', ')}`,
        'Prioritize goals with higher success probability',
        'Build confidence through smaller wins'
      ],
      createdAt: new Date()
    }
  }

  /**
   * Generate recommendations for under-saving behavior
   */
  private generateUnderSavingRecommendations(reason: string, context: any): string[] {
    const recommendations: string[] = []

    switch (reason.toLowerCase()) {
      case 'unexpected_expense':
        recommendations.push('Consider increasing your safety pot')
        recommendations.push('Review your emergency fund allocation')
        break
      case 'income_reduction':
        recommendations.push('Adjust goal targets to match new income')
        recommendations.push('Consider temporary goal postponement')
        break
      case 'overspending':
        recommendations.push('Review your monthly budget')
        recommendations.push('Set up spending alerts')
        break
      case 'forgot':
        recommendations.push('Set up automatic contribution reminders')
        recommendations.push('Schedule contributions on payday')
        break
      default:
        recommendations.push('Review your financial priorities')
        recommendations.push('Consider adjusting goal timelines')
    }

    return recommendations
  }

  // Helper methods
  private groupByMonth(contributions: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {}
    
    contributions.forEach(contribution => {
      const date = new Date(contribution.created_at)
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = []
      }
      grouped[monthKey].push(contribution)
    })
    
    return grouped
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  }

  // Database operations
  private async storeBehaviorAnalysis(analysis: BehaviorAnalysis): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('behavior_analysis')
        .insert({
          user_id: analysis.userId,
          analysis_period: analysis.analysisPeriod,
          saving_consistency: analysis.savingConsistency,
          goal_achievement_rate: analysis.goalAchievementRate,
          risk_tolerance: analysis.riskTolerance,
          preferred_timing: analysis.preferredTiming,
          stress_factors: analysis.stressFactors,
          success_patterns: analysis.successPatterns,
          improvement_areas: analysis.improvementAreas,
          last_analyzed: analysis.lastAnalyzed
        })

      if (error) {
        console.error('❌ ML Engine: Failed to store behavior analysis:', error)
        throw error
      }

      console.log('📊 ML Engine: Stored behavior analysis for user:', analysis.userId)
    } catch (error) {
      console.error('❌ ML Engine: Error storing behavior analysis:', error)
      throw error
    }
  }

  private async getLatestBehaviorAnalysis(userId: string): Promise<BehaviorAnalysis | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('behavior_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('last_analyzed', { ascending: false })
        .limit(1)

      if (error) {
        console.error('❌ ML Engine: Failed to get latest behavior analysis:', error)
        return null
      }

      if (!data || data.length === 0) {
        return null
      }

      const analysis = data[0]
      return {
        userId: analysis.user_id,
        analysisPeriod: analysis.analysis_period,
        savingConsistency: analysis.saving_consistency,
        goalAchievementRate: analysis.goal_achievement_rate,
        riskTolerance: analysis.risk_tolerance,
        preferredTiming: analysis.preferred_timing,
        stressFactors: analysis.stress_factors || [],
        successPatterns: analysis.success_patterns || [],
        improvementAreas: analysis.improvement_areas || [],
        lastAnalyzed: new Date(analysis.last_analyzed)
      }
    } catch (error) {
      console.error('❌ ML Engine: Error getting latest behavior analysis:', error)
      return null
    }
  }

  private async storeAdaptiveRecommendations(recommendations: AdaptiveRecommendation[]): Promise<void> {
    try {
      const recommendationsData = recommendations.map(rec => ({
        user_id: rec.userId,
        recommendation_type: rec.recommendationType,
        title: rec.title,
        description: rec.description,
        suggested_action: rec.suggestedAction,
        expected_impact_short_term: rec.expectedImpact.shortTerm,
        expected_impact_long_term: rec.expectedImpact.longTerm,
        confidence: rec.confidence,
        reasoning: rec.reasoning,
        created_at: rec.createdAt
      }))

      const { error } = await supabaseAdmin
        .from('adaptive_recommendations')
        .insert(recommendationsData)

      if (error) {
        console.error('❌ ML Engine: Failed to store adaptive recommendations:', error)
        throw error
      }

      console.log('💡 ML Engine: Stored', recommendations.length, 'adaptive recommendations')
    } catch (error) {
      console.error('❌ ML Engine: Error storing adaptive recommendations:', error)
      throw error
    }
  }

  private async storeLearningInsight(insight: LearningInsight): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('learning_insights')
        .insert({
          user_id: insight.userId,
          insight_type: insight.insightType,
          title: insight.title,
          description: insight.description,
          confidence: insight.confidence,
          recommendations: insight.recommendations,
          data_points: insight.dataPoints,
          created_at: insight.createdAt,
          expires_at: insight.expiresAt
        })

      if (error) {
        console.error('❌ ML Engine: Failed to store learning insight:', error)
        throw error
      }

      console.log('🧠 ML Engine: Stored learning insight:', insight.title)
    } catch (error) {
      console.error('❌ ML Engine: Error storing learning insight:', error)
      throw error
    }
  }

  private async updateBehaviorPattern(userId: string, patternType: string, reason: string, context: any): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('user_behavior_patterns')
        .upsert({
          user_id: userId,
          pattern_type: patternType,
          confidence: 0.8,
          factors: [reason],
          context_data: context,
          last_updated: new Date()
        })

      if (error) {
        console.error('❌ ML Engine: Failed to update behavior pattern:', error)
        throw error
      }

      console.log('🔄 ML Engine: Updated behavior pattern for user:', userId, 'Type:', patternType)
    } catch (error) {
      console.error('❌ ML Engine: Error updating behavior pattern:', error)
      throw error
    }
  }
}

// Export singleton instance
export const mlLearningEngine = new MLLearningEngine()
