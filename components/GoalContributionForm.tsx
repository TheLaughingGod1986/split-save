'use client'

import { useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'
import { getCurrentMonth } from '@/lib/contribution-utils'

interface GoalContributionFormProps {
  goal: any
  partnerships: any[]
  profile: any
  partnerProfile: any
  currencySymbol: string
  onContributionAdded: () => void
}

export function GoalContributionForm({ 
  goal, 
  partnerships, 
  profile, 
  partnerProfile, 
  currencySymbol,
  onContributionAdded 
}: GoalContributionFormProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [month, setMonth] = useState(getCurrentMonth().split('-')[1]) // Current month number
  const [year, setYear] = useState(new Date().getFullYear().toString())

  const hasPartnership = partnerships.length > 0
  const currentMonth = getCurrentMonth()
  const [currentMonthNum, currentYearNum] = currentMonth.split('-')

  // Calculate expected monthly contribution
  const remainingAmount = goal.target_amount - goal.current_amount
  const monthsRemaining = goal.target_date ? 
    Math.max(1, Math.ceil((new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30))) : 
    12
  const expectedMonthlyContribution = remainingAmount / monthsRemaining

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    
    try {
      setLoading(true)
      
      // Add contribution to goal
      const response = await apiClient.post(`/goals/${goal.id}/contribute`, {
        amount: parseFloat(amount),
        message: message || null,
        month: parseInt(month),
        year: parseInt(year)
      })
      
      if (response.success) {
        toast.success('Contribution added successfully!')
        setShowForm(false)
        resetForm()
        onContributionAdded()
        
        // Show completion message if goal is now complete
        if (response.contribution.isCompleted) {
          toast.success(`🎉 Goal "${goal.name}" completed!`, { duration: 5000 })
        }
      }
      
    } catch (error) {
      console.error('Failed to add contribution:', error)
      toast.error('Failed to add contribution')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setAmount('')
    setMessage('')
    setMonth(currentMonthNum)
    setYear(currentYearNum)
  }

  const handleCancel = () => {
    setShowForm(false)
    resetForm()
  }

  if (!hasPartnership) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Quick Contribution Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center justify-center space-x-2">
            <span>💰</span>
            <span>Add Contribution</span>
          </span>
        </button>
      )}

      {/* Contribution Form */}
      {showForm && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-green-800 dark:text-green-200 font-medium">
              <strong>Add Contribution to "{goal.name}"</strong>
            </h4>
            <button
              onClick={handleCancel}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goal Progress Info */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700 dark:text-green-300">Current Amount:</span>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    {currencySymbol}{goal.current_amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Target Amount:</span>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    {currencySymbol}{goal.target_amount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Remaining:</span>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    {currencySymbol}{remainingAmount.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span className="text-green-700 dark:text-green-300">Monthly Target:</span>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    {currencySymbol}{expectedMonthlyContribution.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contribution Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                  Contribution Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-green-900/30 dark:text-green-100"
                  placeholder={`${currencySymbol}${expectedMonthlyContribution.toFixed(2)}`}
                  required
                />
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Suggested: {currencySymbol}{expectedMonthlyContribution.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-green-900/30 dark:text-green-100"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                      {new Date(2024, m - 1).toLocaleDateString('en-US', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-green-900/30 dark:text-green-100"
                required
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-green-200 dark:border-green-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-green-900/30 dark:text-green-100"
                rows={2}
                placeholder="Add a note about this contribution..."
              ></textarea>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add Contribution'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
