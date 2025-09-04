'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'
import { 
  calculateSafetyPotStatus, 
  generateReallocationSuggestions,
  calculateOptimalSafetyPotContribution,
  getSafetyPotHealthScore,
  needsImmediateAttention,
  getSafetyPotTargetExplanation,
  type SafetyPotStatus,
  type FundReallocationSuggestion
} from '@/lib/safety-pot-utils'

interface SafetyPotFundManagerProps {
  currencySymbol: string
  monthlyExpenses: number
  onUpdate?: () => void
}

export function SafetyPotFundManager({ 
  currencySymbol, 
  monthlyExpenses, 
  onUpdate 
}: SafetyPotFundManagerProps) {
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
  const [reason, setReason] = useState('')
  
  // Data states
  const [safetyPotStatus, setSafetyPotStatus] = useState<SafetyPotStatus | null>(null)
  const [reallocationSuggestions, setReallocationSuggestions] = useState<FundReallocationSuggestion[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [optimalContribution, setOptimalContribution] = useState(0)



  const loadSafetyPotData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load safety pot amount from API
      const response = await apiClient.get('/safety-pot')
      const currentAmount = response.data?.current_amount || 0
      setSafetyPotAmount(currentAmount)
      
      // Calculate safety pot status
      const status = calculateSafetyPotStatus(currentAmount, monthlyExpenses)
      setSafetyPotStatus(status)
      
      // Calculate optimal contribution
      const optimal = calculateOptimalSafetyPotContribution(currentAmount, monthlyExpenses)
      setOptimalContribution(optimal)
      
      // Load goals for reallocation suggestions
      try {
        const response = await apiClient.get('/goals')
        const goalsData = response.data || []
        setGoals(goalsData)
        
        // Generate reallocation suggestions
        const suggestions = generateReallocationSuggestions(status, goalsData, 0)
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
  }, [monthlyExpenses])

  useEffect(() => {
    loadSafetyPotData()
  }, [monthlyExpenses, loadSafetyPotData])

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addAmount || parseFloat(addAmount) <= 0) return
    
    try {
      setSaving(true)
      setError('')
      
      // Call API to add funds to safety pot
      const response = await apiClient.post('/safety-pot', {
        action: 'add',
        amount: parseFloat(addAmount)
      })
      
      if (response.data?.success) {
        const newAmount = response.data?.safetyPot.current_amount
        setSafetyPotAmount(newAmount)
        
        // Update safety pot status
        const newStatus = calculateSafetyPotStatus(newAmount, monthlyExpenses)
        setSafetyPotStatus(newStatus)
        
        // Update optimal contribution
        const newOptimal = calculateOptimalSafetyPotContribution(newAmount, monthlyExpenses)
        setOptimalContribution(newOptimal)
        
        setSuccess(`Successfully added ${currencySymbol}${addAmount} to safety pot`)
        setAddAmount('')
        setShowAddFunds(false)
        
        // Refresh reallocation suggestions
        const newSuggestions = generateReallocationSuggestions(newStatus, goals, 0)
        setReallocationSuggestions(newSuggestions)
        
        if (onUpdate) onUpdate()
      }
      
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
    if (!reason) {
      setError('Please provide a reason for withdrawal')
      return
    }
    
    try {
      setSaving(true)
      setError('')
      
      const amount = parseFloat(withdrawAmount)
      if (amount > safetyPotAmount) {
        setError('Cannot withdraw more than available in safety pot')
        return
      }
      
      // Call API to withdraw funds from safety pot
      const response = await apiClient.post('/safety-pot', {
        action: 'withdraw',
        amount: amount,
        reason: reason
      })
      
      if (response.data?.success) {
        const newAmount = response.data?.safetyPot.current_amount
        setSafetyPotAmount(newAmount)
        
        // Update safety pot status
        const newStatus = calculateSafetyPotStatus(newAmount, monthlyExpenses)
        setSafetyPotStatus(newStatus)
        
        // Update optimal contribution
        const newOptimal = calculateOptimalSafetyPotContribution(newAmount, monthlyExpenses)
        setOptimalContribution(newOptimal)
        
        setSuccess(`Successfully withdrew ${currencySymbol}${amount.toFixed(2)} from safety pot`)
        setWithdrawAmount('')
        setReason('')
        setShowWithdrawFunds(false)
        
        // Refresh reallocation suggestions
        const newSuggestions = generateReallocationSuggestions(newStatus, goals, 0)
        setReallocationSuggestions(newSuggestions)
        
        if (onUpdate) onUpdate()
      }
      
    } catch (err) {
      setError('Failed to withdraw funds from safety pot')
      console.error('Withdraw funds error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleReallocation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reallocationAmount || parseFloat(reallocationAmount) <= 0) return
    if (!selectedGoal) {
      setError('Please select a goal for reallocation')
      return
    }
    
    try {
      setSaving(true)
      setError('')
      
      const amount = parseFloat(reallocationAmount)
      if (amount > safetyPotAmount) {
        setError('Cannot reallocate more than available in safety pot')
        return
      }
      
      // Call API to reallocate funds
      const response = await apiClient.post('/safety-pot', {
        action: 'reallocate',
        amount: amount,
        targetGoalId: selectedGoal
      })
      
      if (response.data?.success) {
        const newAmount = response.data?.safetyPot.current_amount
        setSafetyPotAmount(newAmount)
        
        // Update safety pot status
        const newStatus = calculateSafetyPotStatus(newAmount, monthlyExpenses)
        setSafetyPotStatus(newStatus)
        
        // Update optimal contribution
        const newOptimal = calculateOptimalSafetyPotContribution(newAmount, monthlyExpenses)
        setOptimalContribution(newOptimal)
        
        setSuccess(`Successfully reallocated ${currencySymbol}${amount.toFixed(2)} to goal`)
        setReallocationAmount('')
        setSelectedGoal('')
        setShowReallocation(false)
        
        // Refresh reallocation suggestions
        const newSuggestions = generateReallocationSuggestions(newStatus, goals, 0)
        setReallocationSuggestions(newSuggestions)
        
        if (onUpdate) onUpdate()
      }
      
    } catch (err) {
      setError('Failed to reallocate funds')
      console.error('Reallocation error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!safetyPotStatus) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Failed to load safety pot data
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Safety Pot Status Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Safety Pot Status</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            safetyPotStatus.status === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
            safetyPotStatus.status === 'low' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
            safetyPotStatus.status === 'adequate' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
          }`}>
            {safetyPotStatus.status.charAt(0).toUpperCase() + safetyPotStatus.status.slice(1)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currencySymbol}{safetyPotAmount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Current Amount</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {currencySymbol}{safetyPotStatus.targetAmount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Target Amount</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {safetyPotStatus.monthsCovered.toFixed(1)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Months Covered</div>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            <strong>Status:</strong> {safetyPotStatus.message}
          </p>
          {safetyPotStatus.suggestions.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Suggestions:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {safetyPotStatus.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowAddFunds(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors duration-200"
        >
          💰 Add Funds
        </button>
        
        <button
          onClick={() => setShowWithdrawFunds(true)}
          className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-semibold transition-colors duration-200"
        >
          💸 Withdraw Funds
        </button>
        
        <button
          onClick={() => setShowReallocation(true)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-200"
        >
          🔄 Reallocate Funds
        </button>
      </div>

      {/* Add Funds Form */}
      {showAddFunds && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Add Funds to Safety Pot</h4>
            <button
              onClick={() => setShowAddFunds(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleAddFunds} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Amount to Add
              </label>
              <input
                type="number"
                step="0.01"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
                placeholder={`${currencySymbol}${optimalContribution.toFixed(2)}`}
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Suggested: {currencySymbol}{optimalContribution.toFixed(2)}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddFunds(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Funds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Withdraw Funds Form */}
      {showWithdrawFunds && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Withdraw Funds from Safety Pot</h4>
            <button
              onClick={() => setShowWithdrawFunds(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleWithdrawFunds} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Amount to Withdraw
              </label>
              <input
                type="number"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                placeholder={`${currencySymbol}0.00`}
                max={safetyPotAmount}
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available: {currencySymbol}{safetyPotAmount.toFixed(2)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Reason for Withdrawal
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Please explain why you need to withdraw these funds..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowWithdrawFunds(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Withdrawing...' : 'Withdraw Funds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reallocation Form */}
      {showReallocation && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Reallocate Funds to Goals</h4>
            <button
              onClick={() => setShowReallocation(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleReallocation} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Amount to Reallocate
              </label>
              <input
                type="number"
                step="0.01"
                value={reallocationAmount}
                onChange={(e) => setReallocationAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder={`${currencySymbol}0.00`}
                max={safetyPotAmount}
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Available: {currencySymbol}{safetyPotAmount.toFixed(2)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Select Goal
              </label>
              <select
                value={selectedGoal}
                onChange={(e) => setSelectedGoal(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Choose a goal...</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name} - {currencySymbol}{goal.current_amount.toFixed(2)} / {currencySymbol}{goal.target_amount.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReallocation(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Reallocating...' : 'Reallocate Funds'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-red-600 dark:text-red-400">⚠️</span>
            <span className="text-red-800 dark:text-red-200">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-green-600 dark:text-green-400">✅</span>
            <span className="text-green-800 dark:text-green-200">{success}</span>
          </div>
          <button
            onClick={() => setSuccess('')}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-sm mt-2"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

