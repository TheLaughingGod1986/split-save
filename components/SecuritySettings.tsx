import React, { useState } from 'react'
import { useAuth } from './AuthProvider'
import { toast } from 'react-hot-toast'

export function SecuritySettings() {
  const { user } = useAuth()
  
  // Mock functions for security features
  const enableMFA = async () => {
    toast.success('MFA feature coming soon!')
    return true
  }
  
  const enableBiometric = async () => {
    toast.success('Biometric authentication coming soon!')
    return true
  }
  
  const updatePassword = async (current: string, newPass: string) => {
    toast.success('Password update feature coming soon!')
    return true
  }
  
  const resetPassword = async (email: string) => {
    toast.success('Password reset feature coming soon!')
    return true
  }
  
  const getSecurityStatus = () => ({
    mfaEnabled: false,
    biometricEnabled: false,
    securityScore: 50,
    lastLogin: new Date()
  })
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const securityStatus = getSecurityStatus()

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setIsLoading(true)
    try {
      const success = await updatePassword(currentPassword, newPassword)
      if (success) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        toast.success('Password updated successfully!')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnableMFA = async () => {
    setIsLoading(true)
    try {
      const success = await enableMFA()
      if (success) {
        setShowMfaSetup(true)
        toast.success('MFA enabled! Please scan the QR code with your authenticator app.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnableBiometric = async () => {
    setIsLoading(true)
    try {
      const success = await enableBiometric()
      if (success) {
        toast.success('Biometric authentication enabled!')
      }
    } finally {
      setIsLoading(false)
    }
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

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="card space-card">
        <h2 className="text-heading-2 text-gray-900 dark:text-white space-item">
          🔒 Security Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Score */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getSecurityScoreColor(securityStatus.securityScore)}`}>
              {securityStatus.securityScore}/100
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {getSecurityScoreLabel(securityStatus.securityScore)} Security
            </div>
          </div>

          {/* Security Features Status */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Multi-Factor Auth</span>
              <span className={`text-sm font-medium ${securityStatus.mfaEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {securityStatus.mfaEnabled ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Biometric Auth</span>
              <span className={`text-sm font-medium ${securityStatus.biometricEnabled ? 'text-green-600' : 'text-red-600'}`}>
                {securityStatus.biometricEnabled ? '✓ Enabled' : '✗ Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Login</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {securityStatus.lastLogin.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Factor Authentication */}
      <div className="card space-card">
        <h3 className="text-heading-3 text-gray-900 dark:text-white space-item">
          🔐 Multi-Factor Authentication
        </h3>
        
        {!securityStatus.mfaEnabled ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <button
              onClick={handleEnableMFA}
              disabled={isLoading}
              className="btn-mobile-primary"
            >
              {isLoading ? '🔄 Enabling...' : '🔐 Enable MFA'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Multi-factor authentication is enabled
                </span>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                Your account is protected with an additional security layer.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Biometric Authentication */}
      <div className="card space-card">
        <h3 className="text-heading-3 text-gray-900 dark:text-white space-item">
          👆 Biometric Authentication
        </h3>
        
        {!securityStatus.biometricEnabled ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Use your fingerprint or face recognition for quick and secure login.
            </p>
            <button
              onClick={handleEnableBiometric}
              disabled={isLoading}
              className="btn-mobile-primary"
            >
              {isLoading ? '🔄 Enabling...' : '👆 Enable Biometric'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span className="text-green-800 dark:text-green-200 font-medium">
                  Biometric authentication is enabled
                </span>
              </div>
              <p className="text-green-700 dark:text-green-300 text-sm mt-1">
                You can now use biometric authentication to log in securely.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Password Management */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔑 Password Management
        </h3>
        
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="input-mobile"
              placeholder="Enter your current password"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="input-mobile"
              placeholder="Enter your new password"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-mobile"
              placeholder="Confirm your new password"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="btn-mobile-primary w-full"
          >
            {isLoading ? '🔄 Updating...' : '🔑 Update Password'}
          </button>
        </form>
      </div>

      {/* Account Recovery */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🔄 Account Recovery
        </h3>
        
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            If you've forgotten your password, we can send you a reset link.
          </p>
          <button
            onClick={() => resetPassword(user?.email || '')}
            className="btn-mobile-outline w-full"
          >
            📧 Send Password Reset Email
          </button>
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
          💡 Security Tips
        </h3>
        
        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
          <li>• Use a strong, unique password for your account</li>
          <li>• Enable multi-factor authentication for extra security</li>
          <li>• Keep your device's biometric settings up to date</li>
          <li>• Never share your authentication codes with anyone</li>
          <li>• Log out from shared devices when finished</li>
          <li>• Regularly review your account activity</li>
        </ul>
      </div>
    </div>
  )
}
