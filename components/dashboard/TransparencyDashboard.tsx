'use client'

import React from 'react'

interface TransparencyDashboardProps {
  partnerships: any[]
  profile: any
  partnerProfile: any
  currencySymbol: string
  expenses: any[]
  goals: any[]
  monthlyProgress: any[]
}

export function TransparencyDashboard({
  partnerships,
  profile,
  partnerProfile,
  currencySymbol,
  expenses,
  goals,
  monthlyProgress
}: TransparencyDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Financial Transparency
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This section provides transparency into your shared financial activities and progress.
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Shared Goals</h4>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              {goals?.length || 0} active shared goals
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Monthly Progress</h4>
            <p className="text-green-700 dark:text-green-300 text-sm">
              Track your financial progress together
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
