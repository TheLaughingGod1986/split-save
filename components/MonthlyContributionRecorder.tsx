'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'
import { calculateMonthlyContribution, getCurrentMonth, getMonthName, getPreviousMonth, getNextMonth } from '@/lib/contribution-utils'

interface MonthlyContributionRecorderProps {
  partnerships: any[]
  profile: any
  partnerProfile: any
  currencySymbol: string
  onContributionRecorded: () => void
}

interface ContributionData {
  month: string
  expenses: number
  goals: number
  safetyPot: number
  total: number
  userShare: number
  partnerShare: number
}

export function MonthlyContributionRecorder({ 
  partnerships, 
  profile, 
  partnerProfile, 
  currencySymbol,
  onContributionRecorded 
}: MonthlyContributionRecorderProps) {
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth())
  const [contributionData, setContributionData] = useState<ContributionData | null>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [userContribution, setUserContribution] = useState('')
  const [partnerContribution, setPartnerContribution] = useState('')
  const [notes, setNotes] = useState('')

  const hasPartnership = partnerships.length > 0

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load expenses and goals for the current month
      const [expensesData, goalsData] = await Promise.all([
        apiClient.get('/expenses').catch(() => []),
        apiClient.get('/goals').catch(() => [])
      ])
      
      setExpenses(expensesData || [])
      setGoals(goalsData || [])
      
      // Calculate contribution breakdown
      if (profile?.income && partnerProfile?.income) {
        const breakdown = calculateMonthlyContribution(
          expensesData || [],
          goalsData || [],
          0, // Safety pot target
          profile.income,
          partnerProfile.income,
          currentMonth
        )
        
        setContributionData({
          month: currentMonth,
          expenses: breakdown.expenses,
          goals: breakdown.goals,
          safetyPot: breakdown.safetyPot,
          total: breakdown.total,
          userShare: breakdown.user1Share,
          partnerShare: breakdown.user2Share
        })
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load contribution data')
    } finally {
      setLoading(false)
    }
  }, [currentMonth, profile?.income, partnerProfile?.income])

  useEffect(() => {
    if (hasPartnership) {
      loadData()
    }
  }, [hasPartnership, currentMonth, loadData])



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contributionData) return
    
    try {
      setLoading(true)
      
      // Record monthly contribution
      await apiClient.post('/contributions', {
        month: currentMonth,
        userContribution: parseFloat(userContribution),
        partnerContribution: parseFloat(partnerContribution),
        notes: notes || null
      })
      
      toast.success('Monthly contribution recorded successfully!')
      setShowForm(false)
      resetForm()
      onContributionRecorded()
      
    } catch (error) {
      console.error('Failed to record contribution:', error)
      toast.error('Failed to record contribution')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setUserContribution('')
    setPartnerContribution('')
    setNotes('')
  }

  const handleMonthChange = (newMonth: string) => {
    setCurrentMonth(newMonth)
    setContributionData(null)
  }

  if (!hasPartnership) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
        <div className="text-4xl mb-4">🤝</div>
        <h3 className="text-xl font-medium text-blue-900 dark:text-blue-100 mb-2">Partnership Required</h3>
        <p className="text-blue-700 dark:text-blue-300">
          To record monthly contributions, you need to be connected with a partner.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Contribution Recorder</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Record your monthly contributions to track progress together
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 ${
            showForm 
              ? 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>{showForm ? '✕' : '📝'}</span>
            <span>{showForm ? 'Cancel' : 'Record Contribution'}</span>
          </span>
        </button>
      </div>

      {/* Month Selector */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Month</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleMonthChange(getPreviousMonth(currentMonth))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ← Previous
            </button>
            <span className="px-4 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-lg font-medium">
              {getMonthName(currentMonth)}
            </span>
            <button
              onClick={() => handleMonthChange(getNextMonth(currentMonth))}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
        
        {/* Current Month Summary */}
        {contributionData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {currencySymbol}{contributionData.expenses.toFixed(2)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Monthly Expenses</div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {currencySymbol}{contributionData.goals.toFixed(2)}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Goal Contributions</div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {currencySymbol}{contributionData.total.toFixed(2)}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Total Required</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contribution Form */}
      {showForm && contributionData && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Record {getMonthName(currentMonth)} Contributions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Log your actual contributions for this month
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contribution Breakdown */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl p-6">
              <h4 className="text-blue-800 dark:text-blue-200 font-medium mb-4">
                <strong>Contribution Breakdown for {getMonthName(currentMonth)}</strong>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Monthly Expenses:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {currencySymbol}{contributionData.expenses.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Goal Contributions:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {currencySymbol}{contributionData.goals.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Safety Pot:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {currencySymbol}{contributionData.safetyPot.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-blue-800 dark:text-blue-200">Total Required:</span>
                      <span className="text-blue-900 dark:text-blue-100">
                        {currencySymbol}{contributionData.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Your Share ({profile?.name || 'You'}):</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {currencySymbol}{contributionData.userShare.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Partner&apos;s Share ({partnerProfile?.name || 'Partner'}):</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {currencySymbol}{contributionData.partnerShare.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 italic">
                    Based on income proportions: {profile?.income || 0} : {partnerProfile?.income || 0}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actual Contributions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Your Actual Contribution ({profile?.name || 'You'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={userContribution}
                  onChange={(e) => setUserContribution(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder={`${currencySymbol}${contributionData.userShare.toFixed(2)}`}
                  required
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Expected: {currencySymbol}{contributionData.userShare.toFixed(2)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Partner&apos;s Actual Contribution ({partnerProfile?.name || 'Partner'})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={partnerContribution}
                  onChange={(e) => setPartnerContribution(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                  placeholder={`${currencySymbol}${contributionData.partnerShare.toFixed(2)}`}
                  required
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Expected: {currencySymbol}{contributionData.partnerShare.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white transition-colors duration-200"
                rows={3}
                placeholder="Add any notes about this month's contributions..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Recording...' : 'Record Contribution'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
