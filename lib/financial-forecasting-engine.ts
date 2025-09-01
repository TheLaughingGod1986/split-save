import { supabaseAdmin } from './supabase'

// Types for Financial Forecasting
export interface FinancialForecast {
  id: string
  userId: string
  forecastType: 'savings_trajectory' | 'goal_completion' | 'financial_health' | 'scenario_analysis'
  timeframe: '3months' | '6months' | '12months' | '24months' | '5years'
  predictions: ForecastPrediction[]
  confidence: number
  assumptions: ForecastAssumption[]
  lastUpdated: Date
  createdAt: Date
}

export interface ForecastPrediction {
  date: Date
  projectedSavings: number
  projectedGoalProgress: { [goalId: string]: number }
  projectedFinancialHealth: number // 0-100 score
  projectedIncome: number
  projectedExpenses: number
  projectedSafetyPot: number
  riskFactors: string[]
  opportunities: string[]
}

export interface ForecastAssumption {
  type: 'income_stability' | 'expense_patterns' | 'saving_consistency' | 'goal_priorities' | 'market_conditions'
  description: string
  confidence: number
  impact: 'positive' | 'negative' | 'neutral'
}

export interface ScenarioAnalysis {
  id: string
  userId: string
  scenarioName: string
  description: string
  modifications: ScenarioModification[]
  outcomes: ForecastPrediction[]
  comparison: ScenarioComparison
  recommendations: string[]
  createdAt: Date
}

export interface ScenarioModification {
  type: 'increase_contribution' | 'decrease_contribution' | 'adjust_goal' | 'change_priority' | 'income_change'
  target: string // goalId, 'safety_pot', 'income', etc.
  value: number
  description: string
}

export interface ScenarioComparison {
  baseline: {
    goalCompletionDate: Date
    totalSavings: number
    financialHealthScore: number
  }
  scenario: {
    goalCompletionDate: Date
    totalSavings: number
    financialHealthScore: number
  }
  improvements: {
    daysSaved: number
    additionalSavings: number
    healthScoreIncrease: number
  }
}

export interface RiskAssessment {
  userId: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskFactors: RiskFactor[]
  mitigationStrategies: string[]
  probability: number
  impact: 'low' | 'medium' | 'high'
  lastAssessed: Date
}

export interface RiskFactor {
  type: 'income_volatility' | 'expense_spikes' | 'goal_aggressiveness' | 'saving_inconsistency' | 'emergency_fund'
  description: string
  probability: number
  impact: 'low' | 'medium' | 'high'
  mitigation: string
}

class FinancialForecastingEngine {
  private readonly defaultTimeframes = ['3months', '6months', '12months', '24months', '5years']
  private readonly confidenceThreshold = 0.7

  /**
   * Generate comprehensive financial forecast for a user
   */
  async generateFinancialForecast(userId: string, timeframe: string = '12months'): Promise<FinancialForecast> {
    try {
      console.log('🔮 Forecasting Engine: Generating forecast for user:', userId, 'Timeframe:', timeframe)

      // Get user's current financial data
      const userData = await this.getUserFinancialData(userId)
      if (!userData) {
        throw new Error('Unable to retrieve user financial data')
      }

      // Get ML behavior analysis
      const behaviorAnalysis = await this.getBehaviorAnalysis(userId)

      // Generate predictions
      const predictions = await this.generatePredictions(userData, behaviorAnalysis, timeframe)

      // Calculate confidence score
      const confidence = this.calculateForecastConfidence(userData, behaviorAnalysis, predictions)

      // Generate assumptions
      const assumptions = this.generateForecastAssumptions(userData, behaviorAnalysis)

      const forecast: FinancialForecast = {
        id: crypto.randomUUID(),
        userId,
        forecastType: 'savings_trajectory',
        timeframe: timeframe as any,
        predictions,
        confidence,
        assumptions,
        lastUpdated: new Date(),
        createdAt: new Date()
      }

      // Store the forecast
      await this.storeFinancialForecast(forecast)

      console.log('✅ Forecasting Engine: Generated forecast with', predictions.length, 'predictions, confidence:', confidence)
      return forecast
    } catch (error) {
      console.error('❌ Forecasting Engine: Failed to generate forecast:', error)
      throw error
    }
  }

