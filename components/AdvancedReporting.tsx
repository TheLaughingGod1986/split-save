import React, { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface ReportConfig {
  type: 'expense' | 'savings' | 'goals' | 'comprehensive' | 'partner'
  timeRange: '1m' | '3m' | '6m' | '1y' | 'all'
  includeCharts: boolean
  includeRecommendations: boolean
  format: 'pdf' | 'csv' | 'excel' | 'json'
}

interface ReportData {
  summary: {
    totalExpenses: number
    totalSavings: number
    savingsRate: number
    goalsProgress: number
    partnerContributions: number
  }
  details: any[]
  charts: any[]
  recommendations: string[]
}

export function AdvancedReporting({ 
  expenses, 
  goals, 
  profile, 
  partnerProfile, 
  currencySymbol, 
  partnerships 
}: any) {
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'comprehensive',
    timeRange: '3m',
    includeCharts: true,
    includeRecommendations: true,
    format: 'pdf'
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReports, setGeneratedReports] = useState<Array<{
    id: string
    name: string
    type: string
    date: Date
    size: string
    format: string
  }>>([])

  // Generate mock report data
  useEffect(() => {
    const mockReportData: ReportData = {
      summary: {
        totalExpenses: 12500,
        totalSavings: 3200,
        savingsRate: 23.5,
        goalsProgress: 45,
        partnerContributions: 1800
      },
      details: [
        { category: 'Housing', amount: 4500, percentage: 36 },
        { category: 'Transportation', amount: 1800, percentage: 14.4 },
        { category: 'Food & Dining', amount: 1600, percentage: 12.8 },
        { category: 'Entertainment', amount: 1200, percentage: 9.6 },
        { category: 'Utilities', amount: 900, percentage: 7.2 }
      ],
      charts: [],
      recommendations: [
        'Consider reducing entertainment expenses by 15%',
        'Increase emergency fund contributions',
        'Automate monthly savings transfers',
        'Review insurance coverage annually'
      ]
    }
    
    setReportData(mockReportData)
  }, [expenses, goals, profile, partnerProfile])

  const generateReport = async () => {
    setIsGenerating(true)
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newReport = {
        id: Date.now().toString(),
        name: `${reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} Report - ${new Date().toLocaleDateString()}`,
        type: reportConfig.type,
        date: new Date(),
        size: `${Math.floor(Math.random() * 500) + 100} KB`,
        format: reportConfig.format.toUpperCase()
      }
      
      setGeneratedReports(prev => [newReport, ...prev])
      toast.success(`Report generated successfully!`)
    } catch (error) {
      toast.error('Failed to generate report')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = (reportId: string) => {
    const report = generatedReports.find(r => r.id === reportId)
    if (!report) return
    
    // Simulate download
    toast.success(`Downloading ${report.name}...`)
    
    // In real app, this would trigger actual file download
    const link = document.createElement('a')
    link.href = '#'
    link.download = `${report.name}.${report.format.toLowerCase()}`
    link.click()
  }

  const deleteReport = (reportId: string) => {
    setGeneratedReports(prev => prev.filter(r => r.id !== reportId))
    toast.success('Report deleted')
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'expense': return '💰'
      case 'savings': return '💾'
      case 'goals': return '🎯'
      case 'comprehensive': return '📊'
      case 'partner': return '🤝'
      default: return '📄'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄'
      case 'csv': return '📊'
      case 'excel': return '📈'
      case 'json': return '🔧'
      default: return '📄'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">📊</span>
          <div>
            <h1 className="text-2xl font-bold">Advanced Reporting</h1>
            <p className="text-green-100">Generate comprehensive financial reports and insights</p>
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          ⚙️ Report Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportConfig.type}
              onChange={(e) => setReportConfig(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="expense">Expense Report</option>
              <option value="savings">Savings Report</option>
              <option value="goals">Goals Report</option>
              <option value="comprehensive">Comprehensive Report</option>
              <option value="partner">Partner Report</option>
            </select>
          </div>
          
          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Range
            </label>
            <select
              value={reportConfig.timeRange}
              onChange={(e) => setReportConfig(prev => ({ ...prev, timeRange: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          
          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={reportConfig.format}
              onChange={(e) => setReportConfig(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="json">JSON</option>
            </select>
          </div>
          
          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reportConfig.includeCharts}
                onChange={(e) => setReportConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include Charts</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reportConfig.includeRecommendations}
                onChange={(e) => setReportConfig(prev => ({ ...prev, includeRecommendations: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Include Recommendations</span>
            </label>
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '🔄 Generating Report...' : '📊 Generate Report'}
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {reportData && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            👁️ Report Preview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {currencySymbol}{reportData.summary.totalExpenses.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total Expenses</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {currencySymbol}{reportData.summary.totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Total Savings</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {reportData.summary.savingsRate}%
              </div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Savings Rate</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {reportData.summary.goalsProgress}%
              </div>
              <div className="text-sm text-orange-700 dark:text-orange-300">Goals Progress</div>
            </div>
            
            <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {currencySymbol}{reportData.summary.partnerContributions.toLocaleString()}
              </div>
              <div className="text-sm text-teal-700 dark:text-teal-300">Partner Contributions</div>
            </div>
          </div>
          
          {/* Sample Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Top Categories</h4>
              <div className="space-y-2">
                {reportData.details.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.category}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {currencySymbol}{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Recommendations</h4>
              <div className="space-y-2">
                {reportData.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-blue-500 text-sm">💡</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📁 Generated Reports
        </h3>
        
        {generatedReports.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <span className="text-4xl mb-4 block">📊</span>
            <p>No reports generated yet.</p>
            <p className="text-sm">Generate your first report using the configuration above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getReportTypeIcon(report.type)}</span>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      {report.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-500">
                      {report.date.toLocaleDateString()} • {report.size} • {report.format}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadReport(report.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    📥 Download
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Report Templates
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { type: 'expense', name: 'Expense Analysis', description: 'Detailed breakdown of spending patterns and categories', icon: '💰' },
            { type: 'savings', name: 'Savings Report', description: 'Track your savings progress and rate over time', icon: '💾' },
            { type: 'goals', name: 'Goals Progress', description: 'Monitor progress towards financial goals and targets', icon: '🎯' },
            { type: 'comprehensive', name: 'Financial Overview', description: 'Complete financial health and performance summary', icon: '📊' },
            { type: 'partner', name: 'Partner Report', description: 'Compare financial metrics and contributions with partner', icon: '🤝' }
          ].map((template) => (
            <div
              key={template.type}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                reportConfig.type === template.type
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setReportConfig(prev => ({ ...prev, type: template.type as any }))}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{template.icon}</span>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  {template.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📤 Export Options
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { format: 'pdf', name: 'PDF Report', description: 'Professional formatted report for printing and sharing', icon: '📄' },
            { format: 'csv', name: 'CSV Data', description: 'Raw data export for spreadsheet analysis', icon: '📊' },
            { format: 'excel', name: 'Excel Report', description: 'Interactive spreadsheet with charts and formulas', icon: '📈' },
            { format: 'json', name: 'JSON Data', description: 'Structured data for developers and integrations', icon: '🔧' }
          ].map((option) => (
            <div
              key={option.format}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                reportConfig.format === option.format
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              onClick={() => setReportConfig(prev => ({ ...prev, format: option.format as any }))}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{option.icon}</span>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">
                  {option.name}
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {option.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
