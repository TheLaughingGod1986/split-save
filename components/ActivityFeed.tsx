'use client'

import { useState, useEffect } from 'react'

interface ActivityFeedProps {
  partnerships: any[]
  profile: any
  user: any
  currencySymbol: string
}

export function ActivityFeed({
  partnerships,
  profile,
  user,
  currencySymbol
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const activePartnership = partnerships.find(p => p.status === 'active')

  useEffect(() => {
    if (activePartnership && profile) {
      // Simulate activity data for demonstration
      const mockActivities = [
        {
          id: 1,
          type: 'salary-tracking',
          user: 'You',
          month: 'January 2025',
          actualSalary: 4000,
          extraIncome: 500,
          extraIncomeSource: 'Bonus',
          status: 'completed',
          description: 'Monthly salary tracking completed'
        },
        {
          id: 2,
          type: 'salary-tracking',
          user: 'Partner',
          month: 'January 2025',
          actualSalary: 3000,
          extraIncome: 200,
          extraIncomeSource: 'Overtime',
          status: 'completed',
          description: 'Monthly salary tracking completed'
        },
        {
          id: 3,
          type: 'contribution',
          user: 'You',
          amount: 280,
          category: 'Expenses',
          date: '2025-01-28',
          status: 'on-target',
          description: 'Monthly expense contribution'
        },
        {
          id: 4,
          type: 'contribution',
          user: 'Partner',
          amount: 200,
          category: 'Expenses',
          date: '2025-01-28',
          status: 'under-target',
          description: 'Monthly expense contribution (under by £80)'
        },
        {
          id: 5,
          type: 'contribution',
          user: 'You',
          amount: 80,
          category: 'Savings',
          date: '2025-01-28',
          status: 'on-target',
          description: 'Monthly savings contribution'
        },
        {
          id: 6,
          type: 'contribution',
          user: 'Partner',
          amount: 60,
          category: 'Savings',
          date: '2025-01-28',
          status: 'on-target',
          description: 'Monthly savings contribution'
        },
        {
          id: 7,
          type: 'contribution',
          user: 'You',
          amount: 40,
          category: 'Safety Net',
          date: '2025-01-28',
          status: 'on-target',
          description: 'Monthly safety net contribution'
        },
        {
          id: 8,
          type: 'contribution',
          user: 'Partner',
          amount: 30,
          category: 'Safety Net',
          date: '2025-01-28',
          status: 'on-target',
          description: 'Monthly safety net contribution'
        }
      ]
      
      setActivities(mockActivities)
      setLoading(false)
    }
  }, [activePartnership, profile])

  if (!activePartnership || !profile) return null

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity feed...</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-target':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'under-target':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'over-target':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-target':
        return '✅'
      case 'under-target':
        return '⚠️'
      case 'over-target':
        return '🎯'
      default:
        return '📊'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Expenses':
        return '🏠'
      case 'Savings':
        return '🎯'
      case 'Safety Net':
        return '🛡️'
      default:
        return '💰'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">📊</span>
        Activity Feed
      </h2>

      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">This Month</h3>
          <p className="text-2xl font-bold text-blue-600">£400</p>
          <p className="text-xs text-blue-600">Total Contributions</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h3 className="text-sm font-semibold text-green-800 mb-2">On Target</h3>
          <p className="text-2xl font-bold text-green-600">4/6</p>
          <p className="text-xs text-green-600">Categories Met</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h3 className="text-sm font-semibold text-red-800 mb-2">Under Target</h3>
          <p className="text-2xl font-bold text-red-600">1/6</p>
          <p className="text-xs text-red-600">Categories Below</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Contributions</h3>
        
        {activities.map((activity) => (
          <div key={activity.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
            {activity.type === 'salary-tracking' ? (
              // Salary Tracking Activity
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">💰</div>
                  <div>
                    <p className="font-semibold text-gray-800">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.month}</p>
                    <div className="flex space-x-4 mt-1 text-xs text-gray-600">
                      <span>Salary: {currencySymbol}{activity.actualSalary}</span>
                      {activity.extraIncome > 0 && (
                        <span>+{currencySymbol}{activity.extraIncome} ({activity.extraIncomeSource})</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                    <span className="mr-1">✅</span>
                    Completed
                  </div>
                </div>
              </div>
            ) : (
              // Regular Contribution Activity
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(activity.category)}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.date}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">{currencySymbol}{activity.amount}</p>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                    <span className="mr-1">{getStatusIcon(activity.status)}</span>
                    {activity.status === 'on-target' ? 'On Target' : 
                     activity.status === 'under-target' ? 'Under Target' : 
                     activity.status === 'over-target' ? 'Over Target' : 'Unknown'}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Monthly Accountability Summary */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">📊 Monthly Accountability Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-700 mb-3">January 2025</h4>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">You</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">✅ Complete</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Salary: {currencySymbol}4,000 + {currencySymbol}500 bonus</p>
                  <p>All buckets: On target</p>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Partner</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">✅ Complete</span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Salary: {currencySymbol}3,000 + {currencySymbol}200 overtime</p>
                  <p>Expenses: Under target (needs attention)</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-blue-700 mb-3">Accountability Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200">
                <span className="text-sm text-gray-700">Both Partners Tracked</span>
                <span className="text-green-600">✅</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200">
                <span className="text-sm text-gray-700">Transparency Level</span>
                <span className="text-green-600">100%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-200">
                <span className="text-sm text-gray-700">Areas for Improvement</span>
                <span className="text-yellow-600">1</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>💡 Tip:</strong> Partner needs to increase expense contribution to meet monthly target.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Performance Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Partner Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">You</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Expenses:</span>
                <span className="font-semibold text-green-600">On Target</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Savings:</span>
                <span className="font-semibold text-green-600">On Target</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Safety Net:</span>
                <span className="font-semibold text-green-600">On Target</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Partner</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Expenses:</span>
                <span className="font-semibold text-red-600">Under Target</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Savings:</span>
                <span className="font-semibold text-green-600">On Target</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Safety Net:</span>
                <span className="font-semibold text-green-600">On Target</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
