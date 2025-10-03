'use client'

import { useState } from 'react'

export default function MobilePage() {
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // For now, just redirect to desktop version
      // This will be replaced with real authentication later
      window.location.href = '/?desktop=true&mobile=override'
    } catch (error: any) {
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
          onMouseOver={(e) => {
            const target = e.target as HTMLButtonElement
            target.style.backgroundColor = '#2563eb'
            target.style.transform = 'scale(1.05)'
          }}
          onMouseOut={(e) => {
            const target = e.target as HTMLButtonElement
            target.style.backgroundColor = '#3b82f6'
            target.style.transform = 'scale(1)'
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
        {/* Floating Elements */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '60px',
          height: '60px',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderRadius: '50%',
          animation: 'float 3s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '30px',
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '50%',
          animation: 'float 4s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50px',
          width: '30px',
          height: '30px',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderRadius: '50%',
          animation: 'float 5s ease-in-out infinite'
        }} />
        
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

        {/* App Preview Image */}
        <div style={{
          marginBottom: '40px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'relative',
            maxWidth: '350px',
            width: '100%'
          }}>
            <img 
              src="/og-image.png" 
              alt="SplitSave App Preview"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}
            />
            {/* Decorative elements around image */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '-10px',
              width: '20px',
              height: '20px',
              backgroundColor: '#8b5cf6',
              borderRadius: '50%',
              opacity: 0.6
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              right: '-10px',
              width: '16px',
              height: '16px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              opacity: 0.6
            }} />
          </div>
        </div>

        {/* App Availability */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          marginBottom: '40px',
          fontSize: '0.9rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#10b981',
              borderRadius: '50%'
            }}></span>
            <span>Available now as Web App</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#f59e0b',
              borderRadius: '50%'
            }}></span>
            <span>iOS & Android apps coming soon</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
          maxWidth: '400px',
          margin: '0 auto',
          justifyContent: 'center'
        }}>
          <button 
            onClick={() => {
              // Redirect to desktop version for sign up
              window.location.href = '/?desktop=true&mobile=override'
            }}
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
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.transform = 'translateY(-2px)'
              target.style.boxShadow = '0 12px 24px rgba(139, 92, 246, 0.4)'
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.transform = 'translateY(0)'
              target.style.boxShadow = '0 8px 16px rgba(139, 92, 246, 0.3)'
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
            onMouseOver={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.backgroundColor = '#8b5cf6'
              target.style.color = 'white'
              target.style.transform = 'translateY(-2px)'
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLButtonElement
              target.style.backgroundColor = 'transparent'
              target.style.color = '#8b5cf6'
              target.style.transform = 'translateY(0)'
            }}
          >
            Learn More
          </button>
        </div>

        {/* Social Proof */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '32px',
          marginTop: '48px',
          fontSize: '0.9rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '-4px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(45deg, #8b5cf6, #3b82f6)',
                  border: '3px solid white',
                  marginLeft: i > 1 ? '-8px' : '0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }} />
              ))}
            </div>
            <span style={{ fontWeight: '500' }}>Join 10,000+ couples</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#fbbf24', fontSize: '1.1rem' }}>★★★★★</span>
            <span style={{ fontWeight: '500' }}>4.9/5 rating</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
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
          It goes beyond simple expense splitting to help you build a stronger financial future together.
        </p>
        
        {/* How SplitSave Works Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          marginBottom: '60px'
        }}>
          <h4 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            How SplitSave Works
          </h4>
          
          {/* Step 1 */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px 24px',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '24px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>1</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginRight: '20px'
              }}>🤝</div>
              <div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  Connect with Your Partner
                </h4>
                <p style={{
                  color: '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Takes less than 2 minutes
                </p>
              </div>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Invite your partner to join your shared financial space. Set up your partnership in minutes and start managing money together.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px 24px',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>2</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginRight: '20px'
              }}>💰</div>
              <div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  Add Shared Expenses
                </h4>
                <p style={{
                  color: '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  No more manual calculations
                </p>
              </div>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Record shared expenses and let SplitSave automatically calculate fair shares based on your income. 
              See who owes what in real-time.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px 24px',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '24px',
              backgroundColor: '#10b981',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>3</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginRight: '20px'
              }}>🎯</div>
              <div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  Set Goals & Track Progress
                </h4>
                <p style={{
                  color: '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Stay motivated together
                </p>
              </div>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Create shared savings goals and track your progress with beautiful visual charts. 
              Celebrate milestones together and stay motivated.
            </p>
          </div>

          {/* Step 4 */}
          <div style={{
            backgroundColor: 'white',
            padding: '32px 24px',
            borderRadius: '16px',
            boxShadow: '0 8px 16px rgba(0,0,0,0.05)',
            border: '1px solid #e5e7eb',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              left: '24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}>4</div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                fontSize: '3rem',
                marginRight: '20px'
              }}>📊</div>
              <div>
                <h4 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 8px 0'
                }}>
                  Build Financial Harmony
                </h4>
                <p style={{
                  color: '#64748b',
                  margin: 0,
                  fontSize: '0.9rem'
                }}>
                  Transparent & fair
                </p>
              </div>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Get personalized insights, recommendations, and build a stronger financial future together. 
              Complete transparency and fairness in every transaction.
            </p>
          </div>
        </div>

        {/* Features Grid */}
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
              Track shared expenses and see who owes what in real-time.
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
              Set and track savings goals together with real-time progress updates, celebrations, 
              and gamified achievements to keep you motivated.
            </p>
          </div>

          {/* Feature 3 */}
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
              }}>📊</div>
              <h4 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Financial Insights
              </h4>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Get personalized insights into your spending patterns, budget recommendations, 
              and financial forecasts to make better decisions together.
            </p>
          </div>

          {/* Feature 4 */}
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
              }}>🔒</div>
              <h4 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Secure & Private
              </h4>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Bank-level security with end-to-end encryption. Your financial data is private, 
              secure, and only accessible to you and your partner.
            </p>
          </div>

          {/* Additional Features */}
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
              }}>📱</div>
              <h4 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Mobile Optimized
              </h4>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              Access your financial data anywhere with our mobile-optimized web app. 
              Full functionality on all devices with offline support.
            </p>
          </div>

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
              }}>⚡</div>
              <h4 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1e293b',
                margin: 0
              }}>
                Real-Time Sync
              </h4>
            </div>
            <p style={{
              color: '#64748b',
              lineHeight: '1.6',
              margin: 0
            }}>
              All changes sync instantly between you and your partner. 
              Never miss an update with real-time notifications and live data.
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
            onClick={() => {
              // Redirect to desktop version for sign up
              window.location.href = '/?desktop=true&mobile=override'
            }}
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
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = '#2563eb'
                target.style.transform = 'translateY(-2px)'
                target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = '#3b82f6'
                target.style.transform = 'translateY(0)'
                target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
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
