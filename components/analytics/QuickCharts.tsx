'use client'

import React, { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface QuickChartsProps {
  expenses: any[]
  goals: any[]
  currencySymbol: string
}

export function QuickCharts({ expenses, goals, currencySymbol }: QuickChartsProps) {
  // Process data for quick charts
  const chartData = useMemo(() => {
    if (!expenses || !goals) return null

    // Monthly expenses trend (last 6 months)
    const monthlyData: Record<string, number> = {}
    const categoryData: Record<string, number> = {}

    expenses.forEach(expense => {
      const date = new Date(expense.created_at || expense.date)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      // Only include last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      if (date >= sixMonthsAgo) {
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (expense.amount || 0)
        categoryData[expense.category || 'Other'] = (categoryData[expense.category || 'Other'] || 0) + (expense.amount || 0)
      }
    })

    return {
      monthlyData,
      categoryData
    }
  }, [expenses, goals])

  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-gray-500 dark:text-gray-400">No data available for charts</p>
        </div>
      </div>
    )
  }

  const totalSpending = Object.values(chartData.categoryData).reduce((sum, val) => sum + val, 0)



  return (
    <div className="space-y-6">






      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {currencySymbol}{totalSpending.toFixed(0)}
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300">Total Expenses</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {goals?.length || 0}
          </div>
          <div className="text-sm text-green-700 dark:text-green-300">Active Goals</div>
        </div>
      </div>
    </div>
  )
}
