'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface BehaviorAnalysis {
  userId: string
  analysisPeriod: string
  savingConsistency: number
  goalAchievementRate: number
  riskTolerance: 'low' | 'medium' | 'high'
  preferredTiming: string
  stressFactors: string[]
  successPatterns: string[]
  improvementAreas: string[]
  lastAnalyzed: Date
}

interface AdaptiveRecommendation {
  id: string
  userId: string
  recommendationType: string
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

interface MLInsightsPanelProps {
  userId: string
  onInsightAction?: (action: string, data: any) => void
}

export function MLInsightsPanel({ userId, onInsightAction }: MLInsightsPanelProps) {
  const [analysis, setAnalysis] = useState<BehaviorAnalysis | null>(null)
  const [recommendations, setRecommendations] = useState<AdaptiveRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [showUnderSavingForm, setShowUnderSavingForm] = useState(false)
  const [underSavingReason, setUnderSavingReason] = useState('')
  const [underSavingContext, setUnderSavingContext] = useState('')

  useEffect(() => {
    loadMLInsights()
  }, [userId])

  const loadMLInsights = async () => {
    try {
      setLoading(true)
      
      // Load behavior analysis
      const analysisResponse = await apiClient.get('/ml/analyze-behavior')
      if (analysisResponse.data?.analysis) {
        setAnalysis(analysisResponse.data.analysis)
      }

      // Load recommendations
      const recommendationsResponse = await apiClient.get('/ml/recommendations')
      setRecommendations(recommendationsResponse.data?.recommendations || [])

    } catch (error) {
      console.error('Failed to load ML insights:', error)
      toast.error('Failed to load AI insights')
    } finally {
      setLoading(false)
    }
  }

  const triggerBehaviorAnalysis = async () => {
    try {
      setAnalyzing(true)
      const response = await apiClient.post('/ml/analyze-behavior', {})
      
      if (response.data?.analysis) {
        setAnalysis(response.data.analysis)
        toast.success('Behavior analysis completed!')
      }
      
      if (response.data?.recommendations) {
        setRecommendations(response.data.recommendations)
      }
    } catch (error) {
      console.error('Failed to analyze behavior:', error)
      toast.error('Failed to analyze behavior')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRecommendationAction = async (recommendationId: string, action: string, feedback?: any) => {
    try {
      await apiClient.post('/ml/recommendations', {
        recommendationId,
        action,
        feedback
      })

      // Remove the recommendation from the list
      setRecommendations(prev => prev.filter(rec => rec.id !== recommendationId))

      if (action === 'apply') {
        toast.success('Recommendation applied!')
      } else if (action === 'dismiss') {
        toast.info('Recommendation dismissed')
      }

      onInsightAction?.(action, { recommendationId, feedback })
    } catch (error) {
      console.error('Failed to process recommendation action:', error)
      toast.error('Failed to process action')
    }
  }

  const handleUnderSavingSubmit = async () => {
    if (!underSavingReason.trim()) {
      toast.error('Please provide a reason for under-saving')
      return
    }

    try {
      const response = await apiClient.post('/ml/learn-under-saving', {
        reason: underSavingReason,
        context: {
          additionalNotes: underSavingContext
        }
      })

      if (response.data?.recommendations) {
        setRecommendations(response.data.recommendations)
      }

      setShowUnderSavingForm(false)
      setUnderSavingReason('')
      setUnderSavingContext('')
      toast.success('Thank you for the feedback! We\'ll use this to improve your recommendations.')
    } catch (error) {
      console.error('Failed to submit under-saving feedback:', error)
      toast.error('Failed to submit feedback')
    }
  }

  const getRiskToleranceColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 dark:text-green-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'high': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 dark:text-green-400'
    if (confidence >= 0.6) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">🤖 AI Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">Personalized recommendations based on your behavior</p>
        </div>
        <button
          onClick={triggerBehaviorAnalysis}
          disabled={analyzing}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
        >
          {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      {/* Behavior Analysis */}
      {analysis && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Behavior Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {analysis.savingConsistency.toFixed(0)}%
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Saving Consistency</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {analysis.goalAchievementRate.toFixed(0)}%
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Goal Achievement</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className={`text-2xl font-bold capitalize ${getRiskToleranceColor(analysis.riskTolerance)}`}>
                {analysis.riskTolerance}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Risk Tolerance</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-lg font-bold text-orange-600 dark:text-orange-400 capitalize">
                {analysis.preferredTiming.replace('_', ' ')}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Preferred Timing</div>
            </div>
          </div>

          {/* Stress Factors & Success Patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analysis.stressFactors.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ Stress Factors</h4>
                <ul className="space-y-1">
                  {analysis.stressFactors.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {factor.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.successPatterns.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">✅ Success Patterns</h4>
                <ul className="space-y-1">
                  {analysis.successPatterns.map((pattern, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                      • {pattern.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Improvement Areas */}
          {analysis.improvementAreas.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🎯 Areas for Improvement</h4>
              <ul className="space-y-1">
                {analysis.improvementAreas.map((area, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                    • {area.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Adaptive Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💡 AI Recommendations</h3>
          
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div key={recommendation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{recommendation.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{recommendation.description}</p>
                  </div>
                  <div className={`text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
                    {(recommendation.confidence * 100).toFixed(0)}% confidence
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Suggested Action:
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recommendation.suggestedAction}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Short-term:</span>
                    <p className="text-gray-600 dark:text-gray-400">{recommendation.expectedImpact.shortTerm}</p>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Long-term:</span>
                    <p className="text-gray-600 dark:text-gray-400">{recommendation.expectedImpact.longTerm}</p>
                  </div>
                </div>

                {recommendation.reasoning.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Why this recommendation:</p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {recommendation.reasoning.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRecommendationAction(recommendation.id, 'apply')}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => handleRecommendationAction(recommendation.id, 'dismiss')}
                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Under-Saving Feedback Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📝 Help Us Learn</h3>
          <button
            onClick={() => setShowUnderSavingForm(!showUnderSavingForm)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            {showUnderSavingForm ? 'Cancel' : 'Report Under-Saving'}
          </button>
        </div>

        {showUnderSavingForm && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Why did you save less than expected this month?
              </label>
              <select
                value={underSavingReason}
                onChange={(e) => setUnderSavingReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a reason...</option>
                <option value="unexpected_expense">Unexpected expense</option>
                <option value="income_reduction">Income reduction</option>
                <option value="overspending">Overspending</option>
                <option value="forgot">Forgot to contribute</option>
                <option value="other">Other reason</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Additional context (optional)
              </label>
              <textarea
                value={underSavingContext}
                onChange={(e) => setUnderSavingContext(e.target.value)}
                placeholder="Tell us more about what happened..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                rows={3}
              />
            </div>

            <button
              onClick={handleUnderSavingSubmit}
              disabled={!underSavingReason}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              Submit Feedback
            </button>
          </div>
        )}

        {!showUnderSavingForm && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Help us improve your recommendations by sharing when you save less than expected. 
            This helps our AI learn and provide better suggestions.
          </p>
        )}
      </div>
    </div>
  )
}
