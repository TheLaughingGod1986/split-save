'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

  // Auto-focus email field on mobile for better UX
  useEffect(() => {
    const emailInput = document.getElementById('email')
    if (emailInput && window.innerWidth <= 768) {
      emailInput.focus()
    }
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        // Show success message for sign up
        showToast('Check your email for the confirmation link!', 'success')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      }
    } catch (error: any) {
      setError(error.message)
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    // Create toast element
    const toast = document.createElement('div')
    toast.className = `toast toast-${type} show`
    toast.textContent = message
    
    document.body.appendChild(toast)
    
    // Remove toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show')
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 5000)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const isFormValid = () => {
    if (isSignUp) {
      return validateEmail(email) && validatePassword(password)
    }
    return email.length > 0 && password.length > 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="form-section bg-white/80 dark:bg-gray-800/90 backdrop-blur-sm py-8 px-6 shadow-xl rounded-2xl border border-white/20 dark:border-gray-700/50">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              {isSignUp ? 'Start your financial journey together' : 'Continue managing your shared finances'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    emailFocused 
                      ? 'border-purple-500 ring-4 ring-purple-100 dark:ring-purple-900/30' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    email && !validateEmail(email) ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                  placeholder="Enter your email"
                />
                {email && validateEmail(email) && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {email && !validateEmail(email) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Please enter a valid email address</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-lg transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
                    passwordFocused 
                      ? 'border-purple-500 ring-4 ring-purple-100 dark:ring-purple-900/30' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    password && !validatePassword(password) ? 'border-red-500 dark:border-red-400' : ''
                  }`}
                  placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
              {isSignUp && password && !validatePassword(password) && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">Password must be at least 8 characters long</p>
              )}
            </div>

            {/* Password strength indicator for sign up */}
            {isSignUp && password && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Password strength:</span>
                  <span className={password.length >= 8 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400'}>
                    {password.length >= 8 ? 'Strong' : 'Weak'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      password.length >= 8 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((password.length / 8) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="btn btn-primary w-full py-3 px-4 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

            {/* Trust indicators */}
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🔒 Your data is encrypted and secure
              </p>
            </div>
          </form>

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
          <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
