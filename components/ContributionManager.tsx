'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import {
  calculateContributionSummary,
  calculateContributionStatus,
  getMonthName,
  getContributionStatusColor,
  getContributionStatusBadgeColor,
  formatCurrency,
  type MonthlyContribution,
  type ContributionSummary
} from '@/lib/contribution-utils'

interface ContributionManagerProps {
  currencySymbol: string
  onUpdate?: () => void
}

export default function ContributionManager({ currencySymbol, onUpdate }: ContributionManagerProps) {
  const [contributions, setContributions] = useState<MonthlyContribution[]>([])
  const [summary, setSummary] = useState<ContributionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCreateMonth, setShowCreateMonth] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState('')
  
  // Mock user IDs for now - these would come from auth context
  const currentUserId = 'user1' // This would be the actual logged-in user ID
  const partnerUserId = 'user2' // This would be the partner's user ID

  useEffect(() => {
    loadContributions()
  }, [])

  const loadContributions = async () => {
    try {
      setLoading(true)
      const data = await apiClient.get('/contributions')
      setContributions(data || [])
      
      // Calculate summary
      if (data && data.length > 0) {
        const summaryData = calculateContributionSummary(data, currentUserId, partnerUserId)
        setSummary(summaryData)
      }
    } catch (err) {
      console.error('Failed to load contributions:', err)
      setError('Failed to load contributions')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsPaid = async (contributionId: string) => {
    try {
      setSaving(true)
      setError('')
      
      const result = await apiClient.post(`/contributions/${contributionId}/mark-paid`)
      
      if (result.isComplete) {
        setSuccess(result.message)
      } else {
        setSuccess(result.message)
      }
      
      // Reload contributions to get updated status
      await loadContributions()
      
      if (onUpdate) onUpdate()
      
    } catch (err) {
      setError('Failed to mark contribution as paid')
      console.error('Mark as paid error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateMonth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMonth) return
    
    try {
      setSaving(true)
      setError('')
      
      await apiClient.post('/contributions', { month: selectedMonth })
      
      setSuccess('Monthly contribution created successfully')
      setSelectedMonth('')
      setShowCreateMonth(false)
      
      // Reload contributions
      await loadContributions()
      
      if (onUpdate) onUpdate()
      
    } catch (err) {
      setError('Failed to create monthly contribution')
      console.error('Create month error:', err)
    } finally {
      setSaving(false)
    }
  }

  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          💰 Monthly Contributions
        </h2>
        <button
          onClick={() => setShowCreateMonth(true)}
          className="btn btn-primary px-4 py-2"
        >
          Create Month
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">This Month</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(summary.currentMonth.userAmount, currencySymbol)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Due: {summary.currentMonth.daysUntilDue > 0 ? `in ${summary.currentMonth.daysUntilDue} days` : 'Overdue'}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Contributed</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(summary.totalContributed, currencySymbol)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {summary.completionRate.toFixed(1)}% completion rate
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Partner Status</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.currentMonth.partnerPaid ? 'Paid' : 'Pending'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {formatCurrency(summary.currentMonth.partnerAmount, currencySymbol)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">Streak</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {summary.streakMonths} months
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Consecutive complete months
            </div>
          </div>
        </div>
      )}

      {/* Current Month Status */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Current Month: {getMonthName(summary.currentMonth.month)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Status */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Your Contribution</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(summary.currentMonth.userAmount, currencySymbol)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  getContributionStatusBadgeColor(summary.currentMonth.status)
                }`}>
                  {summary.currentMonth.status.charAt(0).toUpperCase() + summary.currentMonth.status.slice(1)}
                </span>
              </div>
              {summary.currentMonth.userPaidDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid on:</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(summary.currentMonth.userPaidDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {!summary.currentMonth.userPaid && (
                <button
                  onClick={() => handleMarkAsPaid(contributions[0]?.id || '')}
                  disabled={saving}
                  className="btn btn-success w-full"
                >
                  {saving ? 'Marking...' : 'Mark as Paid'}
                </button>
              )}
            </div>
            
            {/* Partner Status */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Partner's Contribution</h4>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(summary.currentMonth.partnerAmount, currencySymbol)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  summary.currentMonth.partnerPaid 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                }`}>
                  {summary.currentMonth.partnerPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {summary.currentMonth.partnerPaidDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid on:</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(summary.currentMonth.partnerPaidDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Overall Status */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Monthly Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                getContributionStatusBadgeColor(summary.currentMonth.status)
              }`}>
                {summary.currentMonth.status.charAt(0).toUpperCase() + summary.currentMonth.status.slice(1)}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Total Required: {formatCurrency(summary.currentMonth.totalRequired, currencySymbol)}
            </div>
          </div>
        </div>
      )}

      {/* Previous Months */}
      {summary && summary.previousMonths.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Previous Months
          </h3>
          <div className="space-y-3">
            {summary.previousMonths.slice(0, 6).map((month, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 dark:text-gray-300">
                    {getMonthName(month.month)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    getContributionStatusBadgeColor(month.status)
                  }`}>
                    {month.status.charAt(0).toUpperCase() + month.status.slice(1)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(month.userAmount, currencySymbol)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {month.userPaid ? 'Paid' : 'Not paid'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Month Modal */}
      {showCreateMonth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Create Monthly Contribution
            </h3>
            <form onSubmit={handleCreateMonth}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="form-input w-full"
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the month to create contribution for
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary flex-1"
                >
                  {saving ? 'Creating...' : 'Create Month'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateMonth(false)}
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