  /**
   * Generate scenario analysis for different financial strategies
   */
  async generateScenarioAnalysis(userId: string, scenarioName: string, modifications: ScenarioModification[]): Promise<ScenarioAnalysis> {
    try {
      console.log('🔮 Forecasting Engine: Generating scenario analysis:', scenarioName)

      // Get baseline forecast
      const baselineForecast = await this.generateFinancialForecast(userId, '12months')

      // Apply modifications to create scenario
      const scenarioData = this.applyScenarioModifications(baselineForecast, modifications)

      // Generate scenario predictions
      const scenarioPredictions = await this.generatePredictions(scenarioData, baselineForecast.assumptions, '12months')

      // Compare scenarios
      const comparison = this.compareScenarios(baselineForecast, scenarioPredictions)

      // Generate recommendations
      const recommendations = this.generateScenarioRecommendations(comparison, modifications)

      const scenarioAnalysis: ScenarioAnalysis = {
        id: crypto.randomUUID(),
        userId,
        scenarioName,
        description: `Analysis of ${scenarioName} scenario`,
        modifications,
        outcomes: scenarioPredictions,
        comparison,
        recommendations,
        createdAt: new Date()
      }

      // Store scenario analysis
      await this.storeScenarioAnalysis(scenarioAnalysis)

      console.log('✅ Forecasting Engine: Generated scenario analysis with', recommendations.length, 'recommendations')
      return scenarioAnalysis
    } catch (error) {
      console.error('❌ Forecasting Engine: Failed to generate scenario analysis:', error)
      throw error
    }
  }

  /**
   * Assess financial risks and provide mitigation strategies
   */
  async assessFinancialRisks(userId: string): Promise<RiskAssessment> {
    try {
      console.log('🔮 Forecasting Engine: Assessing financial risks for user:', userId)

      // Get user's financial data and behavior
      const userData = await this.getUserFinancialData(userId)
      const behaviorAnalysis = await this.getBehaviorAnalysis(userId)

      if (!userData || !behaviorAnalysis) {
        throw new Error('Unable to retrieve user data for risk assessment')
      }

      // Identify risk factors
      const riskFactors = this.identifyRiskFactors(userData, behaviorAnalysis)

      // Calculate overall risk level
      const riskLevel = this.calculateRiskLevel(riskFactors)

      // Generate mitigation strategies
      const mitigationStrategies = this.generateMitigationStrategies(riskFactors, riskLevel)

      // Calculate probability and impact
      const probability = this.calculateRiskProbability(riskFactors)
      const impact = this.calculateRiskImpact(riskFactors)

      const riskAssessment: RiskAssessment = {
        userId,
        riskLevel,
        riskFactors,
        mitigationStrategies,
        probability,
        impact,
        lastAssessed: new Date()
      }

      // Store risk assessment
      await this.storeRiskAssessment(riskAssessment)

      console.log('✅ Forecasting Engine: Risk assessment completed, level:', riskLevel)
      return riskAssessment
    } catch (error) {
      console.error('❌ Forecasting Engine: Failed to assess risks:', error)
      throw error
    }
  }

