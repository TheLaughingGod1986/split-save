'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'
import { validationRules, sanitizeInput } from '@/lib/validation'

interface LoginFormProps {
  onBack?: () => void
}

export function LoginForm({ onBack }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false) // Force signin mode initially
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState('')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [showResendConfirmation, setShowResendConfirmation] = useState(false)
  const [confirmationEmailSent, setConfirmationEmailSent] = useState(false)

  // Check if Supabase is configured
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)
  
  useEffect(() => {
    // Check if we're using placeholder Supabase configuration
    const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                        process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co')
    setSupabaseConfigured(isConfigured)
  }, [])

  // Auto-focus email field on mobile for better UX
  useEffect(() => {
    const emailInput = document.getElementById('email')
    if (emailInput && window.innerWidth <= 768) {
      emailInput.focus()
    }
  }, [])

  // Real-time email validation
  const handleEmailChange = (value: string) => {
    const sanitized = sanitizeInput.email(value)
    setEmail(sanitized)
    
    if (value.trim()) {
      const validation = validationRules.email(sanitized)
      setEmailError(validation.isValid ? '' : validation.error || '')
    } else {
      setEmailError('')
    }
  }

  // Real-time password validation
  const handlePasswordChange = (value: string) => {
    setPassword(value)
    
    if (isSignUp && value.trim()) {
      const validation = validationRules.password(value)
      setPasswordError(validation.isValid ? '' : validation.error || '')
      setPasswordStrength(validation.strength || '')
    } else {
      setPasswordError('')
      setPasswordStrength('')
    }
  }

  const handlePasswordReset = async () => {
    if (!email || !validationRules.email(email).isValid) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const sanitizedEmail = sanitizeInput.email(email)
      // Use production URL for password reset redirect
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://www.splitsave.community' 
        : window.location.origin
      
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${baseUrl}/auth/reset-password`,
      })
      
      if (error) throw error
      
      setResetEmailSent(true)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email || !validationRules.email(email).isValid) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const sanitizedEmail = sanitizeInput.email(email)
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://www.splitsave.community' 
        : window.location.origin

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: sanitizedEmail,
        options: {
          emailRedirectTo: `${baseUrl}/auth/callback`
        }
      })
      
      if (error) throw error
      
      setConfirmationEmailSent(true)
      toast.success('Confirmation email sent! Check your inbox.')
    } catch (error: any) {
      setError(error.message)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 FORM SUBMIT: Starting authentication', { 
      isSignUp, 
      email: email.substring(0, 10) + '...', 
      formMode: isSignUp ? 'SIGNUP' : 'SIGNIN' 
    })
    setLoading(true)
    setError('')
    setEmailError('')
    setPasswordError('')

    // Final validation before submission
    const emailValidation = validationRules.email(email)
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || 'Invalid email')
      setLoading(false)
      return
    }

    if (isSignUp) {
      const passwordValidation = validationRules.password(password)
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.error || 'Invalid password')
        setLoading(false)
        return
      }
    }

    try {
      const sanitizedEmail = sanitizeInput.email(email)
      
      if (isSignUp) {
        console.log('🔐 SIGNUP MODE: Attempting to create new user')
        const { data, error } = await supabase.auth.signUp({
          email: sanitizedEmail,
          password,
          options: {
            emailRedirectTo: `${process.env.NODE_ENV === 'production' ? 'https://www.splitsave.community' : window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        
        // Check if email confirmation is required
        if (data.user && !data.user.email_confirmed_at) {
          toast.success('Account created! Please check your email for the confirmation link.')
        } else {
          toast.success('Account created successfully! You can now sign in.')
        }
      } else {
        console.log('🔐 SIGNIN MODE: Attempting login with existing user')
        console.log('🔐 Login details:', { email: sanitizedEmail, password: '***', isSignUp })
        console.log('🔐 Supabase client info:', {
          clientType: 'regular',
          environment: process.env.NODE_ENV
        })
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: sanitizedEmail,
          password,
        })
        
        console.log('🔐 Login result:', { 
          success: !!data.user, 
          error: error?.message,
          errorCode: error?.status,
          userId: data.user?.id 
        })
        
        if (error) {
          console.error('🔐 Login error details:', error)
          throw error
        }
      }
    } catch (error: any) {
      console.error('🔐 Login error details:', error)
      
      // Handle specific Supabase configuration errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        const errorMessage = 'Supabase is not configured. Please check your environment variables.'
        setError(errorMessage)
        toast.error(errorMessage)
      } else {
        setError(error.message)
        toast.error(error.message)
      }
    } finally {
      setLoading(false)
    }
  }



  const isFormValid = () => {
    const emailValid = validationRules.email(email).isValid
    if (isSignUp) {
      const passwordValid = validationRules.password(password).isValid
      return emailValid && passwordValid && !emailError && !passwordError
    }
    return emailValid && password.length > 0 && !emailError
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-6 sm:py-8 px-4 sm:px-6 lg:px-8 safe-area-inset-top safe-area-inset-bottom">
      {/* Hero Section for CRO */}
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          SplitSave
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          The smart way for couples and partners to manage shared expenses and build financial harmony together
        </p>
        
        {/* Development Notice */}
        {!supabaseConfigured && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Development Mode
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>Supabase is not configured. Authentication will not work until you set up your environment variables.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Social Proof */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <div className="flex -space-x-1 mr-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
              ))}
            </div>
            <span>Join 10,000+ happy couples</span>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-1">★★★★★</span>
            <span>4.9/5 rating</span>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm py-8 px-6 shadow-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            {/* Debug indicator - remove after fixing */}
            <div className="mt-1 text-xs font-mono bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
              DEBUG: Mode = {isSignUp ? 'SIGNUP' : 'SIGNIN'}
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {isSignUp ? 'Start your financial journey together' : 'Continue managing your shared finances'}
            </p>
          </div>

          {onBack && (
            <div className="mb-4">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to landing page
              </button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="text-heading-4 text-gray-700 dark:text-gray-300 space-small">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`input ${
                    emailFocused 
                      ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' 
                      : ''
                  } ${
                    emailError ? 'input-error' : ''
                  }`}
                  placeholder="Enter your email"
                />
                {email && !emailError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="space-small text-body-small text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="text-heading-4 text-gray-700 dark:text-gray-300 space-small">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`input pr-12 ${
                    passwordFocused 
                      ? 'border-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/30' 
                      : ''
                  } ${
                    passwordError ? 'input-error' : ''
                  }`}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="space-small text-body-small text-red-600 dark:text-red-400 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {passwordError}
                </p>
              )}
              {isSignUp && password && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Password strength:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'strong' ? 'text-green-600 dark:text-green-400' :
                      passwordStrength === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength === 'strong' ? 'bg-green-500 w-full' :
                        passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' : 
                        'bg-red-500 w-1/3'
                      }`}
                    />
                  </div>
                </div>
              )}

            </div>


            {/* Sign In Button - Fixed visibility for mobile PWA */}
            <div className="mt-6 mb-4">
              <button
                type="submit"
                disabled={loading}
                aria-label={isSignUp ? 'Create Account' : 'Sign In'}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style={{ minHeight: '48px', fontSize: '16px' }} // Ensure minimum touch target
              >
                {loading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Processing...
                  </>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>
              
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded">
                DEBUG: Button should be visible | Valid: {isFormValid() ? 'Yes' : 'No'} | Email: {email ? 'Set' : 'Empty'} | Password: {password.length > 0 ? 'Set' : 'Empty'}
              </div>
            </div>

            {/* Forgot Password Link - only show on sign in */}
            {!isSignUp && (
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors duration-200"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* Resend confirmation email for sign up */}
            {isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowResendConfirmation(true)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors duration-200"
                >
                  Didn't receive confirmation email?
                </button>
              </div>
            )}

            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🔒 Your data is encrypted and secure
              </p>
            </div>
          </form>

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Reset Password
                  </h3>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmailSent(false)
                      setError('')
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!resetEmailSent ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    <div className="mb-4">
                      <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email address
                      </label>
                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className="input w-full"
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 px-4 py-3 rounded-lg mb-4">
                        {error}
                      </div>
                    )}

                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowForgotPassword(false)
                          setError('')
                        }}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePasswordReset}
                        disabled={loading || !email || !validationRules.email(email).isValid}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Check your email
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                    <button
                      onClick={() => {
                        setShowForgotPassword(false)
                        setResetEmailSent(false)
                        setError('')
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resend Confirmation Modal */}
          {showResendConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Resend Confirmation Email
                  </h3>
                  <button
                    onClick={() => {
                      setShowResendConfirmation(false)
                      setConfirmationEmailSent(false)
                      setError('')
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100 rounded-lg flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                )}

                {!confirmationEmailSent ? (
                  <>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Enter your email address and we'll send you a new confirmation link.
                    </p>
                    <div className="mb-4">
                      <label htmlFor="resend-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email address
                      </label>
                      <input
                        id="resend-email"
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className="input w-full"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowResendConfirmation(false)
                          setError('')
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResendConfirmation}
                        disabled={loading || !email || !validationRules.email(email).isValid}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {loading ? 'Sending...' : 'Send Confirmation'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Check your email
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      We've sent a confirmation link to <strong>{email}</strong>
                    </p>
                    <button
                      onClick={() => {
                        setShowResendConfirmation(false)
                        setConfirmationEmailSent(false)
                        setError('')
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setEmail('')
                  setPassword('')
                }}
                className="font-medium text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 transition-colors duration-200"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Additional CRO elements */}
          {isSignUp && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">✨ What you'll get:</h3>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Free shared expense tracking</li>
                <li>• Collaborative savings goals</li>
                <li>• Real-time partner notifications</li>
                <li>• Financial insights and reports</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
