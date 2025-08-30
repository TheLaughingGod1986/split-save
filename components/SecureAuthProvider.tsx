import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  email: string
  name?: string
  role: 'user' | 'admin'
  mfaEnabled: boolean
  biometricEnabled: boolean
  lastLogin: Date
  loginAttempts: number
  lockedUntil?: Date
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, name: string) => Promise<boolean>
  enableMFA: () => Promise<boolean>
  enableBiometric: () => Promise<boolean>
  verifyMFA: (code: string) => Promise<boolean>
  resetPassword: (email: string) => Promise<boolean>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  lockAccount: () => void
  unlockAccount: () => void
  getSecurityStatus: () => SecurityStatus
}

interface SecurityStatus {
  mfaEnabled: boolean
  biometricEnabled: boolean
  lastLogin: Date
  loginAttempts: number
  isLocked: boolean
  lockExpiry?: Date
  securityScore: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SecureAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [mfaRequired, setMfaRequired] = useState(false)

  // Check if biometric authentication is available
  const isBiometricAvailable = useCallback(async () => {
    if (typeof window !== 'undefined' && 'credentials' in navigator) {
      try {
        const available = await (navigator.credentials as any).isUserVerifyingPlatformAuthenticatorAvailable()
        return available
      } catch {
        return false
      }
    }
    return false
  }, [])

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for existing session
        const token = localStorage.getItem('splitsave_session_token')
        if (token) {
          // Validate token with server
          const isValid = await validateSession(token)
          if (isValid) {
            setSessionToken(token)
            await loadUserProfile(token)
          } else {
            localStorage.removeItem('splitsave_session_token')
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Validate session token with server
  const validateSession = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      return response.ok
    } catch {
      return false
    }
  }

