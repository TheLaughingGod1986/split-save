'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function MobilePage() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [supabaseConfigured, setSupabaseConfigured] = useState(true)

  // Check if Supabase is configured
  React.useEffect(() => {
    const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co')
    setSupabaseConfigured(isConfigured)
    console.log('🔍 Mobile: Supabase config check', { 
      isConfigured,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL 
    })
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔍 Mobile Auth: Starting authentication', { 
      isSignUp, 
      email: email.substring(0, 10) + '...',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
    })

    try {
      if (isSignUp) {
        console.log('🔍 Mobile Auth: Attempting signup')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        console.log('🔍 Mobile Auth: Signup result', { 
          hasUser: !!data.user, 
          error: error?.message,
          userId: data.user?.id 
        })
        if (error) throw error
        if (data.user) {
          console.log('🔍 Mobile Auth: Signup successful, redirecting')
          // Redirect to desktop version after successful signup
          window.location.href = '/?desktop=true&mobile=override'
        }
      } else {
        console.log('🔍 Mobile Auth: Attempting signin')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        console.log('🔍 Mobile Auth: Signin result', { 
          hasUser: !!data.user, 
          hasSession: !!data.session,
          error: error?.message,
          userId: data.user?.id 
        })
        if (error) throw error
        if (data.user) {
          console.log('🔍 Mobile Auth: Signin successful, redirecting')
          // Redirect to desktop version after successful signin
          window.location.href = '/?desktop=true&mobile=override'
        }
      }
    } catch (error: any) {
      console.error('🔍 Mobile Auth: Error details', error)
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (showLogin) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '20px'
      }}>
        {/* Mobile Navigation Header */}
        <div style={{
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          marginBottom: '20px'
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: 0
          }}>
            SplitSave
          </h1>
          <button 
            onClick={() => setShowLogin(false)}
            style={{
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '0.9rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Back
          </button>
        </div>

        {/* Login Form */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          border: '1px solid #e5e7eb',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {isSignUp ? 'Sign Up for SplitSave' : 'Sign In to SplitSave'}
          </h2>

          {!supabaseConfigured && (
            <div style={{
              backgroundColor: '#fef3cd',
              border: '1px solid #fde68a',
              color: '#92400e',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.875rem'
            }}>
              ⚠️ Supabase is not configured. Authentication will not work until environment variables are set.
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleAuth}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: loading ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '16px'
              }}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#6b7280'
          }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError('')
              }}
              style={{
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Sign in here' : 'Sign up here'}
            </button>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            fontSize: '0.875rem',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '8px' }}>🔒</div>
            <div>Your data is encrypted and secure</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Mobile Navigation Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1e293b',
          margin: 0
        }}>
          SplitSave
        </h1>
        <button 
          onClick={() => setShowLogin(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Sign In
        </button>
      </div>

      {/* Hero Section */}
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        color: '#1e293b',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h2 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          marginBottom: '24px',
          margin: '0 0 24px 0',
          lineHeight: '1.1'
        }}>
          Split Expenses
          <span style={{
            background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}> Fairly</span>
          <br />
          Save Together
        </h2>
        <p style={{
          fontSize: '1.25rem',
          marginBottom: '40px',
          color: '#64748b',
          lineHeight: '1.6',
          maxWidth: '600px',
          margin: '0 auto 40px auto'
        }}>
          The smart way for couples to manage shared expenses, track savings goals, and build financial harmony together.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          maxWidth: '400px',
          margin: '0 auto',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => setShowLogin(true)}
            style={{
              background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease',
              minWidth: '160px'
            }}
          >
            Get Started Free
          </button>
          <button 
            onClick={() => {
              // Scroll to features section
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
            }}
            style={{
              backgroundColor: 'transparent',
              color: '#8b5cf6',
              border: '2px solid #8b5cf6',
              padding: '14px 32px',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '160px'
            }}
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={{
        padding: '80px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white'
      }}>
        <h3 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#1e293b',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          Everything you need for shared finances
        </h3>
        <p style={{
          fontSize: '1.125rem',
          color: '#64748b',
          textAlign: 'center',
          marginBottom: '60px',
          maxWidth: '600px',
          margin: '0 auto 60px auto'
        }}>
          SplitSave is a comprehensive financial management platform designed specifically for couples.
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '24px'
        }}>
          {/* Feature 1 */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginRight: '16px'
              }}>💰</div>
              <h4 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Fair Expense Splitting
              </h4>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Split bills proportionally based on income or equally - whatever works for your relationship.
            </p>
          </div>

          {/* Feature 2 */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '2.5rem',
                marginRight: '16px'
              }}>🎯</div>
              <h4 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Shared Savings Goals
              </h4>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Set and track savings goals together with real-time progress updates and celebrations.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          marginBottom: '16px',
          margin: '0 0 16px 0'
        }}>
          Ready to transform your shared finances?
        </h3>
        <p style={{
          fontSize: '1.1rem',
          marginBottom: '32px',
          opacity: 0.9,
          maxWidth: '600px',
          margin: '0 auto 32px auto'
        }}>
          Join thousands of couples who are building financial harmony together with SplitSave.
        </p>
        <button 
          onClick={() => setShowLogin(true)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          Get Started Free
        </button>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f8fafc',
        padding: '40px 20px',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb'
      }}>
        <p style={{
          color: '#64748b',
          fontSize: '0.9rem',
          margin: 0
        }}>
          © 2024 SplitSave. Built with ❤️ for couples everywhere.
        </p>
      </div>
    </div>
  )
}