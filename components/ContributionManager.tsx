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
      
      const result = await apiClient.post(`/contributions/${contributionId}/mark-paid`, {})
      
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

      {/* Partner Accountability Summary */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg shadow dark:shadow-lg border border-blue-200 dark:border-blue-700 mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            🤝 Partnership Accountability Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Your Performance */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {summary.previousMonths.filter(m => m.userPaid).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Months You Paid</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Out of {summary.previousMonths.length + 1} total months
              </div>
            </div>
            
            {/* Partner Performance */}
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {summary.previousMonths.filter(m => m.partnerPaid).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Months Partner Paid</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Out of {summary.previousMonths.length + 1} total months
              </div>
            </div>
            
            {/* Partnership Health */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {summary.previousMonths.filter(m => m.userPaid && m.partnerPaid).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Complete Months</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Both partners paid
              </div>
            </div>
          </div>
          
          {/* Accountability Message */}
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-700 dark:text-gray-300 text-center">
              {summary.completionRate >= 90 ? (
                <span className="text-green-600 dark:text-green-400">🎉 Excellent partnership! Both partners are consistently contributing.</span>
              ) : summary.completionRate >= 70 ? (
                <span className="text-yellow-600 dark:text-yellow-400">⚠️ Good partnership, but there&apos;s room for improvement in consistency.</span>
              ) : (
                <span className="text-red-600 dark:text-red-400">🚨 Partnership needs attention. Consider discussing contribution patterns.</span>
              )}
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
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Partner&apos;s Contribution</h4>
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

          {/* Contribution Breakdown Details */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-3">
              💡 How Your Contribution Was Calculated
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-blue-700 dark:text-blue-300 font-medium mb-2">Your Share:</div>
                <div className="space-y-1 text-blue-600 dark:text-blue-400">
                  <div>• Amount: {formatCurrency(summary.currentMonth.userAmount, currencySymbol)}</div>
                  <div>• Percentage: {((summary.currentMonth.userAmount / summary.currentMonth.totalRequired) * 100).toFixed(1)}%</div>
                  <div>• Based on: Income proportion</div>
                </div>
              </div>
              <div>
                <div className="text-purple-700 dark:text-purple-300 font-medium mb-2">Partner&apos;s Share:</div>
                <div className="space-y-1 text-purple-600 dark:text-purple-400">
                  <div>• Amount: {formatCurrency(summary.currentMonth.partnerAmount, currencySymbol)}</div>
                  <div>• Percentage: {((summary.currentMonth.partnerAmount / summary.currentMonth.totalRequired) * 100).toFixed(1)}%</div>
                  <div>• Based on: Income proportion</div>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-600">
              <div className="text-xs text-blue-600 dark:text-blue-400">
                💰 Total monthly requirement includes: Shared expenses + Goal contributions + Safety pot funding
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Partner Contribution Breakdown */}
      {summary && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📊 Partner Contribution Breakdown
          </h3>
          
          {/* Current Month Breakdown */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
              {getMonthName(summary.currentMonth.month)} - Detailed View
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Your Contribution Details */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-blue-800 dark:text-blue-200">Your Contribution</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    summary.currentMonth.userPaid 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                  }`}>
                    {summary.currentMonth.userPaid ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Amount:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">
                      {formatCurrency(summary.currentMonth.userAmount, currencySymbol)}
                    </span>
                  </div>
                  {summary.currentMonth.userPaidDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Paid on:</span>
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        {new Date(summary.currentMonth.userPaidDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Status:</span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      {summary.currentMonth.userPaid ? 'Contribution Complete' : 'Awaiting Payment'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Partner's Contribution Details */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-purple-800 dark:text-purple-200">Partner&apos;s Contribution</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    summary.currentMonth.partnerPaid 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                  }`}>
                    {summary.currentMonth.partnerPaid ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Amount:</span>
                    <span className="font-semibold text-purple-900 dark:text-purple-100">
                      {formatCurrency(summary.currentMonth.partnerAmount, currencySymbol)}
                    </span>
                  </div>
                  {summary.currentMonth.partnerPaidDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-purple-700 dark:text-purple-300">Paid on:</span>
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        {new Date(summary.currentMonth.partnerPaidDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-purple-700 dark:text-purple-300">Status:</span>
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                      {summary.currentMonth.partnerPaid ? 'Contribution Complete' : 'Awaiting Payment'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Progress</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {summary.currentMonth.userPaid && summary.currentMonth.partnerPaid ? '100%' : 
                 (summary.currentMonth.userPaid || summary.currentMonth.partnerPaid ? '50%' : '0%')}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  summary.currentMonth.userPaid && summary.currentMonth.partnerPaid 
                    ? 'bg-green-500' 
                    : summary.currentMonth.userPaid || summary.currentMonth.partnerPaid 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${summary.currentMonth.userPaid && summary.currentMonth.partnerPaid ? 100 : 
                          (summary.currentMonth.userPaid || summary.currentMonth.partnerPaid ? 50 : 0)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Previous Months with Partner Details */}
      {summary && summary.previousMonths.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            📅 Contribution History
          </h3>
          <div className="space-y-4">
            {summary.previousMonths.slice(0, 6).map((month, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {getMonthName(month.month)}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    getContributionStatusBadgeColor(month.status)
                  }`}>
                    {month.status.charAt(0).toUpperCase() + month.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Your History */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">You:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        month.userPaid 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      }`}>
                        {month.userPaid ? '✅ Paid' : '❌ Not Paid'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Amount: {formatCurrency(month.userAmount, currencySymbol)}
                    </div>
                    {month.userPaidDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Paid: {new Date(month.userPaidDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Partner History */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Partner:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        month.partnerPaid 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                      }`}>
                        {month.partnerPaid ? '✅ Paid' : '❌ Not Paid'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Amount: {formatCurrency(month.partnerAmount, currencySymbol)}
                    </div>
                    {month.partnerPaidDate && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Paid: {new Date(month.partnerPaidDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Monthly Summary */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total Required: {formatCurrency(month.totalRequired, currencySymbol)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {month.userPaid && month.partnerPaid ? '🎉 Complete' : '⏳ Incomplete'}
                    </span>
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