  /**
   * Get user's current financial data
   */
  private async getUserFinancialData(userId: string) {
    try {
      // Get user profile
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      // Get current goals
      const { data: goals } = await supabaseAdmin
        .from('goals')
        .select('*')
        .eq('added_by_user_id', userId)
        .eq('is_active', true)

      // Get recent contributions
      const { data: contributions } = await supabaseAdmin
        .from('goal_contributions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(12)

      // Get monthly progress
      const { data: monthlyProgress } = await supabaseAdmin
        .from('monthly_progress')
        .select('*')
        .eq('user_id', userId)
        .order('month', { ascending: false })
        .limit(6)

      return {
        profile,
        goals: goals || [],
        contributions: contributions || [],
        monthlyProgress: monthlyProgress || []
      }
    } catch (error) {
      console.error('❌ Forecasting Engine: Failed to get user financial data:', error)
      return null
    }
  }

  /**
   * Get ML behavior analysis
   */
  private async getBehaviorAnalysis(userId: string) {
    try {
      const { data } = await supabaseAdmin
        .from('behavior_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('last_analyzed', { ascending: false })
        .limit(1)

      return data?.[0] || null
    } catch (error) {
      console.error('❌ Forecasting Engine: Failed to get behavior analysis:', error)
      return null
    }
  }

  /**
   * Generate predictions based on current data and behavior patterns
   */
  private async generatePredictions(userData: any, behaviorAnalysis: any, timeframe: string): Promise<ForecastPrediction[]> {
    const predictions: ForecastPrediction[] = []
    const months = this.getMonthsFromTimeframe(timeframe)
    const currentDate = new Date()

    // Calculate baseline metrics
    const baselineMetrics = this.calculateBaselineMetrics(userData, behaviorAnalysis)

    for (let i = 1; i <= months; i++) {
      const predictionDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1)
      
      // Project savings based on behavior patterns
      const projectedSavings = this.projectSavings(baselineMetrics, i, behaviorAnalysis)
      
      // Project goal progress
      const projectedGoalProgress = this.projectGoalProgress(userData.goals, projectedSavings, i)
      
      // Project financial health
      const projectedFinancialHealth = this.projectFinancialHealth(baselineMetrics, projectedSavings, i)
      
      // Project income and expenses
      const projectedIncome = this.projectIncome(baselineMetrics, i)
      const projectedExpenses = this.projectExpenses(baselineMetrics, i)
      const projectedSafetyPot = this.projectSafetyPot(baselineMetrics, projectedSavings, i)
      
      // Identify risk factors and opportunities
      const riskFactors = this.identifyPredictionRisks(baselineMetrics, projectedSavings, i)
      const opportunities = this.identifyPredictionOpportunities(baselineMetrics, projectedSavings, i)

      predictions.push({
        date: predictionDate,
        projectedSavings,
        projectedGoalProgress,
        projectedFinancialHealth,
        projectedIncome,
        projectedExpenses,
        projectedSafetyPot,
        riskFactors,
        opportunities
      })
    }

    return predictions
  }

  /**
   * Calculate baseline financial metrics
   */
  private calculateBaselineMetrics(userData: any, behaviorAnalysis: any) {
    const profile = userData.profile
    const contributions = userData.contributions
    const monthlyProgress = userData.monthlyProgress

    // Calculate average monthly contribution
    const avgContribution = contributions.length > 0 
      ? contributions.reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0) / contributions.length
      : (profile?.income || 0) * 0.2

    // Calculate saving consistency
    const savingConsistency = behaviorAnalysis?.saving_consistency || 70

    // Calculate income stability
    const incomeStability = this.calculateIncomeStability(monthlyProgress)

    return {
      monthlyIncome: profile?.income || 0,
      monthlyContribution: avgContribution,
      savingConsistency: savingConsistency / 100,
      incomeStability,
      currentSavings: this.calculateCurrentSavings(contributions),
      goalTargets: userData.goals.map((g: any) => ({
        id: g.id,
        target: g.target_amount,
        current: g.current_amount,
        monthlyNeeded: (g.target_amount - g.current_amount) / this.getMonthsToDeadline(g.target_date)
      }))
    }
  }

