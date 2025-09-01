'use client'

import React, { useState } from 'react'
import { toast } from '@/lib/toast'
import { useAuth } from './AuthProvider'
import { ProfileManager } from './ProfileManager'
import { SecurityDashboard } from './SecurityDashboard'
import { DataExportView } from './DataExportView'
import { SmartNotifications } from './SmartNotifications'

interface AccountHubProps {
  profile: any
  partnerProfile: any
  partnerships: any[]
  goals: any[]
  expenses: any[]
  user: any
  currencySymbol: string
  onUpdate: () => void
}

export function AccountHub({
  profile,
  partnerProfile,
  partnerships,
  goals,
  expenses,
  user,
  currencySymbol,
  onUpdate
}: AccountHubProps) {
  const { signOut } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data' | 'preferences'>('profile')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // In a real app, this would call delete account API
      toast.success('Account deletion request submitted')
      setShowDeleteConfirm(false)
      // Would redirect to deletion confirmation page
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Failed to delete account')
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'data', label: 'Data & Export', icon: '📊' },
    { id: 'preferences', label: 'Notifications', icon: '🔔' }
  ]

  const renderProfile = () => (
    <ProfileManager 
      onProfileUpdate={(updatedProfile) => {
        console.log('Profile updated:', updatedProfile)
        onUpdate()
      }}
    />
  )

  const renderSecurity = () => (
    <div className="space-y-6">
      <SecurityDashboard />
      
      {/* Account Actions */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Actions</h3>
        
        <div className="space-y-4">
          {/* Sign Out */}
          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Sign Out</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sign out of your account on this device</p>
            </div>
            <button
              onClick={handleSignOut}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
            <div>
              <h4 className="font-medium text-red-900 dark:text-red-100">Delete Account</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-100">
              Delete Account Confirmation
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete your account? This action cannot be undone and will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
              <li>• Delete all your financial data</li>
              <li>• Remove you from any partnerships</li>
              <li>• Cancel all pending approvals</li>
              <li>• Delete all goals and progress</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Delete Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderDataExport = () => (
    <DataExportView 
      partnerships={partnerships}
      profile={profile}
      partnerProfile={partnerProfile}
      goals={goals}
      expenses={expenses}
      user={user}
      currencySymbol={currencySymbol}
    />
  )

  const renderPreferences = () => (
    <SmartNotifications />
  )

  const renderOldPreferences = () => (
    <div className="space-y-6">
      {/* App Preferences */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">App Preferences</h3>
        
        <div className="space-y-4">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Push Notifications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications about partner activity and reminders</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Email Updates */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Email Updates</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly summaries and important updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Marketing Communications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Marketing Communications</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive tips, feature updates, and promotional content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Display Preferences</h3>
        
        <div className="space-y-4">
          {/* Theme */}
          <div>
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Theme</h4>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="system">Follow System</option>
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>

          {/* Currency Display */}
          <div>
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Currency Display</h4>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="symbol">Symbol ({currencySymbol})</option>
              <option value="code">Code (GBP)</option>
              <option value="full">Full (British Pound)</option>
            </select>
          </div>

          {/* Number Format */}
          <div>
            <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Number Format</h4>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="1,234.56">1,234.56 (US)</option>
              <option value="1.234,56">1.234,56 (EU)</option>
              <option value="1 234.56">1 234.56 (International)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Preferences */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Privacy Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Analytics & Crash Reports</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Help improve the app by sharing anonymous usage data</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Data Processing for AI Features</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow processing of your data to provide personalized insights</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">App Information</h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Version</span>
            <span className="font-medium text-gray-900 dark:text-white">1.1.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Build</span>
            <span className="font-medium text-gray-900 dark:text-white">2025.01.29</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Platform</span>
            <span className="font-medium text-gray-900 dark:text-white">Web App</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Privacy Policy
            </button>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Terms of Service
            </button>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Support Center
            </button>
            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-300">
          Manage your profile, security, and app preferences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-gray-500 dark:border-gray-400 text-gray-700 dark:text-gray-300'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-white dark:bg-gray-800">
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'data' && renderDataExport()}
          {activeTab === 'preferences' && renderPreferences()}
        </div>
      </div>
    </div>
  )
}
