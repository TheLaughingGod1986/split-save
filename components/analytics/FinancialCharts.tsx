'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { motion } from 'framer-motion'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

interface FinancialChartsProps {
  expenses: any[]
  goals: any[]
  partnerships: any[]
  profile: any
  partnerProfile: any
  currencySymbol: string
  monthlyProgress?: any[]
}

interface ChartData {
  monthlyExpenses: Array<{ month: string; amount: number; category: string }>
  goalProgress: Array<{ name: string; current: number; target: number; progress: number }>
  spendingByCategory: Array<{ category: string; amount: number; percentage: number }>
  partnerComparison: Array<{ metric: string; user: number; partner: number }>
  savingsTrend: Array<{ month: string; saved: number; target: number }>
}

export function FinancialCharts({
  expenses,
  goals,
  partnerships,
  profile,
  partnerProfile,
  currencySymbol,
  monthlyProgress
}: FinancialChartsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'goals' | 'comparison' | 'trends'>('overview')
  const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m')
  const [chartData, setChartData] = useState<ChartData | null>(null)

  // Process and generate chart data
  const processChartData = useMemo(() => {
    if (!expenses || !goals) return null

    const now = new Date()
    const monthsBack = timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : timeRange === '1y' ? 12 : 24

    // Monthly expenses data
    const monthlyExpenses: Array<{ month: string; amount: number; category: string }> = []
    const categoryTotals: Record<string, number> = {}

    // Process expenses by month and category
    expenses.forEach(expense => {
      const expenseDate = new Date(expense.created_at || expense.date)
      const monthKey = expenseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      // Only include expenses within the selected time range
      if (expenseDate >= new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)) {
        monthlyExpenses.push({
          month: monthKey,
          amount: expense.amount || 0,
          category: expense.category || 'Other'
        })

        // Track category totals
        categoryTotals[expense.category || 'Other'] = (categoryTotals[expense.category || 'Other'] || 0) + (expense.amount || 0)
      }
    })

    // Goal progress data
    const goalProgress = goals.map(goal => ({
      name: goal.name || 'Unnamed Goal',
      current: goal.current_amount || 0,
      target: goal.target_amount || 1,
      progress: goal.current_amount && goal.target_amount ? (goal.current_amount / goal.target_amount) * 100 : 0
    }))

    // Spending by category
    const totalSpending = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0)
    const spendingByCategory = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0
    })).sort((a, b) => b.amount - a.amount)

    // Partner comparison (mock data for now - would need real partner data)
    const partnerComparison = [
      { metric: 'Monthly Income', user: profile?.income || 3000, partner: partnerProfile?.income || 5000 },
      { metric: 'Monthly Expenses', user: 1500, partner: 2000 },
      { metric: 'Savings Rate', user: 25, partner: 30 },
      { metric: 'Goal Progress', user: 60, partner: 75 }
    ]

    // Savings trend (mock data - would need real savings data)
    const savingsTrend = Array.from({ length: monthsBack }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      return {
        month,
        saved: Math.random() * 2000 + 1000, // Mock data
        target: 1500
      }
    }).reverse()

    return {
      monthlyExpenses,
      goalProgress,
      spendingByCategory,
      partnerComparison,
      savingsTrend
    }
  }, [expenses, goals, profile, partnerProfile, timeRange])

  useEffect(() => {
    setChartData(processChartData)
  }, [processChartData])

  // Chart configurations
  const monthlyExpensesConfig = {
    type: 'line' as const,
    data: {
      labels: chartData?.monthlyExpenses.reduce((acc, item) => {
        if (!acc.includes(item.month)) acc.push(item.month)
        return acc
      }, [] as string[]) || [],
      datasets: [
        {
          label: 'Monthly Expenses',
          data: chartData?.monthlyExpenses.reduce((acc, item) => {
            const monthIndex = acc.findIndex(m => m.month === item.month)
            if (monthIndex >= 0) {
              acc[monthIndex].amount += item.amount
            } else {
              acc.push({ month: item.month, amount: item.amount })
            }
            return acc
          }, [] as Array<{ month: string; amount: number }>).map(item => item.amount) || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Monthly Expenses Trend'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return `${currencySymbol}${value}`
            }
          }
        }
      }
    }
  }

  const spendingByCategoryConfig = {
    type: 'doughnut' as const,
    data: {
      labels: chartData?.spendingByCategory.map(item => item.category) || [],
      datasets: [
        {
          data: chartData?.spendingByCategory.map(item => item.amount) || [],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',   // Red
            'rgba(34, 197, 94, 0.8)',   // Green
            'rgba(59, 130, 246, 0.8)',  // Blue
            'rgba(168, 85, 247, 0.8)',  // Purple
            'rgba(245, 158, 11, 0.8)',  // Yellow
            'rgba(236, 72, 153, 0.8)',  // Pink
            'rgba(14, 165, 233, 0.8)',  // Sky
            'rgba(34, 197, 94, 0.8)',   // Emerald
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(14, 165, 233, 1)',
            'rgba(34, 197, 94, 1)',
          ],
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right' as const,
        },
        title: {
          display: true,
          text: 'Spending by Category'
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || ''
              const value = context.parsed
              const percentage = chartData?.spendingByCategory.find(item => item.category === label)?.percentage || 0
              return `${label}: ${currencySymbol}${value.toFixed(2)} (${percentage.toFixed(1)}%)`
            }
          }
        }
      }
    }
  }

  const goalProgressConfig = {
    type: 'bar' as const,
    data: {
      labels: chartData?.goalProgress.map(item => item.name) || [],
      datasets: [
        {
          label: 'Current Amount',
          data: chartData?.goalProgress.map(item => item.current) || [],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        },
        {
          label: 'Target Amount',
          data: chartData?.goalProgress.map(item => item.target) || [],
          backgroundColor: 'rgba(156, 163, 175, 0.8)',
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Goal Progress'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return `${currencySymbol}${value}`
            }
          }
        }
      }
    }
  }

  const partnerComparisonConfig = {
    type: 'bar' as const,
    data: {
      labels: chartData?.partnerComparison.map(item => item.metric) || [],
      datasets: [
        {
          label: 'You',
          data: chartData?.partnerComparison.map(item => item.user) || [],
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        },
        {
          label: 'Partner',
          data: chartData?.partnerComparison.map(item => item.partner) || [],
          backgroundColor: 'rgba(168, 85, 247, 0.8)',
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Partner Comparison'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return `${currencySymbol}${value}`
            }
          }
        }
      }
    }
  }

  const savingsTrendConfig = {
    type: 'line' as const,
    data: {
      labels: chartData?.savingsTrend.map(item => item.month) || [],
      datasets: [
        {
          label: 'Actual Savings',
          data: chartData?.savingsTrend.map(item => item.saved) || [],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Target Savings',
          data: chartData?.savingsTrend.map(item => item.target) || [],
          borderColor: 'rgb(156, 163, 175)',
          backgroundColor: 'rgba(156, 163, 175, 0.1)',
          tension: 0.4,
          borderDash: [5, 5]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Savings Trend vs Target'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value: any) {
              return `${currencySymbol}${value}`
            }
          }
        }
      }
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'comparison', label: 'Comparison', icon: '👥' },
    { id: 'trends', label: 'Trends', icon: '📈' }
  ]

  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Charts...</h3>
            <p className="text-gray-500 dark:text-gray-400">Processing your financial data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Analytics</h2>
            <p className="text-gray-600 dark:text-gray-400">Visual insights into your financial data</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Expenses</h3>
              <Line {...monthlyExpensesConfig} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
              <Doughnut {...spendingByCategoryConfig} />
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Trends</h3>
              <Line {...monthlyExpensesConfig} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
              <Doughnut {...spendingByCategoryConfig} />
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Goal Progress</h3>
              <Bar {...goalProgressConfig} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Savings Trend</h3>
              <Line {...savingsTrendConfig} />
            </div>
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Partner Comparison</h3>
            <Bar {...partnerComparisonConfig} />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Savings Trend</h3>
              <Line {...savingsTrendConfig} />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Trends</h3>
              <Line {...monthlyExpensesConfig} />
            </div>
          </div>
        )}
      </motion.div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💡 Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {currencySymbol}{chartData.spendingByCategory.reduce((sum, item) => sum + item.amount, 0).toFixed(0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Expenses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {chartData.goalProgress.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Goals</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {chartData.goalProgress.length > 0 ? (chartData.goalProgress.reduce((sum, goal) => sum + goal.progress, 0) / chartData.goalProgress.length).toFixed(0) : 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Goal Progress</div>
          </div>
        </div>
      </div>
    </div>
  )
}