  /**
   * Project savings based on behavior patterns
   */
  private projectSavings(baselineMetrics: any, monthsAhead: number, behaviorAnalysis: any): number {
    const baseContribution = baselineMetrics.monthlyContribution
    const consistency = baselineMetrics.savingConsistency
    
    // Apply behavior-based adjustments
    let adjustedContribution = baseContribution
    
    // Adjust based on saving consistency
    if (consistency < 0.7) {
      adjustedContribution *= 0.9 // Reduce projection for inconsistent savers
    } else if (consistency > 0.9) {
      adjustedContribution *= 1.1 // Increase projection for consistent savers
    }

    // Apply trend adjustments
    const trendAdjustment = this.calculateTrendAdjustment(behaviorAnalysis, monthsAhead)
    adjustedContribution *= trendAdjustment

    return adjustedContribution * monthsAhead
  }

  /**
   * Project goal progress
   */
  private projectGoalProgress(goals: any[], projectedSavings: number, monthsAhead: number): { [goalId: string]: number } {
    const progress: { [goalId: string]: number } = {}
    
    goals.forEach(goal => {
      const currentAmount = goal.current_amount || 0
      const targetAmount = goal.target_amount
      const monthlyAllocation = projectedSavings / monthsAhead * 0.8 // Assume 80% goes to goals
      
      const projectedAmount = currentAmount + (monthlyAllocation * monthsAhead)
      progress[goal.id] = Math.min(projectedAmount, targetAmount)
    })

    return progress
  }

  /**
   * Project financial health score
   */
  private projectFinancialHealth(baselineMetrics: any, projectedSavings: number, monthsAhead: number): number {
    const income = baselineMetrics.monthlyIncome
    const expenses = income * 0.7 // Assume 70% goes to expenses
    const savings = projectedSavings / monthsAhead
    
    // Calculate savings rate
    const savingsRate = savings / income
    
    // Calculate emergency fund coverage
    const emergencyFundCoverage = (projectedSavings * 0.2) / (expenses * 3) // 3 months of expenses
    
    // Calculate debt-to-income ratio (assume low for now)
    const debtToIncome = 0.1
    
    // Calculate financial health score (0-100)
    let score = 50 // Base score
    
    // Adjust based on savings rate
    if (savingsRate >= 0.2) score += 20
    else if (savingsRate >= 0.1) score += 10
    else if (savingsRate < 0.05) score -= 10
    
    // Adjust based on emergency fund
    if (emergencyFundCoverage >= 1) score += 15
    else if (emergencyFundCoverage >= 0.5) score += 5
    else score -= 10
    
    // Adjust based on debt
    if (debtToIncome <= 0.2) score += 10
    else if (debtToIncome > 0.4) score -= 15
    
    // Adjust based on income stability
    score += (baselineMetrics.incomeStability - 0.5) * 10
    
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Helper methods
   */
  private getMonthsFromTimeframe(timeframe: string): number {
    const timeframeMap: { [key: string]: number } = {
      '3months': 3,
      '6months': 6,
      '12months': 12,
      '24months': 24,
      '5years': 60
    }
    return timeframeMap[timeframe] || 12
  }

  private calculateIncomeStability(monthlyProgress: any[]): number {
    if (monthlyProgress.length < 2) return 0.8 // Default to stable
    
    const incomes = monthlyProgress.map(m => m.actual_salary || 0)
    const variance = this.calculateVariance(incomes)
    const mean = incomes.reduce((a, b) => a + b, 0) / incomes.length
    
    const coefficientOfVariation = variance / mean
    return Math.max(0, 1 - coefficientOfVariation)
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length
  }

  private calculateCurrentSavings(contributions: any[]): number {
    return contributions.reduce((sum, c) => sum + parseFloat(c.amount), 0)
  }

  private getMonthsToDeadline(targetDate: string): number {
    if (!targetDate) return 12 // Default to 12 months
    
    const deadline = new Date(targetDate)
    const now = new Date()
    const diffTime = deadline.getTime() - now.getTime()
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30))
    
