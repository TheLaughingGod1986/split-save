'use client'

import { useState } from 'react'
import { AnalyticsView } from './AnalyticsView'
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard'
import { DataExportView } from './DataExportView'

interface AnalyticsHubProps {
  partnerships: any[]
  profile: any
  partnerProfile: any
  goals: any[]
  expenses: any[]
  user: any
  currencySymbol: string
  monthlyProgress: any
}

export function AnalyticsHub({
  partnerships,
  profile,
  partnerProfile,
  goals,
  expenses,
  user,
  currencySymbol,
  monthlyProgress
}: AnalyticsHubProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊', description: 'Financial insights & trends' },
    { id: 'advanced', label: 'Advanced', icon: '📈', description: 'Detailed analytics & reports' },
    { id: 'export', label: 'Export', icon: '📤', description: 'Data export & reports' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Reports</h1>
        <p className="text-gray-600 dark:text-gray-300">Comprehensive financial insights and data export tools</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-medium rounded-t-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </div>
              <div className="text-xs opacity-75 mt-1">
                {tab.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <AnalyticsView
            partnerships={partnerships}
            profile={profile}
            user={user}
            currencySymbol={currencySymbol}
            monthlyProgress={monthlyProgress}
          />
        )}

                  {activeTab === 'advanced' && (
            <AdvancedAnalyticsDashboard
              userId={user?.id || ''}
              goals={goals}
              contributions={[]}
              expenses={expenses}
              partnerships={partnerships}
              achievements={[]}
            />
          )}

        {activeTab === 'export' && (
          <DataExportView
            partnerships={partnerships}
            profile={profile}
            partnerProfile={partnerProfile}
            goals={goals}
            expenses={expenses}
            user={user}
            currencySymbol={currencySymbol}
          />
        )}
      </div>
    </div>
  )
}