  // Load user profile from server
  const loadUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Failed to load user profile:', error)
    }
  }

  // Enhanced login with security features
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check if account is locked
      if (user?.lockedUntil && new Date() < user.lockedUntil) {
        const remainingTime = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60)
        toast.error(`Account is locked. Try again in ${remainingTime} minutes.`)
        return false
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.requiresMFA) {
          setMfaRequired(true)
          return false
        }

        // Store session token securely
        const token = data.token
        setSessionToken(token)
        localStorage.setItem('splitsave_session_token', token)
        
        // Load user profile
        await loadUserProfile(token)
        
        // Reset login attempts on successful login
        if (user) {
          setUser(prev => prev ? { ...prev, loginAttempts: 0, lastLogin: new Date() } : null)
        }

        toast.success('Login successful!')
        return true
      } else {
        const errorData = await response.json()
        
        // Handle failed login attempts
        if (errorData.code === 'INVALID_CREDENTIALS') {
          const attempts = (user?.loginAttempts || 0) + 1
          setUser(prev => prev ? { ...prev, loginAttempts: attempts } : null)
          
          if (attempts >= 5) {
            // Lock account for 15 minutes
            const lockExpiry = new Date(Date.now() + 15 * 60 * 1000)
            setUser(prev => prev ? { ...prev, lockedUntil: lockExpiry } : null)
            toast.error('Account locked due to too many failed attempts. Try again in 15 minutes.')
          } else {
            toast.error(`Invalid credentials. ${5 - attempts} attempts remaining.`)
          }
        } else {
          toast.error(errorData.message || 'Login failed')
        }
        
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed. Please try again.')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Multi-factor authentication verification
  const verifyMFA = async (code: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/verify-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, sessionToken })
      })

      if (response.ok) {
        const data = await response.json()
        setMfaRequired(false)
        
        // Complete login process
        const token = data.token
        setSessionToken(token)
        localStorage.setItem('splitsave_session_token', token)
        
        await loadUserProfile(token)
        toast.success('MFA verification successful!')
        return true
      } else {
        toast.error('Invalid MFA code')
        return false
      }
    } catch (error) {
      console.error('MFA verification error:', error)
      toast.error('MFA verification failed')
      return false
    }
  }

  // Enable multi-factor authentication
  const enableMFA = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/enable-mfa', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setUser(prev => prev ? { ...prev, mfaEnabled: true } : null)
        toast.success('MFA enabled successfully!')
        return true
      } else {
        toast.error('Failed to enable MFA')
        return false
      }
    } catch (error) {
      console.error('Enable MFA error:', error)
      toast.error('Failed to enable MFA')
      return false
    }
  }

  // Enable biometric authentication
  const enableBiometric = async (): Promise<boolean> => {
    try {
      if (!(await isBiometricAvailable())) {
        toast.error('Biometric authentication not available on this device')
        return false
      }

      const response = await fetch('/api/auth/enable-biometric', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        setUser(prev => prev ? { ...prev, biometricEnabled: true } : null)
        toast.success('Biometric authentication enabled!')
        return true
      } else {
        toast.error('Failed to enable biometric authentication')
        return false
      }
    } catch (error) {
      console.error('Enable biometric error:', error)
      toast.error('Failed to enable biometric authentication')
      return false
    }
  }

  // Secure logout
  const logout = useCallback(() => {
    // Clear session data
    setUser(null)
    setSessionToken(null)
    setMfaRequired(false)
    localStorage.removeItem('splitsave_session_token')
    
    // Clear any sensitive data
    sessionStorage.clear()
    
    // Notify server of logout
    if (sessionToken) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`
        }
      }).catch(console.error)
    }
    
    toast.success('Logged out successfully')
  }, [sessionToken])

  // Password reset
  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        toast.success('Password reset email sent')
        return true
      } else {
        toast.error('Failed to send reset email')
        return false
      }
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('Password reset failed')
      return false
    }
  }

  // Update password
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      if (response.ok) {
        toast.success('Password updated successfully')
        return true
      } else {
        toast.error('Failed to update password')
        return false
      }
    } catch (error) {
      console.error('Update password error:', error)
      toast.error('Failed to update password')
      return false
    }
  }

  // Account security management
  const lockAccount = () => {
    const lockExpiry = new Date(Date.now() + 15 * 60 * 1000)
    setUser(prev => prev ? { ...prev, lockedUntil: lockExpiry } : null)
    toast('Account locked for security', { icon: '⚠️' })
  }

  const unlockAccount = () => {
    setUser(prev => prev ? { ...prev, lockedUntil: undefined, loginAttempts: 0 } : null)
    toast.success('Account unlocked')
  }

  // Get security status
  const getSecurityStatus = (): SecurityStatus => {
    if (!user) {
      return {
        mfaEnabled: false,
        biometricEnabled: false,
        lastLogin: new Date(),
        loginAttempts: 0,
        isLocked: false,
        securityScore: 0
      }
    }

    let securityScore = 0
    if (user.mfaEnabled) securityScore += 30
    if (user.biometricEnabled) securityScore += 20
    if (user.loginAttempts === 0) securityScore += 25
    if (user.lastLogin) {
      const daysSinceLastLogin = (Date.now() - user.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastLogin < 7) securityScore += 25
    }

    return {
      mfaEnabled: user.mfaEnabled,
      biometricEnabled: user.biometricEnabled,
      lastLogin: user.lastLogin,
      loginAttempts: user.loginAttempts,
      isLocked: !!user.lockedUntil,
      lockExpiry: user.lockedUntil,
      securityScore
    }
  }

  // Register new user
  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, name })
      })

      if (response.ok) {
        toast.success('Registration successful! Please log in.')
        return true
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Registration failed')
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !mfaRequired,
    isLoading,
    login,
    logout,
    register,
    enableMFA,
    enableBiometric,
    verifyMFA,
    resetPassword,
    updatePassword,
    lockAccount,
    unlockAccount,
    getSecurityStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSecureAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider')
  }
  return context
}