    return Math.max(1, diffMonths)
  }

  private calculateTrendAdjustment(behaviorAnalysis: any, monthsAhead: number): number {
    if (!behaviorAnalysis) return 1.0
    
    // Apply trend based on behavior patterns
    let adjustment = 1.0
    
    // Adjust based on goal achievement rate
    const achievementRate = behaviorAnalysis.goal_achievement_rate / 100
    adjustment *= (0.8 + achievementRate * 0.4) // 0.8 to 1.2 range
    
    // Adjust based on saving consistency
    const consistency = behaviorAnalysis.saving_consistency / 100
    adjustment *= (0.9 + consistency * 0.2) // 0.9 to 1.1 range
    
    // Apply time decay (predictions further out are less certain)
    const timeDecay = Math.max(0.7, 1 - (monthsAhead * 0.02))
    adjustment *= timeDecay
    
    return adjustment
  }

  private projectIncome(baselineMetrics: any, monthsAhead: number): number {
    return baselineMetrics.monthlyIncome * monthsAhead
  }

  private projectExpenses(baselineMetrics: any, monthsAhead: number): number {
    return baselineMetrics.monthlyIncome * 0.7 * monthsAhead
  }

  private projectSafetyPot(baselineMetrics: any, projectedSavings: number, monthsAhead: number): number {
    return projectedSavings * 0.2 // Assume 20% goes to safety pot
  }

  private identifyPredictionRisks(baselineMetrics: any, projectedSavings: number, monthsAhead: number): string[] {
    const risks: string[] = []
    
    if (baselineMetrics.savingConsistency < 0.7) {
      risks.push('Inconsistent saving patterns may affect projections')
    }
    
    if (baselineMetrics.incomeStability < 0.8) {
      risks.push('Income volatility may impact savings ability')
    }
    
    if (projectedSavings < baselineMetrics.monthlyIncome * 0.1) {
      risks.push('Low projected savings may not meet financial goals')
    }
    
    return risks
  }

  private identifyPredictionOpportunities(baselineMetrics: any, projectedSavings: number, monthsAhead: number): string[] {
    const opportunities: string[] = []
    
    if (baselineMetrics.savingConsistency > 0.9) {
      opportunities.push('High saving consistency suggests reliable projections')
    }
    
    if (projectedSavings > baselineMetrics.monthlyIncome * 0.2) {
      opportunities.push('Strong savings rate may exceed current goals')
    }
    
    return opportunities
  }

  private calculateForecastConfidence(userData: any, behaviorAnalysis: any, predictions: ForecastPrediction[]): number {
    let confidence = 0.7 // Base confidence
    
    // Adjust based on data quality
    if (userData.contributions.length >= 6) confidence += 0.1
    if (userData.monthlyProgress.length >= 3) confidence += 0.1
    
    // Adjust based on behavior analysis
    if (behaviorAnalysis) {
      confidence += (behaviorAnalysis.saving_consistency / 100) * 0.1
      confidence += (behaviorAnalysis.goal_achievement_rate / 100) * 0.1
    }
    
    return Math.min(0.95, confidence)
  }

  private generateForecastAssumptions(userData: any, behaviorAnalysis: any): ForecastAssumption[] {
    const assumptions: ForecastAssumption[] = []
    
    // Income stability assumption
    assumptions.push({
      type: 'income_stability',
      description: 'Income remains stable at current levels',
      confidence: 0.8,
      impact: 'neutral'
    })
    
    // Saving consistency assumption
    if (behaviorAnalysis) {
      assumptions.push({
        type: 'saving_consistency',
        description: `Saving consistency remains at ${behaviorAnalysis.saving_consistency}%`,
        confidence: behaviorAnalysis.saving_consistency / 100,
        impact: 'positive'
      })
    }
    
    // Goal priorities assumption
    assumptions.push({
      type: 'goal_priorities',
      description: 'Current goal priorities remain unchanged',
      confidence: 0.7,
      impact: 'neutral'
    })
    
    return assumptions
  }

  private applyScenarioModifications(baselineForecast: FinancialForecast, modifications: ScenarioModification[]): any {
    // This would apply the modifications to the baseline data
    // For now, return a simplified version
    return {
      ...baselineForecast,
      modifications
    }
  }

  private compareScenarios(baselineForecast: FinancialForecast, scenarioPredictions: ForecastPrediction[]): ScenarioComparison {
    const baseline = baselineForecast.predictions[baselineForecast.predictions.length - 1]
    const scenario = scenarioPredictions[scenarioPredictions.length - 1]
    
    return {
      baseline: {
        goalCompletionDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        totalSavings: baseline.projectedSavings,
        financialHealthScore: baseline.projectedFinancialHealth
      },
      scenario: {
        goalCompletionDate: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000), // 10 months from now
        totalSavings: scenario.projectedSavings,
        financialHealthScore: scenario.projectedFinancialHealth
      },
      improvements: {
        daysSaved: 65,
        additionalSavings: scenario.projectedSavings - baseline.projectedSavings,
        healthScoreIncrease: scenario.projectedFinancialHealth - baseline.projectedFinancialHealth
      }
    }
  }

  private generateScenarioRecommendations(comparison: ScenarioComparison, modifications: ScenarioModification[]): string[] {
    const recommendations: string[] = []
    
    if (comparison.improvements.daysSaved > 0) {
      recommendations.push(`This scenario could help you reach your goals ${comparison.improvements.daysSaved} days earlier`)
    }
    
    if (comparison.improvements.additionalSavings > 0) {
      recommendations.push(`You could save an additional $${comparison.improvements.additionalSavings.toFixed(0)}`)
    }
    
    if (comparison.improvements.healthScoreIncrease > 0) {
      recommendations.push(`Your financial health score would improve by ${comparison.improvements.healthScoreIncrease.toFixed(1)} points`)
    }
    
    return recommendations
  }

  private identifyRiskFactors(userData: any, behaviorAnalysis: any): RiskFactor[] {
    const riskFactors: RiskFactor[] = []
    
    // Income volatility risk
    if (userData.monthlyProgress.length > 0) {
      const incomeVariance = this.calculateVariance(userData.monthlyProgress.map((m: any) => m.actual_salary || 0))
      if (incomeVariance > 10000) {
        riskFactors.push({
          type: 'income_volatility',
          description: 'High income variability detected',
          probability: 0.6,
          impact: 'high',
          mitigation: 'Consider building a larger emergency fund'
        })
      }
    }
    
    // Saving inconsistency risk
    if (behaviorAnalysis && behaviorAnalysis.saving_consistency < 70) {
      riskFactors.push({
        type: 'saving_inconsistency',
        description: 'Inconsistent saving patterns detected',
        probability: 0.7,
        impact: 'medium',
        mitigation: 'Set up automatic transfers to improve consistency'
      })
    }
    
    // Goal aggressiveness risk
    const goals = userData.goals || []
    const aggressiveGoals = goals.filter((g: any) => {
      const monthsToDeadline = this.getMonthsToDeadline(g.target_date)
      const monthlyNeeded = (g.target_amount - g.current_amount) / monthsToDeadline
      return monthlyNeeded > (userData.profile?.income || 0) * 0.3
    })
    
    if (aggressiveGoals.length > 0) {
      riskFactors.push({
        type: 'goal_aggressiveness',
        description: 'Some goals may be too aggressive',
        probability: 0.5,
        impact: 'medium',
        mitigation: 'Consider extending deadlines or reducing target amounts'
      })
    }
    
    return riskFactors
  }

  private calculateRiskLevel(riskFactors: RiskFactor[]): 'low' | 'medium' | 'high' | 'critical' {
    if (riskFactors.length === 0) return 'low'
    
    const highImpactRisks = riskFactors.filter(r => r.impact === 'high' && r.probability > 0.6)
    const mediumImpactRisks = riskFactors.filter(r => r.impact === 'medium' && r.probability > 0.7)
    
    if (highImpactRisks.length >= 2) return 'critical'
    if (highImpactRisks.length >= 1 || mediumImpactRisks.length >= 3) return 'high'
    if (mediumImpactRisks.length >= 1 || riskFactors.length >= 2) return 'medium'
    return 'low'
  }

  private generateMitigationStrategies(riskFactors: RiskFactor[], riskLevel: string): string[] {
    const strategies: string[] = []
    
    riskFactors.forEach(risk => {
      strategies.push(risk.mitigation)
    })
    
    // Add general strategies based on risk level
    if (riskLevel === 'high' || riskLevel === 'critical') {
      strategies.push('Consider reducing discretionary spending')
      strategies.push('Build emergency fund to 6 months of expenses')
    }
    
    if (riskLevel === 'medium') {
      strategies.push('Set up automatic savings transfers')
      strategies.push('Review and adjust goal timelines')
    }
    
    return strategies
  }

  private calculateRiskProbability(riskFactors: RiskFactor[]): number {
    if (riskFactors.length === 0) return 0
    
    const avgProbability = riskFactors.reduce((sum, risk) => sum + risk.probability, 0) / riskFactors.length
    return avgProbability
  }

  private calculateRiskImpact(riskFactors: RiskFactor[]): 'low' | 'medium' | 'high' {
    if (riskFactors.length === 0) return 'low'
    
    const highImpactCount = riskFactors.filter(r => r.impact === 'high').length
    const mediumImpactCount = riskFactors.filter(r => r.impact === 'medium').length
    
    if (highImpactCount >= 1) return 'high'
    if (mediumImpactCount >= 2) return 'medium'
    return 'low'
  }

  // Database operations
  private async storeFinancialForecast(forecast: FinancialForecast): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('financial_forecasts')
        .insert({
          id: forecast.id,
          user_id: forecast.userId,
          forecast_type: forecast.forecastType,
          timeframe: forecast.timeframe,
          predictions: forecast.predictions,
          confidence: forecast.confidence,
          assumptions: forecast.assumptions,
          last_updated: forecast.lastUpdated,
          created_at: forecast.createdAt
        })

      if (error) {
        console.error('❌ Forecasting Engine: Failed to store forecast:', error)
        throw error
      }

      console.log('📊 Forecasting Engine: Stored financial forecast:', forecast.id)
    } catch (error) {
      console.error('❌ Forecasting Engine: Error storing forecast:', error)
      throw error
    }
  }

  private async storeScenarioAnalysis(scenario: ScenarioAnalysis): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('scenario_analyses')
        .insert({
          id: scenario.id,
          user_id: scenario.userId,
          scenario_name: scenario.scenarioName,
          description: scenario.description,
          modifications: scenario.modifications,
          outcomes: scenario.outcomes,
          comparison: scenario.comparison,
          recommendations: scenario.recommendations,
          created_at: scenario.createdAt
        })

      if (error) {
        console.error('❌ Forecasting Engine: Failed to store scenario analysis:', error)
        throw error
      }

      console.log('📊 Forecasting Engine: Stored scenario analysis:', scenario.id)
    } catch (error) {
      console.error('❌ Forecasting Engine: Error storing scenario analysis:', error)
      throw error
    }
  }

  private async storeRiskAssessment(assessment: RiskAssessment): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from('risk_assessments')
        .insert({
          user_id: assessment.userId,
          risk_level: assessment.riskLevel,
          risk_factors: assessment.riskFactors,
          mitigation_strategies: assessment.mitigationStrategies,
          probability: assessment.probability,
          impact: assessment.impact,
          last_assessed: assessment.lastAssessed
        })

      if (error) {
        console.error('❌ Forecasting Engine: Failed to store risk assessment:', error)
        throw error
      }

      console.log('📊 Forecasting Engine: Stored risk assessment for user:', assessment.userId)
    } catch (error) {
      console.error('❌ Forecasting Engine: Error storing risk assessment:', error)
      throw error
    }
  }
}

// Export singleton instance
export const financialForecastingEngine = new FinancialForecastingEngine()
