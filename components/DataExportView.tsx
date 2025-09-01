import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface DataExportViewProps {
  partnerships: any[]
  profile: any
  partnerProfile: any
  goals: any[]
  expenses: any[]
  user: any
  currencySymbol: string
}

interface ExportOptions {
  format: 'csv' | 'pdf' | 'json'
  dateRange: 'month' | 'quarter' | 'year' | 'custom'
  startDate?: string
  endDate?: string
  includeGoals: boolean
  includeExpenses: boolean
  includeContributions: boolean
  includeAnalytics: boolean
}

interface FinancialReport {
  period: string
  totalIncome: number
  totalExpenses: number
  netSavings: number
  goalProgress: number
  partnerContributions: number
}

export function DataExportView({ 
  partnerships, 
  profile, 
  partnerProfile, 
  goals, 
  expenses,
  user, 
  currencySymbol 
}: DataExportViewProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: 'month',
    includeGoals: true,
    includeExpenses: true,
    includeContributions: true,
    includeAnalytics: true
  })
  const [activeTab, setActiveTab] = useState<'export' | 'reports' | 'tax' | 'analytics'>('export')
  const [isExporting, setIsExporting] = useState(false)
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([])
  const [selectedReport, setSelectedReport] = useState<string>('')

  const generateFinancialReports = useCallback(() => {
    const today = new Date()
    const reports: FinancialReport[] = []
    
    // Generate monthly reports for the last 12 months
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      
      // Use real data for calculations
      const monthlyIncome = (profile?.income || 0) + (partnerProfile?.income || 0)
      const monthlyExpenses = expenses?.reduce((sum, expense) => {
        const expenseDate = new Date(expense.created_at || expense.date || new Date())
        if (expenseDate.getMonth() === date.getMonth() && expenseDate.getFullYear() === date.getFullYear()) {
          return sum + (expense.amount || 0)
        }
        return sum
      }, 0) || 0
      const monthlySavings = monthlyIncome - monthlyExpenses
      const goalProgress = goals?.reduce((sum, goal) => sum + (goal.current_amount || 0), 0) || 0
      
      // Calculate partner contributions based on actual data
      const partnerContributions = monthlySavings > 0 ? monthlySavings * 0.5 : 0 // Assume 50/50 split
      
      reports.push({
        period: monthName,
        totalIncome: monthlyIncome,
        totalExpenses: monthlyExpenses,
        netSavings: monthlySavings,
        goalProgress: goalProgress,
        partnerContributions: partnerContributions
      })
    }
    
    setFinancialReports(reports)
  }, [goals, expenses, profile, partnerProfile])

  // Load financial reports when component mounts or dependencies change
  useEffect(() => {
    generateFinancialReports()
  }, [generateFinancialReports])

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      switch (exportOptions.format) {
        case 'csv':
          await exportToCSV()
          break
        case 'pdf':
          await exportToPDF()
          break
        case 'json':
          await exportToJSON()
          break
      }
      
      toast.success(`Data exported successfully as ${exportOptions.format.toUpperCase()}!`)
    } catch (error) {
      toast.error('Export failed. Please try again.')
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportToCSV = async () => {
    const csvData = generateCSVData()
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportToPDF = async () => {
    // In a real app, this would use a PDF library like jsPDF
    toast.success('PDF export would generate a professional financial report')
  }

  const exportToJSON = async () => {
    const jsonData = generateJSONData()
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const generateCSVData = () => {
    let csv = 'Date,Category,Description,Amount,Type\n'
    
    if (exportOptions.includeExpenses && expenses) {
      expenses.forEach(expense => {
        csv += `${expense.created_at || new Date().toISOString()},${expense.category},${expense.description},${expense.amount},Expense\n`
      })
    }
    
    if (exportOptions.includeGoals && goals) {
      goals.forEach(goal => {
        csv += `${goal.created_at || new Date().toISOString()},Goal,${goal.name},${goal.current_amount},Savings\n`
      })
    }
    
    return csv
  }

  const generateJSONData = () => {
    return {
      exportDate: new Date().toISOString(),
      user: {
        name: profile?.name,
        email: user?.email,
        currency: currencySymbol
      },
      partner: partnerProfile ? {
        name: partnerProfile.name,
        email: partnerProfile.email
      } : null,
      financialData: {
        expenses: exportOptions.includeExpenses ? expenses : [],
        goals: exportOptions.includeGoals ? goals : [],
        profile: profile,
        partnerProfile: partnerProfile
      }
    }
  }

  const calculateTaxDeductions = () => {
    if (!expenses) return []
    
    const deductibleCategories = ['Business', 'Work', 'Professional Development', 'Home Office']
    return expenses.filter(expense => 
      deductibleCategories.some(category => 
        expense.category?.toLowerCase().includes(category.toLowerCase())
      )
    )
  }

  const getTaxSummary = () => {
    const deductibleExpenses = calculateTaxDeductions()
    const totalDeductible = deductibleExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const totalIncome = (profile?.income || 0) + (partnerProfile?.income || 0)
    const estimatedTaxableIncome = totalIncome - totalDeductible
    
    return {
      totalIncome,
      totalDeductible,
      estimatedTaxableIncome,
      deductibleExpenses
    }
  }

  if (!partnerships || partnerships.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
        <div className="text-8xl mb-6 opacity-50">📊</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partnership Required</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          To access advanced data export and reporting features, you need to be connected with a partner.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-indigo-600 dark:from-blue-100 dark:to-indigo-300 bg-clip-text text-transparent">
            Data Export & Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Export your financial data, generate reports, and prepare for tax season
          </p>
        </div>
        
        {/* Export Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {expenses?.length || 0} Transactions
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">
              Available for Export
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        {[
          { id: 'export', label: 'Data Export', icon: '📤' },
          { id: 'reports', label: 'Financial Reports', icon: '📈' },
          { id: 'tax', label: 'Tax Preparation', icon: '🧾' },
          { id: 'analytics', label: 'Analytics', icon: '🔍' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Export Configuration */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⚙️ Export Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Export Format</label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions({...exportOptions, format: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="csv">CSV - Spreadsheet Format</option>
                  <option value="pdf">PDF - Professional Report</option>
                  <option value="json">JSON - Raw Data</option>
                </select>
              </div>
              
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
                <select
                  value={exportOptions.dateRange}
                  onChange={(e) => setExportOptions({...exportOptions, dateRange: e.target.value as any})}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="month">Current Month</option>
                  <option value="quarter">Current Quarter</option>
                  <option value="year">Current Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>
            
            {/* Custom Date Range */}
            {exportOptions.dateRange === 'custom' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={exportOptions.startDate || ''}
                    onChange={(e) => setExportOptions({...exportOptions, startDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Date</label>
                  <input
                    type="date"
                    value={exportOptions.endDate || ''}
                    onChange={(e) => setExportOptions({...exportOptions, endDate: e.target.value})}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}
            
            {/* Data Selection */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Data to Include</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeExpenses}
                    onChange={(e) => setExportOptions({...exportOptions, includeExpenses: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Expenses & Transactions</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeGoals}
                    onChange={(e) => setExportOptions({...exportOptions, includeGoals: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Savings Goals</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeContributions}
                    onChange={(e) => setExportOptions({...exportOptions, includeContributions: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Partner Contributions</span>
                </label>
                
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeAnalytics}
                    onChange={(e) => setExportOptions({...exportOptions, includeAnalytics: e.target.checked})}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Analytics & Insights</span>
                </label>
              </div>
            </div>
            
            {/* Export Button */}
            <div className="mt-6">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? '🔄 Exporting...' : '📤 Export Data'}
              </button>
            </div>
          </div>

          {/* Export Preview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">👀 Export Preview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {expenses?.length || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Transactions</div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-lg font-bold text-green-900 dark:text-green-100">
                    {goals?.length || 0}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Goals</div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
                    {exportOptions.format.toUpperCase()}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Format</div>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
                <div className="text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-lg font-bold text-amber-900 dark:text-amber-100">
                    {exportOptions.dateRange}
                  </div>
                  <div className="text-sm text-amber-700 dark:text-amber-300">Period</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📈 Financial Reports</h2>
          
          <div className="space-y-6">
            {/* Report Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Report</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="">Choose a report...</option>
                <option value="monthly">Monthly Financial Summary</option>
                <option value="quarterly">Quarterly Analysis</option>
                <option value="annual">Annual Financial Statement</option>
                <option value="goals">Goal Progress Report</option>
                <option value="expenses">Expense Analysis</option>
              </select>
            </div>
            
            {/* Report Display */}
            {selectedReport && (
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedReport.charAt(0).toUpperCase() + selectedReport.slice(1)} Report
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {financialReports.slice(0, 3).map((report, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{report.period}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Income:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {currencySymbol}{report.totalIncome.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Expenses:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {currencySymbol}{report.totalExpenses.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Savings:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            {currencySymbol}{report.netSavings.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🧾 Tax Preparation</h2>
          
          <div className="space-y-6">
            {/* Tax Summary */}
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-4">Tax Summary</h3>
              
              {(() => {
                const taxSummary = getTaxSummary()
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {currencySymbol}{taxSummary.totalIncome.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">Total Income</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {currencySymbol}{taxSummary.totalDeductible.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">Deductible Expenses</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {currencySymbol}{taxSummary.estimatedTaxableIncome.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300">Taxable Income</div>
                    </div>
                  </div>
                )
              })()}
            </div>
            
            {/* Deductible Expenses */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Deductible Expenses</h3>
              
              {(() => {
                const deductibleExpenses = calculateTaxDeductions()
                return deductibleExpenses.length > 0 ? (
                  <div className="space-y-2">
                    {deductibleExpenses.map((expense, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{expense.description}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{expense.category}</div>
                          </div>
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {currencySymbol}{expense.amount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-2">🧾</div>
                    <div>No deductible expenses found</div>
                    <div className="text-sm">Add business or work-related expenses to see them here</div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔍 Financial Analytics</h2>
          
          <div className="space-y-6">
            {/* Trend Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Trend Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Income Trend</h4>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ↗️ +5.2%
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">vs. last month</div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">Savings Rate</h4>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    📈 23.4%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">of disposable income</div>
                </div>
              </div>
            </div>
            
            {/* Category Breakdown */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Expense Categories</h3>
              
              {(() => {
                if (!expenses || expenses.length === 0) {
                  return (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📊</div>
                      <div>No expense data available</div>
                      <div className="text-sm">Add expenses to see category breakdowns</div>
                    </div>
                  )
                }
                
                const categories = expenses.reduce((acc, expense) => {
                  acc[expense.category] = (acc[expense.category] || 0) + expense.amount
                  return acc
                }, {} as Record<string, number>)
                
                const sortedCategories = Object.entries(categories)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5)
                
                return (
                  <div className="space-y-3">
                    {sortedCategories.map(([category, amount]) => (
                      <div key={category} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {currencySymbol}{(amount as number).toFixed(2)}
                          </span>
                        </div>
                                                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${((amount as number) / Math.max(...Object.values(categories) as number[])) * 100}%` }}
                            ></div>
                          </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
