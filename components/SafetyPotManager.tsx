'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import {
  calculateSafetyPotStatus,
  generateReallocationSuggestions,
  calculateOptimalSafetyPotContribution,
  getSafetyPotHealthScore,
  needsImmediateAttention,
  type SafetyPotStatus,
  type FundReallocationSuggestion
} from '@/lib/safety-pot-utils'

interface SafetyPotManagerProps {
  currencySymbol: string
  monthlyExpenses: number
  onUpdate?: () => void
}

export default function SafetyPotManager({ currencySymbol, monthlyExpenses, onUpdate }: SafetyPotManagerProps) {
  const [safetyPotAmount, setSafetyPotAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAddFunds, setShowAddFunds] = useState(false)
  const [showWithdrawFunds, setShowWithdrawFunds] = useState(false)
  const [showReallocation, setShowReallocation] = useState(false)
  
  // Form states
  const [addAmount, setAddAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [reallocationAmount, setReallocationAmount] = useState('')
  const [selectedGoal, setSelectedGoal] = useState('')
  
  // Data states
  const [safetyPotStatus, setSafetyPotStatus] = useState<SafetyPotStatus | null>(null)
  const [reallocationSuggestions, setReallocationSuggestions] = useState<FundReallocationSuggestion[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [optimalContribution, setOptimalContribution] = useState(0)

  useEffect(() => {
    loadSafetyPotData()
  }, [monthlyExpenses])

  const loadSafetyPotData = async () => {
    try {
      setLoading(true)
      
      // Load safety pot amount (this would come from your API)
      // For now, we'll simulate with a default value
      const currentAmount = safetyPotAmount || 0
      
      // Calculate safety pot status
      const status = calculateSafetyPotStatus(currentAmount, monthlyExpenses)
      setSafetyPotStatus(status)
      
      // Calculate optimal contribution
      const optimal = calculateOptimalSafetyPotContribution(currentAmount, monthlyExpenses)
      setOptimalContribution(optimal)
      
      // Load goals for reallocation suggestions
      try {
        const goalsData = await apiClient.get('/goals')
        setGoals(goalsData || [])
        
        // Generate reallocation suggestions
        const suggestions = generateReallocationSuggestions(status, goalsData || [], 0)
        setReallocationSuggestions(suggestions)
      } catch (err) {
        console.log('Could not load goals for reallocation suggestions')
        setGoals([])
      }
      
    } catch (err) {
      setError('Failed to load safety pot data')
      console.error('Load safety pot error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addAmount || parseFloat(addAmount) <= 0) return
    
    try {
      setSaving(true)
      setError('')
      
      // This would call your API to add funds to safety pot
      const amount = parseFloat(addAmount)
      const newAmount = safetyPotAmount + amount
      setSafetyPotAmount(newAmount)
      
      // Update safety pot status
      const newStatus = calculateSafetyPotStatus(newAmount, monthlyExpenses)
      setSafetyPotStatus(newStatus)
      
      setSuccess(`Successfully added ${currencySymbol}${amount.toFixed(2)} to safety pot`)
      setAddAmount('')
      setShowAddFunds(false)
      
      if (onUpdate) onUpdate()
      
    } catch (err) {
      setError('Failed to add funds to safety pot')
      console.error('Add funds error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleWithdrawFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    
    try {
      setSaving(true)
      setError('')
      
      const amount = parseFloat(withdrawAmount)
      if (amount > safetyPotAmount) {
        setError('Cannot withdraw more than available in safety pot')
        return
      }
      
      // This would call your API to withdraw funds from safety pot
      const newAmount = safetyPotAmount - amount
      setSafetyPotAmount(newAmount)
      
      // Update safety pot status
      const newStatus = calculateSafetyPotStatus(newAmount, monthlyExpenses)
      setSafetyPotStatus(newStatus)
      
      setSuccess(`Successfully withdrew ${currencySymbol}${amount.toFixed(2)} from safety pot`)
      setWithdrawAmount('')
      setShowWithdrawFunds(false)
      
      if (onUpdate) onUpdate()
      
    } catch (err) {
      setError('Failed to withdraw funds from safety pot')
      console.error('Withdraw funds error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleReallocateFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reallocationAmount || !selectedGoal) return
    
    try {
      setSaving(true)
      setError('')
      
      const amount = parseFloat(reallocationAmount)
      if (amount > safetyPotAmount) {
        setError('Cannot reallocate more than available in safety pot')
        return
      }
      
      // This would call your API to reallocate funds
      const newAmount = safetyPotAmount - amount
      setSafetyPotAmount(newAmount)
      
      // Update safety pot status
      const newStatus = calculateSafetyPotStatus(newAmount, monthlyExpenses)
      setSafetyPotStatus(newStatus)
      
      setSuccess(`Successfully reallocated ${currencySymbol}${amount.toFixed(2)} to savings goal`)
      setReallocationAmount('')
      setSelectedGoal('')
      setShowReallocation(false)
      
      if (onUpdate) onUpdate()
      
    } catch (err) {
      setError('Failed to reallocate funds')
      console.error('Reallocate funds error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!safetyPotStatus) {
    return null
  }

  const healthScore = getSafetyPotHealthScore(safetyPotStatus)
  const needsAttention = needsImmediateAttention(safetyPotStatus)

  return (
    <div className="space-y-6">
      {/* Safety Pot Status Card */}
      <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border ${
        needsAttention 
          ? 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20' 
          : 'border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            🛡️ Safety Pot
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              safetyPotStatus.status === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
              safetyPotStatus.status === 'low' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
              safetyPotStatus.status === 'adequate' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
            }`}>
              {safetyPotStatus.status.charAt(0).toUpperCase() + safetyPotStatus.status.slice(1)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Health: {healthScore}%
            </span>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currencySymbol}{safetyPotAmount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Current Amount</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {safetyPotStatus.monthsCovered.toFixed(1)}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Months Covered</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currencySymbol}{safetyPotStatus.targetAmount.toFixed(2)}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">Target Amount</div>
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-4 rounded-lg border ${
          safetyPotStatus.status === 'critical' ? 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-700' :
          safetyPotStatus.status === 'low' ? 'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700' :
          safetyPotStatus.status === 'adequate' ? 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-700' :
          'bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
        }`}>
          <p className={`text-sm font-medium ${
            safetyPotStatus.status === 'critical' ? 'text-red-800 dark:text-red-200' :
            safetyPotStatus.status === 'low' ? 'text-yellow-800 dark:text-yellow-200' :
            safetyPotStatus.status === 'adequate' ? 'text-green-800 dark:text-green-200' :
            'text-blue-800 dark:text-blue-200'
          }`}>
            {safetyPotStatus.message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => setShowAddFunds(true)}
            className="btn btn-success px-4 py-2"
          >
            Add Funds
          </button>
          
          <button
            onClick={() => setShowWithdrawFunds(true)}
            className="btn btn-secondary px-4 py-2"
            disabled={safetyPotAmount <= 0}
          >
            Withdraw Funds
          </button>
          
          {safetyPotStatus.status === 'excess' && (
            <button
              onClick={() => setShowReallocation(true)}
              className="btn btn-primary px-4 py-2"
            >
              Reallocate Funds
            </button>
          )}
        </div>
      </div>

      {/* Suggestions and Recommendations */}
      {safetyPotStatus.suggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            💡 Recommendations
          </h4>
          <ul className="space-y-2">
            {safetyPotStatus.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Optimal Contribution */}
      {optimalContribution > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📊 Optimal Monthly Contribution
          </h4>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {currencySymbol}{optimalContribution.toFixed(2)}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Monthly contribution to reach target in 12 months
            </div>
          </div>
        </div>
      )}

      {/* Reallocation Suggestions */}
      {reallocationSuggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            🔄 Fund Reallocation Suggestions
          </h4>
          <div className="space-y-3">
            {reallocationSuggestions.map((suggestion, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    suggestion.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                  }`}>
                    {suggestion.priority.toUpperCase()}
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currencySymbol}{suggestion.amount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {suggestion.reason}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {suggestion.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Add Funds to Safety Pot
            </h3>
            <form onSubmit={handleAddFunds}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-success flex-1"
                >
                  {saving ? 'Adding...' : 'Add Funds'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFunds(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Funds Modal */}
      {showWithdrawFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Withdraw Funds from Safety Pot
            </h3>
            <form onSubmit={handleWithdrawFunds}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={safetyPotAmount}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Available: {currencySymbol}{safetyPotAmount.toFixed(2)}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-secondary flex-1"
                >
                  {saving ? 'Withdrawing...' : 'Withdraw Funds'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawFunds(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reallocate Funds Modal */}
      {showReallocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Reallocate Funds to Savings Goal
            </h3>
            <form onSubmit={handleReallocateFunds}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={safetyPotAmount}
                  value={reallocationAmount}
                  onChange={(e) => setReallocationAmount(e.target.value)}
                  className="form-input w-full"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Savings Goal
                </label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="form-select w-full"
                  required
                >
                  <option value="">Select a goal</option>
                  {goals.map(goal => (
                    <option key={goal.id} value={goal.id}>
                      {goal.name} - {currencySymbol}{goal.current_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? 'Reallocating...' : 'Reallocate Funds'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReallocation(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}
      
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </div>
  )
}
