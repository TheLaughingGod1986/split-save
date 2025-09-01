'use client'

import { useState, useEffect } from 'react'

interface DashboardContributionSummaryProps {
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
  expenses?: any[] // Add expenses prop
}

export function DashboardContributionSummary({
  partnerships,
  profile,
  user,
  currencySymbol,
  expenses
}: DashboardContributionSummaryProps) {
  // Utility function to round monetary values to 2 decimal places
  const roundMoney = (amount: number) => Math.round(amount * 100) / 100
  const [partnerProfiles, setPartnerProfiles] = useState<any>(null)

  const activePartnership = partnerships.find(p => p.status === 'active')

  // For now, let's use a simpler approach - show the summary based on current user's profile
  useEffect(() => {
    if (activePartnership && profile) {
      // Simulate partner profiles data for demonstration
      const mockPartnerProfiles = {
        user1Profile: profile,
        user2Profile: {
          id: 'partner-profile',
          name: 'Partner',
          email: 'partner@example.com',
          income: 3000, // Assuming partner also has £3000
          currency: 'GBP',
          country_code: 'GB',
          personal_allowance: 400 // Partner also has £400 personal allowance
        }
      }
      setPartnerProfiles(mockPartnerProfiles)
    }
  }, [activePartnership, profile])

  if (!activePartnership || !profile) return null

  if (!partnerProfiles) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="text-center py-4">
          <div className="text-2xl mb-2">💰</div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Monthly Contributions</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Loading contribution breakdown...</p>
        </div>
      </div>
    )
  }

  // Determine which user is which
  const currentUserProfile = profile.user_id === partnerProfiles.user1Profile.user_id ? partnerProfiles.user1Profile : partnerProfiles.user2Profile
  const partnerProfile = profile.user_id === partnerProfiles.user1Profile.user_id ? partnerProfiles.user2Profile : partnerProfiles.user1Profile

  const userIncome = currentUserProfile.income || 0
  const partnerIncome = partnerProfile.income || 0
  const userPersonalAllowance = currentUserProfile.personal_allowance || 0
  const partnerPersonalAllowance = partnerProfile.personal_allowance || 0
  
  // Calculate disposable income (after personal allowance)
  const userDisposableIncome = userIncome - userPersonalAllowance
  const partnerDisposableIncome = partnerIncome - partnerPersonalAllowance
  const totalDisposableIncome = userDisposableIncome + partnerDisposableIncome

  if (totalDisposableIncome <= 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="text-center py-4">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Insufficient Income</h3>
          <p className="text-xs text-gray-500">After personal allowances, not enough for shared expenses</p>
        </div>
      </div>
    )
  }

  // Calculate proportional shares based on disposable income
  const userShare = userDisposableIncome / totalDisposableIncome
  const partnerShare = partnerDisposableIncome / totalDisposableIncome

  // Monthly budget allocation (70% expenses, 20% savings, 10% safety net)
  let totalMonthlyExpenses = totalDisposableIncome * 0.7
  let totalMonthlySavings = totalDisposableIncome * 0.2
  let totalMonthlySafetyNet = totalDisposableIncome * 0.1
  
  // Calculate actual expenses needed from your real data
  const actualExpensesNeeded = expenses ? expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0
  const expensesOverflow = totalMonthlyExpenses - actualExpensesNeeded
  
  if (expensesOverflow > 0) {
    // Cap expenses and redistribute overflow to savings and safety net
    totalMonthlyExpenses = actualExpensesNeeded
    totalMonthlySavings += roundMoney(expensesOverflow * 0.7) // 70% of overflow goes to savings
    totalMonthlySafetyNet += roundMoney(expensesOverflow * 0.3) // 30% of overflow goes to safety net
  }

  // Individual contributions
  const userExpenseContribution = totalMonthlyExpenses * userShare
  const userSavingsContribution = totalMonthlySavings * userShare
  const userSafetyNetContribution = totalMonthlySafetyNet * userShare

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
        <span className="mr-2">💰</span>
        Monthly Contributions
      </h3>
      
      {/* Complete Salary Overview */}
      <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">💰</span>
          Complete Salary Breakdown for Both Partners
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Complete Salary Breakdown */}
          <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
            <h5 className="font-semibold text-blue-800 mb-3 flex items-center">
              <span className="mr-2">👤</span>
              You - Complete Financial Picture
            </h5>
            
            <div className="space-y-3">
              {/* Gross Income */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h6 className="font-medium text-blue-800 mb-2">Gross Income</h6>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p><strong>Monthly Salary:</strong></p>
                    <p className="text-blue-600 font-medium">{currencySymbol}{profile?.income || 0}</p>
                  </div>
                  <div>
                    <p><strong>Extra Income:</strong></p>
                    <p className="text-green-600 font-medium">{currencySymbol}0.00</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p><strong>Total Gross Income:</strong></p>
                  <p className="text-xl font-bold text-blue-800">{currencySymbol}{profile?.income || 0}</p>
                </div>
              </div>
              
              {/* Personal Allowance */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h6 className="font-medium text-blue-800 mb-2">Personal Allowance</h6>
                <div className="text-center">
                  <p className="text-red-600 font-medium text-lg">-{currencySymbol}{profile?.personal_allowance || 0}</p>
                  <p className="text-xs text-blue-600">Your monthly personal spending money</p>
                </div>
              </div>
              
              {/* Net Disposable */}
              <div className="bg-blue-100 p-3 rounded-lg border border-blue-300">
                <h6 className="font-medium text-blue-800 mb-2">Net Disposable Income</h6>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">{currencySymbol}{userDisposableIncome.toFixed(2)}</p>
                  <p className="text-sm text-blue-600">Available for shared expenses & savings</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Partner's Complete Salary Breakdown */}
          <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
            <h5 className="font-semibold text-green-800 mb-3 flex items-center">
              <span className="mr-2">👥</span>
              Partner - Complete Financial Picture
            </h5>
            
            <div className="space-y-3">
              {/* Gross Income */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h6 className="font-medium text-green-800 mb-2">Gross Income</h6>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p><strong>Monthly Salary:</strong></p>
                    <p className="text-green-600 font-medium">{currencySymbol}3000</p>
                  </div>
                  <div>
                    <p><strong>Extra Income:</strong></p>
                    <p className="text-green-600 font-medium">{currencySymbol}0.00</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-green-200">
                  <p><strong>Total Gross Income:</strong></p>
                  <p className="text-xl font-bold text-green-800">{currencySymbol}3000</p>
                </div>
              </div>
              
              {/* Personal Allowance */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h6 className="font-medium text-green-800 mb-2">Personal Allowance</h6>
                <div className="text-center">
                  <p className="text-red-600 font-medium text-lg">-{currencySymbol}400</p>
                  <p className="text-xs text-green-600">Partner&apos;s monthly personal spending money</p>
                </div>
              </div>
              
              {/* Net Disposable */}
              <div className="bg-green-100 p-3 rounded-lg border border-green-300">
                <h6 className="font-medium text-green-800 mb-2">Net Disposable Income</h6>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-800">{currencySymbol}{partnerDisposableIncome.toFixed(2)}</p>
                  <p className="text-sm text-green-600">Available for shared expenses & savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Combined Summary */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
          <h6 className="font-medium text-gray-800 mb-2 flex items-center">
            <span className="mr-2">📊</span>
            Combined Financial Summary
          </h6>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600 mb-1">Total Gross Income</p>
              <p className="text-lg font-bold text-gray-800">{currencySymbol}{((profile?.income || 0) + 3000).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Both partners combined</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-1">Total Personal Allowances</p>
              <p className="text-lg font-bold text-gray-800">{currencySymbol}{((profile?.personal_allowance || 0) + 400).toFixed(2)}</p>
              <p className="text-xs text-gray-500">Both partners combined</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-1">Total Disposable Income</p>
              <p className="text-lg font-bold text-gray-800">{currencySymbol}{totalDisposableIncome.toFixed(2)}</p>
              <p className="text-xs text-gray-500">Available for shared expenses & savings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Allocation Note */}
      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        <p><strong>💡 Smart Allocation:</strong> Expenses are capped at your actual monthly expenses (£{actualExpensesNeeded.toFixed(2)}). 
        Any excess is automatically redistributed to savings and safety net for better financial planning.</p>
        {actualExpensesNeeded > 0 && (
          <p className="mt-1 text-blue-600">
            <strong>Current expenses:</strong> {expenses?.length || 0} items totaling £{actualExpensesNeeded.toFixed(2)}
          </p>
        )}
      </div>
      
      {/* Partner Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Your Contributions */}
        <div className="bg-blue-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-blue-800 mb-2">You</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Expenses</p>
              <p className="text-sm font-bold text-blue-600">{currencySymbol}{userExpenseContribution.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Savings</p>
              <p className="text-sm font-bold text-purple-600">{currencySymbol}{userSavingsContribution.toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Safety Net</p>
              <p className="text-sm font-bold text-orange-600">{currencySymbol}{userSafetyNetContribution.toFixed(0)}</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2 text-center">
            Disposable: <span className="font-semibold">{currencySymbol}{userDisposableIncome.toFixed(0)}</span>
            <br />
            <span className="text-blue-600">({Math.round(userShare * 1000) / 10}% share)</span>
          </div>
        </div>

        {/* Partner's Contributions */}
        <div className="bg-green-50 rounded-lg p-3">
          <h4 className="text-xs font-semibold text-green-800 mb-2">Partner</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Expenses</p>
              <p className="text-sm font-bold text-blue-600">{currencySymbol}{(totalMonthlyExpenses * partnerShare).toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Savings</p>
              <p className="text-sm font-bold text-purple-600">{currencySymbol}{(totalMonthlySavings * partnerShare).toFixed(0)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Safety Net</p>
              <p className="text-sm font-bold text-orange-600">{currencySymbol}{(totalMonthlySafetyNet * partnerShare).toFixed(0)}</p>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-2 text-center">
            Disposable: <span className="font-semibold">{currencySymbol}{partnerDisposableIncome.toFixed(0)}</span>
            <br />
            <span className="text-green-600">({Math.round(partnerShare * 1000) / 10}% share)</span>
          </div>
        </div>
      </div>

              {/* Combined Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">💡 This month&apos;s total:</p>
                      <div className="grid grid-cols-3 gap-2 text-xs text-gray-700 dark:text-gray-300">
            <div className="text-center">
              <p className="font-semibold">{currencySymbol}{totalMonthlyExpenses.toFixed(0)}</p>
              <p className="text-gray-500">Joint Expenses</p>
              {expensesOverflow > 0 && (
                <p className="text-xs text-green-600">Capped at needed</p>
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold">{currencySymbol}{totalMonthlySavings.toFixed(0)}</p>
              <p className="text-gray-500">Joint Savings</p>
              {expensesOverflow > 0 && (
                <p className="text-xs text-green-600">+{currencySymbol}{roundMoney(expensesOverflow * 0.7)} overflow</p>
              )}
            </div>
            <div className="text-center">
              <p className="font-semibold">{currencySymbol}{totalMonthlySafetyNet.toFixed(0)}</p>
              <p className="text-gray-500">Safety Net</p>
              {expensesOverflow > 0 && (
                <p className="text-xs text-green-600">+{currencySymbol}{roundMoney(expensesOverflow * 0.3)} overflow</p>
              )}
            </div>
          </div>
          
          {/* Overflow Explanation */}
          {expensesOverflow > 0 && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              <p><strong>💰 Smart Allocation:</strong> Expenses capped at {currencySymbol}{actualExpensesNeeded.toFixed(2)} needed. 
              Extra {currencySymbol}{roundMoney(expensesOverflow)} redistributed to savings and safety net.</p>
            </div>
          )}
        </div>
        
        {/* Detailed Partner Contribution Breakdown */}
        <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Detailed Partner Contribution Breakdown
          </h4>
          
          <div className="space-y-4">
            {/* Expenses Breakdown */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2 flex items-center">
                <span className="mr-2">🏠</span>
                Shared Expenses Breakdown
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">You Contribute</p>
                  <p className="text-lg font-bold text-blue-600">{currencySymbol}{roundMoney(totalMonthlyExpenses * userShare)}</p>
                  <p className="text-xs text-blue-600">({(userShare * 100).toFixed(1)}% of total)</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Partner Contributes</p>
                  <p className="text-lg font-bold text-green-600">{currencySymbol}{roundMoney(totalMonthlyExpenses * partnerShare)}</p>
                  <p className="text-xs text-green-600">({(partnerShare * 100).toFixed(1)}% of total)</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Total Expenses</p>
                  <p className="text-lg font-bold text-gray-800">{currencySymbol}{roundMoney(totalMonthlyExpenses)}</p>
                  <p className="text-xs text-gray-500">Capped at actual needs</p>
                </div>
              </div>
            </div>
            
            {/* Savings Breakdown */}
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <h5 className="font-medium text-purple-800 mb-2 flex items-center">
                <span className="mr-2">🎯</span>
                Savings Goals Breakdown
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">You Contribute</p>
                  <p className="text-lg font-bold text-purple-600">{currencySymbol}{roundMoney(totalMonthlySavings * userShare)}</p>
                  <p className="text-xs text-purple-600">({(userShare * 100).toFixed(1)}% of total)</p>
                  {expensesOverflow > 0 && (
                    <p className="text-xs text-green-600">+{currencySymbol}{roundMoney(expensesOverflow * 0.7 * userShare)} overflow</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Partner Contributes</p>
                  <p className="text-lg font-bold text-purple-600">{currencySymbol}{roundMoney(totalMonthlySavings * partnerShare)}</p>
                  <p className="text-xs text-purple-600">({(partnerShare * 100).toFixed(1)}% of total)</p>
                  {expensesOverflow > 0 && (
                    <p className="text-xs text-green-600">+{currencySymbol}{roundMoney(expensesOverflow * 0.7 * partnerShare)} overflow</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Total Savings</p>
                  <p className="text-lg font-bold text-gray-800">{currencySymbol}{roundMoney(totalMonthlySavings)}</p>
                  <p className="text-xs text-gray-500">+ overflow redistribution</p>
                </div>
              </div>
            </div>
            
            {/* Safety Net Breakdown */}
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <h5 className="font-medium text-orange-800 mb-2 flex items-center">
                <span className="mr-2">🛡️</span>
                Safety Net Breakdown
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-gray-600 mb-1">You Contribute</p>
                  <p className="text-lg font-bold text-orange-600">{currencySymbol}{roundMoney(totalMonthlySafetyNet * userShare)}</p>
                  <p className="text-xs text-orange-600">({(userShare * 100).toFixed(1)}% of total)</p>
                  {expensesOverflow > 0 && (
                    <p className="text-xs text-green-600">+{currencySymbol}{roundMoney(expensesOverflow * 0.3 * userShare)} overflow</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Partner Contributes</p>
                  <p className="text-lg font-bold text-orange-600">{currencySymbol}{roundMoney(totalMonthlySafetyNet * partnerShare)}</p>
                  <p className="text-xs text-orange-600">({(partnerShare * 100).toFixed(1)}% of total)</p>
                  {expensesOverflow > 0 && (
                    <p className="text-xs text-green-600">+{currencySymbol}{roundMoney(expensesOverflow * 0.3 * partnerShare)} overflow</p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-gray-600 mb-1">Total Safety Net</p>
                  <p className="text-lg font-bold text-gray-800">{currencySymbol}{roundMoney(totalMonthlySafetyNet)}</p>
                  <p className="text-xs text-gray-500">+ overflow redistribution</p>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}
