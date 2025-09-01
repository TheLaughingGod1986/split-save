'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FinancialForecast, 
  ScenarioAnalysis, 
  RiskAssessment, 
  ScenarioModification 
} from '@/lib/financial-forecasting-engine'

interface AdvancedFinancialForecastingProps {
  userId: string
}

export default function AdvancedFinancialForecasting({ userId }: AdvancedFinancialForecastingProps) {
  const [activeTab, setActiveTab] = useState<'forecast' | 'scenarios' | 'risks'>('forecast')
  const [loading, setLoading] = useState(false)
  const [forecast, setForecast] = useState<FinancialForecast | null>(null)
  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([])
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3months' | '6months' | '12months' | '24months' | '5years'>('12months')
  const [showScenarioForm, setShowScenarioForm] = useState(false)
  const [newScenario, setNewScenario] = useState({
    name: '',
    modifications: [] as ScenarioModification[]
  })



  const loadForecast = useCallback(async () => {
    try {
      const response = await fetch('/api/forecasting/generate-forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeframe: selectedTimeframe })
      })
      
      if (response.ok) {
        const data = await response.json()
        setForecast(data.forecast)
      }
    } catch (error) {
      console.error('Error loading forecast:', error)
    }
  }, [selectedTimeframe])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Load forecast
      await loadForecast()
      
      // Load scenarios
      await loadScenarios()
      
      // Load risk assessment
      await loadRiskAssessment()
    } catch (error) {
      console.error('Error loading forecasting data:', error)
    } finally {
      setLoading(false)
    }
  }, [loadForecast])

  const loadScenarios = async () => {
    try {
      const response = await fetch('/api/forecasting/scenario-analysis')
      if (response.ok) {
        const data = await response.json()
        setScenarios(data.scenarios)
      }
    } catch (error) {
      console.error('Error loading scenarios:', error)
    }
  }

  const loadRiskAssessment = async () => {
    try {
      const response = await fetch('/api/forecasting/risk-assessment')
      if (response.ok) {
        const data = await response.json()
        setRiskAssessment(data.riskAssessment)
      }
    } catch (error) {
      console.error('Error loading risk assessment:', error)
    }
  }

  const generateNewForecast = async () => {
    setLoading(true)
    try {
      await loadForecast()
    } finally {
      setLoading(false)
    }
  }

  const createScenario = async () => {
    if (!newScenario.name || newScenario.modifications.length === 0) return

    setLoading(true)
    try {
      const response = await fetch('/api/forecasting/scenario-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newScenario)
      })

      if (response.ok) {
        const data = await response.json()
        setScenarios([data.scenarioAnalysis, ...scenarios])
        setShowScenarioForm(false)
        setNewScenario({ name: '', modifications: [] })
      }
    } catch (error) {
      console.error('Error creating scenario:', error)
    } finally {
      setLoading(false)
    }
  }

  const addModification = () => {
    setNewScenario(prev => ({
      ...prev,
      modifications: [...prev.modifications, {
        type: 'increase_contribution',
        target: '',
        value: 0,
        description: ''
      }]
    }))
  }

  const updateModification = (index: number, field: keyof ScenarioModification, value: any) => {
    setNewScenario(prev => ({
      ...prev,
      modifications: prev.modifications.map((mod, i) => 
        i === index ? { ...mod, [field]: value } : mod
      )
    }))
  }

  const removeModification = (index: number) => {
    setNewScenario(prev => ({
      ...prev,
      modifications: prev.modifications.filter((_, i) => i !== index)
    }))
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-100 border-red-200'
      default: return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Load data when component mounts or dependencies change
  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading && !forecast) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔮 Advanced Financial Forecasting
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered predictions and scenario analysis for your financial future
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="12months">12 Months</option>
            <option value="24months">24 Months</option>
            <option value="5years">5 Years</option>
          </select>
          
          <button
            onClick={generateNewForecast}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Refresh Forecast'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'forecast', label: '📊 Financial Forecast', icon: '📊' },
            { id: 'scenarios', label: '🎯 Scenario Analysis', icon: '🎯' },
            { id: 'risks', label: '⚠️ Risk Assessment', icon: '⚠️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              {forecast ? (
                <>
                  {/* Forecast Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Forecast Summary
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Confidence:</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {(forecast.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatCurrency(forecast.predictions[forecast.predictions.length - 1]?.projectedSavings || 0)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Projected Savings</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {forecast.predictions[forecast.predictions.length - 1]?.projectedFinancialHealth?.toFixed(0) || 0}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Financial Health Score</div>
                      </div>
                      
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {forecast.predictions.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Months Projected</div>
                      </div>
                    </div>
                  </div>

                  {/* Predictions Chart */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Savings Trajectory
                    </h3>
                    
                    <div className="space-y-3">
                      {forecast.predictions.slice(0, 6).map((prediction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(prediction.date)}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(prediction.projectedSavings)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Health: {prediction.projectedFinancialHealth.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Assumptions */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Forecast Assumptions
                    </h3>
                    
                    <div className="space-y-3">
                      {forecast.assumptions.map((assumption, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            assumption.impact === 'positive' ? 'bg-green-500' :
                            assumption.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                          }`}></div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {assumption.description}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Confidence: {(assumption.confidence * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔮</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No forecast available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Generate your first financial forecast to see predictions
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              {/* Scenario Form */}
              {showScenarioForm && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Create New Scenario
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scenario Name
                      </label>
                      <input
                        type="text"
                        value={newScenario.name}
                        onChange={(e) => setNewScenario(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="e.g., Aggressive Savings"
                      />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Modifications
                        </label>
                        <button
                          onClick={addModification}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          + Add Modification
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {newScenario.modifications.map((mod, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <select
                              value={mod.type}
                              onChange={(e) => updateModification(index, 'type', e.target.value)}
                              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                            >
                              <option value="increase_contribution">Increase Contribution</option>
                              <option value="decrease_contribution">Decrease Contribution</option>
                              <option value="adjust_goal">Adjust Goal</option>
                              <option value="change_priority">Change Priority</option>
                              <option value="income_change">Income Change</option>
                            </select>
                            
                            <input
                              type="text"
                              value={mod.target}
                              onChange={(e) => updateModification(index, 'target', e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                              placeholder="Target (goal ID, amount, etc.)"
                            />
                            
                            <input
                              type="number"
                              value={mod.value}
                              onChange={(e) => updateModification(index, 'value', parseFloat(e.target.value))}
                              className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                              placeholder="Value"
                            />
                            
                            <button
                              onClick={() => removeModification(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={createScenario}
                        disabled={!newScenario.name || newScenario.modifications.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        Create Scenario
                      </button>
                      <button
                        onClick={() => setShowScenarioForm(false)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Scenarios List */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Scenario Analyses
                  </h3>
                  <button
                    onClick={() => setShowScenarioForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + New Scenario
                  </button>
                </div>
                
                {scenarios.length > 0 ? (
                  <div className="space-y-4">
                    {scenarios.map((scenario) => (
                      <div key={scenario.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {scenario.scenarioName}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(scenario.createdAt)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {scenario.description}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Modifications:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {scenario.modifications.length}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Recommendations:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {scenario.recommendations.length}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Outcomes:</span>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {scenario.outcomes.length} months
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No scenarios yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first scenario to explore different financial strategies
                    </p>
                    <button
                      onClick={() => setShowScenarioForm(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Scenario
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="space-y-6">
              {riskAssessment ? (
                <>
                  {/* Risk Summary */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Risk Assessment Summary
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskLevelColor(riskAssessment.riskLevel)}`}>
                        {riskAssessment.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                          {riskAssessment.riskFactors.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Risk Factors</div>
                      </div>
                      
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                          {(riskAssessment.probability * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Risk Probability</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {riskAssessment.mitigationStrategies.length}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Mitigation Strategies</div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Risk Factors
                    </h3>
                    
                    <div className="space-y-3">
                      {riskAssessment.riskFactors.map((risk, index) => (
                        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {risk.description}
                            </h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              risk.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                              risk.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {risk.impact.toUpperCase()} IMPACT
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Probability: {(risk.probability * 100).toFixed(0)}%</span>
                            <span>Type: {risk.type.replace('_', ' ').toUpperCase()}</span>
                          </div>
                          
                          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-800 dark:text-blue-300">
                            💡 {risk.mitigation}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mitigation Strategies */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Mitigation Strategies
                    </h3>
                    
                    <div className="space-y-2">
                      {riskAssessment.mitigationStrategies.map((strategy, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <span className="text-sm text-gray-900 dark:text-white">{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No risk assessment available
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Generate a risk assessment to identify potential financial challenges
                  </p>
                  <button
                    onClick={loadRiskAssessment}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Assessing...' : 'Assess Risks'}
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
