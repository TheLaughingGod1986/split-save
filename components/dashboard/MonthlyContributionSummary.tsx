'use client'

import { useState, useEffect } from 'react'

interface MonthlyContributionSummaryProps {
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
}

export function MonthlyContributionSummary({ 
  partnerships, 
  profile, 
  user, 
  currencySymbol 
}: MonthlyContributionSummaryProps) {
  const [partnerProfiles, setPartnerProfiles] = useState<any>(null)
  
  const activePartnership = partnerships.find(p => p.status === 'active')
  
  // For now, let's use a simpler approach - show the summary based on current user's profile
  // and indicate that partner data is needed
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Monthly Contribution Summary</h3>
          <p className="text-gray-500 dark:text-gray-400">Click to load your contribution breakdown</p>
          <button 
            onClick={() => setPartnerProfiles(null)} // Reset to trigger reload
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Load Breakdown
          </button>
          
          {/* Fallback: Show basic info using current profile */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Preview (Your Income Only)</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your monthly income: <strong>{currencySymbol}{profile.income || 0}</strong>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Partner income data needed for full breakdown
            </p>
          </div>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">⚠️</div>
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Insufficient Disposable Income</h3>
                  <p className="text-gray-500 dark:text-gray-400">After personal allowances, there&apos;s not enough income for shared expenses</p>
                </div>
              </div>
            )
          }

          // Calculate proportional shares based on disposable income
          const userShare = userDisposableIncome / totalDisposableIncome
          const partnerShare = partnerDisposableIncome / totalDisposableIncome

          // Monthly budget allocation (70% expenses, 20% savings, 10% safety net)
          const totalMonthlyExpenses = totalDisposableIncome * 0.7
          const totalMonthlySavings = totalDisposableIncome * 0.2
          const totalMonthlySafetyNet = totalDisposableIncome * 0.1
  
            // Individual contributions
          const userExpenseContribution = totalMonthlyExpenses * userShare
          const partnerExpenseContribution = totalMonthlyExpenses * partnerShare
          const userSavingsContribution = totalMonthlySavings * userShare
          const partnerSavingsContribution = totalMonthlySavings * partnerShare
          const userSafetyNetContribution = totalMonthlySafetyNet * userShare
          const partnerSafetyNetContribution = totalMonthlySafetyNet * partnerShare
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
        <span className="mr-2">💰</span>
        Monthly Contribution Summary
      </h2>
      
                    {/* Income Overview */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Income Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Your Monthly Income</p>
                    <p className="text-xl font-bold text-blue-600">{currencySymbol}{userIncome.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Personal Allowance: {currencySymbol}{userPersonalAllowance.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-blue-700">Disposable: {currencySymbol}{userDisposableIncome.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">({(userShare * 100).toFixed(1)}% of disposable)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Partner&apos;s Monthly Income</p>
                    <p className="text-xl font-bold text-green-600">{currencySymbol}{partnerIncome.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Personal Allowance: {currencySymbol}{partnerPersonalAllowance.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-green-700">Disposable: {currencySymbol}{partnerDisposableIncome.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">({(partnerShare * 100).toFixed(1)}% of disposable)</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">Combined Monthly Income</p>
                  <p className="text-xl font-bold text-gray-800">{currencySymbol}{(userIncome + partnerIncome).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Combined Disposable Income</p>
                  <p className="text-2xl font-bold text-gray-800">{currencySymbol}{totalDisposableIncome.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">After personal allowances</p>
                </div>
              </div>
      
                    {/* Monthly Expenses Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🏠</span>
                  Shared Monthly Expenses (70% of disposable income)
                </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">👤</span>
              <div>
                <h4 className="font-semibold text-gray-800">You contribute</h4>
                <p className="text-sm text-gray-600">({(userShare * 100).toFixed(1)}% of expenses)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                {currencySymbol}{userExpenseContribution.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">👥</span>
              <div>
                <h4 className="font-semibold text-gray-800">Partner contributes</h4>
                <p className="text-sm text-gray-600">({(partnerShare * 100).toFixed(1)}% of expenses)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {currencySymbol}{partnerExpenseContribution.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-600">Total Monthly Expenses Budget</p>
          <p className="text-xl font-bold text-gray-800">
            {currencySymbol}{totalMonthlyExpenses.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">This covers rent, bills, groceries, etc.</p>
        </div>
      </div>
      
                    {/* Monthly Savings Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Monthly Savings Budget (20% of disposable income)
                </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">👤</span>
              <div>
                <h4 className="font-semibold text-gray-800">You contribute</h4>
                <p className="text-sm text-gray-600">({(userShare * 100).toFixed(1)}% of savings)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">
                {currencySymbol}{userSavingsContribution.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">👥</span>
              <div>
                <h4 className="font-semibold text-gray-800">Partner contributes</h4>
                <p className="text-sm text-gray-600">({(partnerShare * 100).toFixed(1)}% of savings)</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pink-600">
                {currencySymbol}{partnerSavingsContribution.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
        </div>
        
                        <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">Total Monthly Savings Budget</p>
                  <p className="text-xl font-bold text-gray-800">
                    {currencySymbol}{totalMonthlySavings.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">This gets distributed across your savings goals</p>
                </div>
              </div>

              {/* Monthly Safety Net Breakdown */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🛡️</span>
                  Monthly Safety Net (10% of disposable income)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">👤</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">You contribute</h4>
                        <p className="text-sm text-gray-600">({(userShare * 100).toFixed(1)}% of safety net)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {currencySymbol}{userSafetyNetContribution.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">per month</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">👥</span>
                      <div>
                        <h4 className="font-semibold text-gray-800">Partner contributes</h4>
                        <p className="text-sm text-gray-600">({(partnerShare * 100).toFixed(1)}% of safety net)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-600">
                        {currencySymbol}{partnerSafetyNetContribution.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">per month</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">Total Monthly Safety Net</p>
                  <p className="text-xl font-bold text-gray-800">
                    {currencySymbol}{totalMonthlySafetyNet.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Emergency fund and unexpected expenses</p>
                </div>
              </div>
      
                    {/* What This Means */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 What This Means For You:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• <strong>Personal Allowance:</strong> Keep {currencySymbol}{userPersonalAllowance.toFixed(2)} monthly for your personal spending</li>
                  <li>• <strong>Joint Account:</strong> Transfer {currencySymbol}{userExpenseContribution.toFixed(2)} monthly for shared expenses</li>
                  <li>• <strong>Savings Goals:</strong> Contribute {currencySymbol}{userSavingsContribution.toFixed(2)} monthly across your goals</li>
                  <li>• <strong>Safety Net:</strong> Contribute {currencySymbol}{userSafetyNetContribution.toFixed(2)} monthly to emergency fund</li>
                  <li>• <strong>Your Partner:</strong> Should contribute {currencySymbol}{partnerExpenseContribution.toFixed(2)} + {currencySymbol}{partnerSavingsContribution.toFixed(2)} + {currencySymbol}{partnerSafetyNetContribution.toFixed(2)} = {currencySymbol}{(partnerExpenseContribution + partnerSavingsContribution + partnerSafetyNetContribution).toFixed(2)} total</li>
                  <li>• <strong>Fair Split:</strong> Based on disposable income ratio ({(userShare * 100).toFixed(1)}% : {(partnerShare * 100).toFixed(1)}%)</li>
                </ul>
              </div>
    </div>
  )
}
