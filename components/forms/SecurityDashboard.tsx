import React, { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { PrivacySettings } from './PrivacySettings'

type SecurityTab = 'overview' | 'security' | 'privacy' | 'activity'

export function SecurityDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<SecurityTab>('overview')
  
  // Mock security status for basic dashboard
  const getSecurityStatus = () => ({
    mfaEnabled: false,
    biometricEnabled: false,
    lastLogin: new Date(),
    loginAttempts: 0,
    isLocked: false,
    securityScore: 50,
    lockExpiry: null as Date | null
  })
  
  const securityStatus = getSecurityStatus()

  const getSecurityRecommendations = () => {
    const recommendations = []
    
    if (!securityStatus.mfaEnabled) {
      recommendations.push({
        type: 'critical',
        title: 'Enable Multi-Factor Authentication',
        description: 'Add an extra layer of security to your account',
        action: 'Enable MFA'
      })
    }
    
    if (!securityStatus.biometricEnabled) {
      recommendations.push({
        type: 'important',
        title: 'Enable Biometric Authentication',
        description: 'Use fingerprint or face recognition for secure login',
        action: 'Enable Biometric'
      })
    }
    
    if (securityStatus.loginAttempts > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Review Login Attempts',
        description: 'Check for any suspicious login activity',
        action: 'Review Activity'
      })
    }
    
    if (securityStatus.securityScore < 60) {
      recommendations.push({
        type: 'important',
        title: 'Improve Security Score',
        description: 'Your account security could be enhanced',
        action: 'View Security'
      })
    }
    
    return recommendations
  }

  const getSecurityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSecurityScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Poor'
  }

  const recommendations = getSecurityRecommendations()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-3xl">🔒</span>
          <div>
            <h1 className="text-2xl font-bold">Security & Privacy Center</h1>
            <p className="text-blue-100">Manage your account security and privacy settings</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'security', label: 'Security', icon: '🔐' },
          { id: 'privacy', label: 'Privacy', icon: '🛡️' },
          { id: 'activity', label: 'Activity', icon: '📈' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SecurityTab)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Tabs */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Score Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              🎯 Security Score
            </h2>
            
            <div className="text-center mb-6">
              <div className={`text-6xl font-bold ${getSecurityScoreColor(securityStatus.securityScore)}`}>
                {securityStatus.securityScore}/100
              </div>
              <div className="text-lg text-gray-600 dark:text-gray-400">
                {getSecurityScoreLabel(securityStatus.securityScore)} Security
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  securityStatus.securityScore >= 80 ? 'bg-green-500' :
                  securityStatus.securityScore >= 60 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${securityStatus.securityScore}%` }}
              ></div>
            </div>
            
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {securityStatus.securityScore < 100 ? 
                `${100 - securityStatus.securityScore} points to reach Excellent security` :
                'Perfect! Your account is highly secure'
              }
            </div>
          </div>

          {/* Security Features Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              🔐 Security Features Status
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Multi-Factor Auth</span>
                <span className={`text-sm font-medium ${securityStatus.mfaEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {securityStatus.mfaEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Biometric Auth</span>
                <span className={`text-sm font-medium ${securityStatus.biometricEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {securityStatus.biometricEnabled ? '✓ Enabled' : '✗ Disabled'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Account Status</span>
                <span className={`text-sm font-medium ${securityStatus.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                  {securityStatus.isLocked ? '🔒 Locked' : '✓ Active'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Last Login</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {securityStatus.lastLogin.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Security Recommendations
            </h3>
            
            {recommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className="text-lg font-medium">Excellent! Your account is secure.</p>
                <p className="text-sm">Keep up the good security practices!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      rec.type === 'critical' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                      rec.type === 'important' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                      'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          rec.type === 'critical' ? 'text-red-800 dark:text-red-200' :
                          rec.type === 'important' ? 'text-yellow-800 dark:text-yellow-200' :
                          'text-blue-800 dark:text-blue-200'
                        }`}>
                          {rec.title}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          rec.type === 'critical' ? 'text-red-700 dark:text-red-300' :
                          rec.type === 'important' ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-blue-700 dark:text-blue-300'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => {
                          if (rec.action.includes('MFA')) setActiveTab('security')
                          else if (rec.action.includes('Biometric')) setActiveTab('security')
                          else if (rec.action.includes('Security')) setActiveTab('security')
                          else if (rec.action.includes('Activity')) setActiveTab('activity')
                        }}
                        className={`ml-4 px-3 py-1 text-xs font-medium rounded ${
                          rec.type === 'critical' ? 'bg-red-600 text-white hover:bg-red-700' :
                          rec.type === 'important' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                          'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {rec.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ⚡ Quick Actions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('security')}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <div className="font-medium text-blue-900 dark:text-blue-200">Security Settings</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Manage authentication & security</div>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('privacy')}
                className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-left hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <div className="font-medium text-green-900 dark:text-green-200">Privacy Settings</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Control data & privacy</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <SecuritySettings />
      )}

      {activeTab === 'privacy' && (
        <PrivacySettings />
      )}

      {activeTab === 'activity' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📈 Security Activity
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Failed Login Attempts</span>
                <span className={`text-sm font-medium ${securityStatus.loginAttempts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {securityStatus.loginAttempts} attempts
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-700 dark:text-gray-300">Last Login</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {securityStatus.lastLogin.toLocaleString()}
                </span>
              </div>
              
              {securityStatus.isLocked && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <span className="text-sm text-red-700 dark:text-red-300">Account Locked Until</span>
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    {securityStatus.lockExpiry?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 dark:text-blue-400">ℹ️</span>
                <span className="text-blue-800 dark:text-blue-200 font-medium">
                  Security Monitoring
                </span>
              </div>
              <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                We continuously monitor your account for suspicious activity and will notify you of any security concerns.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
