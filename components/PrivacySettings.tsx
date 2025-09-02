import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { toast } from 'react-hot-toast'

interface PrivacyPreferences {
  dataSharing: boolean
  analytics: boolean
  marketing: boolean
  partnerVisibility: 'full' | 'partial' | 'minimal'
  dataRetention: '30days' | '90days' | '1year' | 'indefinite'
}

export function PrivacySettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json')
  
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    dataSharing: true,
    analytics: true,
    marketing: false,
    partnerVisibility: 'full',
    dataRetention: '1year'
  })

  const handlePreferenceChange = (key: keyof PrivacyPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const savePreferences = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/privacy/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('splitsave_session_token')}`
        },
        body: JSON.stringify(preferences)
      })

      if (response.ok) {
        toast.success('Privacy preferences saved successfully!')
      } else {
        toast.error('Failed to save preferences')
      }
    } catch (error) {
      console.error('Save preferences error:', error)
      toast.error('Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/privacy/export?format=${exportFormat}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('splitsave_session_token')}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `splitsave-data-${new Date().toISOString().split('T')[0]}.${exportFormat}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}!`)
      } else {
        toast.error('Failed to export data')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.')) {
      return
    }

    if (!confirm('This will permanently delete your account and all associated data. Are you absolutely sure?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('splitsave_session_token')}`
        }
      })

      if (response.ok) {
        toast.success('Account deletion request submitted. You will receive a confirmation email.')
      } else {
        toast.error('Failed to submit deletion request')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Failed to submit deletion request')
    } finally {
      setIsLoading(false)
    }
  }

  const requestDataAccess = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/privacy/data-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('splitsave_session_token')}`
        }
      })

      if (response.ok) {
        toast.success('Data access request submitted. You will receive a response within 30 days.')
      } else {
        toast.error('Failed to submit data access request')
      }
    } catch (error) {
      console.error('Data access request error:', error)
      toast.error('Failed to submit data access request')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Privacy Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          🛡️ Privacy & Data Control
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          You have full control over your data and privacy settings. We&apos;re committed to protecting your information and ensuring transparency.
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
            <span className="text-blue-800 dark:text-blue-200 font-medium">
              GDPR Compliant
            </span>
          </div>
          <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
            Your data rights are protected under GDPR regulations.
          </p>
        </div>
      </div>

      {/* Data Sharing Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Data Sharing Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Share data for app improvement
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Help us improve SplitSave by sharing anonymous usage data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.dataSharing}
                onChange={(e) => handlePreferenceChange('dataSharing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Analytics and insights
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive personalized financial insights and recommendations
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Marketing communications
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Receive updates about new features and promotions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <button
          onClick={savePreferences}
          disabled={isLoading}
          className="btn-mobile-primary w-full mt-4"
        >
          {isLoading ? '🔄 Saving...' : '💾 Save Preferences'}
        </button>
      </div>

      {/* Partner Visibility */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          👥 Partner Visibility Settings
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Control how much of your financial information is visible to your partner.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibility Level
            </label>
            <select
              value={preferences.partnerVisibility}
              onChange={(e) => handlePreferenceChange('partnerVisibility', e.target.value)}
              className="select-mobile"
            >
              <option value="full">Full - All financial details visible</option>
              <option value="partial">Partial - Basic overview only</option>
              <option value="minimal">Minimal - Just contribution amounts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Retention */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📅 Data Retention Policy
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Choose how long we keep your data after account deletion.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retention Period
            </label>
            <select
              value={preferences.dataRetention}
              onChange={(e) => handlePreferenceChange('dataRetention', e.target.value)}
              className="select-mobile"
            >
              <option value="30days">30 days</option>
              <option value="90days">90 days</option>
              <option value="1year">1 year</option>
              <option value="indefinite">Indefinite (until manual deletion)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📤 Export Your Data
        </h3>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Download a copy of all your data in your preferred format.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="select-mobile"
            >
              <option value="json">JSON (Machine readable)</option>
              <option value="csv">CSV (Spreadsheet compatible)</option>
              <option value="pdf">PDF (Human readable)</option>
            </select>
          </div>
          
          <button
            onClick={exportData}
            disabled={isLoading}
            className="btn-mobile-outline w-full"
          >
            {isLoading ? '🔄 Exporting...' : '📤 Export Data'}
          </button>
        </div>
      </div>

      {/* Data Rights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⚖️ Your Data Rights
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={requestDataAccess}
              disabled={isLoading}
              className="btn-mobile-outline"
            >
              📋 Request Data Access
            </button>
            
            <button
              onClick={deleteAccount}
              disabled={isLoading}
              className="btn-mobile-outline border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              🗑️ Delete Account
            </button>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
              <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                Important Notice
              </span>
            </div>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
              Account deletion is permanent and cannot be undone. All your data will be permanently removed.
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📜 Privacy Policy & Terms
        </h3>
        
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>
            By using SplitSave, you agree to our privacy policy and terms of service.
          </p>
          
          <div className="flex space-x-4">
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
              Privacy Policy
            </button>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
              Terms of Service
            </button>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
              Cookie Policy
            </button>
          </div>
          
          <p className="text-xs">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
