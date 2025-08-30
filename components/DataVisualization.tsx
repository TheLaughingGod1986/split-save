import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}

interface VisualizationConfig {
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'
  timeRange: '1m' | '3m' | '6m' | '1y' | 'all'
  showTrends: boolean
  showAverages: boolean
  showProjections: boolean
}

export function DataVisualization({ 
  expenses, 
  goals, 
  profile, 
  partnerProfile, 
  currencySymbol, 
  partnerships 
}: any) {
  const [activeTab, setActiveTab] = useState<'charts' | 'trends' | 'comparisons' | 'projections'>('charts')
  const [config, setConfig] = useState<VisualizationConfig>({
    chartType: 'bar',
    timeRange: '3m',
    showTrends: true,
    showAverages: true,
    showProjections: true
  })
  const [chartData, setChartData] = useState<ChartData | null>(null)

  // Generate mock chart data
  useEffect(() => {
    const generateChartData = () => {
      const mockData: ChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Expenses',
            data: [2100, 1950, 2200, 2050, 2300, 2150],
            backgroundColor: ['rgba(59, 130, 246, 0.2)'],
            borderColor: ['rgba(59, 130, 246, 1)'],
            borderWidth: 2
          },
          {
            label: 'Savings',
            data: [500, 650, 400, 550, 300, 450],
            backgroundColor: ['rgba(34, 197, 94, 0.2)'],
            borderColor: ['rgba(34, 197, 94, 1)'],
            borderWidth: 2
          }
        ]
      }
      
      setChartData(mockData)
    }

    generateChartData()
  }, [expenses, goals, profile, partnerProfile])

  const getChartTypeIcon = (type: string) => {
    switch (type) {
      case 'bar': return '📊'
      case 'line': return '📈'
      case 'pie': return '🥧'
      case 'doughnut': return '🍩'
      case 'radar': return '🕸️'
      default: return '📊'
    }
  }

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '1m': return 'Last Month'
      case '3m': return 'Last 3 Months'
      case '6m': return 'Last 6 Months'
      case '1y': return 'Last Year'
      case 'all': return 'All Time'
      default: return 'Last 3 Months'
    }
  }

  const renderChart = () => {
    if (!chartData) return null

    switch (config.chartType) {
      case 'bar':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Bar Chart - {getTimeRangeLabel(config.timeRange)}
            </h3>
            
            <div className="space-y-4">
              {chartData.labels.map((label, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {currencySymbol}{chartData.datasets[0].data[index].toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                    <div 
                      className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(chartData.datasets[0].data[index] / Math.max(...chartData.datasets[0].data)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'line':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📈 Line Chart - {getTimeRangeLabel(config.timeRange)}
            </h3>
            
            <div className="space-y-4">
              {chartData.labels.map((label, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{label}</span>
                  
                  <div className="flex-1 flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(chartData.datasets[0].data[index] / Math.max(...chartData.datasets[0].data)) * 100}%` 
                        }}
                      ></div>
                    </div>
                    
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                      {currencySymbol}{chartData.datasets[0].data[index].toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'pie':
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🥧 Pie Chart - {getTimeRangeLabel(config.timeRange)}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart Visualization */}
              <div className="space-y-4">
                {chartData.labels.map((label, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] || '#3B82F6' }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currencySymbol}{chartData.datasets[0].data[index].toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              
              {/* Percentage Breakdown */}
              <div className="space-y-3">
                {chartData.labels.map((label, index) => {
                  const total = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0)
                  const percentage = ((chartData.datasets[0].data[index] / total) * 100).toFixed(1)
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{percentage}%</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: chartData.datasets[0].backgroundColor[index] || '#3B82F6'
                          }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Chart Preview
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Select a chart type to view visualization.</p>
          </div>
        )
    }
  }

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Spending Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Spending Trends Analysis
        </h3>
        
        <div className="space-y-4">
          {chartData?.labels.map((month, index) => {
            if (index === 0) return null
            
            const current = chartData.datasets[0].data[index]
            const previous = chartData.datasets[0].data[index - 1]
            const change = ((current - previous) / previous * 100)
            const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
            
            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                    {month}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currencySymbol}{current.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium ${
                    trend === 'up' ? 'text-red-600 dark:text-red-400' :
                    trend === 'down' ? 'text-green-600 dark:text-green-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '→'} {Math.abs(change).toFixed(1)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Moving Averages */}
      {config.showAverages && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Moving Averages
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currencySymbol}{Math.round((chartData?.datasets[0]?.data?.slice(-3)?.reduce((sum, val) => sum + val, 0) || 0) / 3).toLocaleString()}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">3-Month Average</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currencySymbol}{Math.round((chartData?.datasets[0]?.data?.slice(-6)?.reduce((sum, val) => sum + val, 0) || 0) / 6).toLocaleString()}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">6-Month Average</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {currencySymbol}{Math.round((chartData?.datasets[0]?.data?.reduce((sum, val) => sum + val, 0) || 0) / (chartData?.datasets[0]?.data?.length || 1)).toLocaleString()}
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Overall Average</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderComparisons = () => (
    <div className="space-y-6">
      {/* Category Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🏷️ Category Comparison
        </h3>
        
        <div className="space-y-4">
          {[
            { category: 'Housing', amount: 4500, color: 'bg-blue-500' },
            { category: 'Transportation', amount: 1800, color: 'bg-green-500' },
            { category: 'Food & Dining', amount: 1600, color: 'bg-yellow-500' },
            { category: 'Entertainment', amount: 1200, color: 'bg-purple-500' },
            { category: 'Utilities', amount: 900, color: 'bg-red-500' }
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.category}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currencySymbol}{item.amount.toLocaleString()}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${(item.amount / 4500) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🤝 Partner Comparison
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 text-center">You</h4>
            <div className="space-y-3">
              {[
                { label: 'Monthly Income', value: 3500, color: 'bg-blue-500' },
                { label: 'Monthly Expenses', value: 1800, color: 'bg-red-500' },
                { label: 'Savings Rate', value: 23.5, color: 'bg-green-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.label.includes('Rate') ? `${item.value}%` : currencySymbol}{item.value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                      style={{ 
                        width: item.label.includes('Rate') ? `${item.value}%` : `${(item.value / 4000) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 text-center">Partner</h4>
            <div className="space-y-3">
              {[
                { label: 'Monthly Income', value: 3200, color: 'bg-blue-500' },
                { label: 'Monthly Expenses', value: 1650, color: 'bg-red-500' },
                { label: 'Savings Rate', value: 21.8, color: 'bg-green-500' }
              ].map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.label.includes('Rate') ? `${item.value}%` : currencySymbol}{item.value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                      style={{ 
                        width: item.label.includes('Rate') ? `${item.value}%` : `${(item.value / 4000) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProjections = () => (
    <div className="space-y-6">
      {/* Savings Projections */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔮 Savings Projections
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">6 Months</div>
              <div className="text-lg text-blue-700 dark:text-blue-300">
                {currencySymbol}{Math.round(2100 * 0.235 * 6).toLocaleString()}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">Projected Savings</div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">1 Year</div>
              <div className="text-lg text-green-700 dark:text-green-300">
                {currencySymbol}{Math.round(2100 * 0.235 * 12).toLocaleString()}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 mt-1">Projected Savings</div>
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">2 Years</div>
              <div className="text-lg text-purple-700 dark:text-purple-300">
                {currencySymbol}{Math.round(2100 * 0.235 * 24).toLocaleString()}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">Projected Savings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Completion Estimates */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎯 Goal Completion Estimates
        </h3>
        
        <div className="space-y-4">
          {[
            { name: 'Holiday Fund', target: 3000, current: 2250, monthly: 250 },
            { name: 'Emergency Fund', target: 5000, current: 2250, monthly: 250 },
            { name: 'House Deposit', target: 25000, current: 3750, monthly: 250 }
          ].map((goal, index) => {
            const remaining = goal.target - goal.current
            const monthsToComplete = Math.ceil(remaining / goal.monthly)
            const completionDate = new Date()
            completionDate.setMonth(completionDate.getMonth() + monthsToComplete)
            
            return (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">{goal.name}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-500">
                    Est. {completionDate.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {Math.round((goal.current / goal.target) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(goal.current / goal.target) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    {monthsToComplete} months remaining at current rate
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold">Data Visualization</h1>
            <p className="text-purple-100">Interactive charts and visual analytics for your financial data</p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ⚙️ Visualization Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Chart Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chart Type
            </label>
            <select
              value={config.chartType}
              onChange={(e) => setConfig(prev => ({ ...prev, chartType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="radar">Radar Chart</option>
            </select>
          </div>
          
          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={config.timeRange}
              onChange={(e) => setConfig(prev => ({ ...prev, timeRange: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showTrends}
                onChange={(e) => setConfig(prev => ({ ...prev, showTrends: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Trends</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showAverages}
                onChange={(e) => setConfig(prev => ({ ...prev, showAverages: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Averages</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showProjections}
                onChange={(e) => setConfig(prev => ({ ...prev, showProjections: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Projections</span>
            </label>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'charts', label: 'Charts', icon: '📊' },
          { id: 'trends', label: 'Trends', icon: '📈' },
          { id: 'comparisons', label: 'Comparisons', icon: '⚖️' },
          { id: 'projections', label: 'Projections', icon: '🔮' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Tabs */}
      {activeTab === 'charts' && renderChart()}
      {activeTab === 'trends' && renderTrends()}
      {activeTab === 'comparisons' && renderComparisons()}
      {activeTab === 'projections' && renderProjections()}

      {/* Chart Type Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎨 Chart Type Gallery
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { type: 'bar', name: 'Bar Chart', description: 'Compare values across categories', icon: '📊' },
            { type: 'line', name: 'Line Chart', description: 'Show trends over time', icon: '📈' },
            { type: 'pie', name: 'Pie Chart', description: 'Show parts of a whole', icon: '🥧' },
            { type: 'doughnut', name: 'Doughnut Chart', description: 'Modern pie chart style', icon: '🍩' },
            { type: 'radar', name: 'Radar Chart', description: 'Compare multiple variables', icon: '🕸️' }
          ].map((chart) => (
            <div
              key={chart.type}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                config.chartType === chart.type
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setConfig(prev => ({ ...prev, chartType: chart.type as any }))}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{chart.icon}</span>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  {chart.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {chart.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
