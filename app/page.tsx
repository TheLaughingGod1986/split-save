import { DesktopApp } from '@/components/DesktopApp'
import { headers } from 'next/headers'

export default function Home() {
  // Get user agent from headers to detect mobile devices
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // Simple mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  if (isMobile) {
    // Render mobile version with desktop-like design
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
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            Sign In
          </button>
        </div>

        {/* Hero Section */}
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Floating Elements */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 3s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            top: '60px',
            right: '30px',
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            animation: 'float 4s ease-in-out infinite reverse'
          }} />
          
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Split Expenses
            <span style={{
              background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}> Fairly</span>
            <br />
            Save Together
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '32px',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            The smart way for couples to manage shared expenses, track savings goals, and build financial harmony together.
          </p>

          {/* App Preview Image */}
          <div style={{
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <img 
              src="/og-image.png" 
              alt="SplitSave App Preview"
              style={{
                maxWidth: '300px',
                width: '100%',
                height: 'auto',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '2px solid rgba(255,255,255,0.2)'
              }}
            />
          </div>

          {/* App Availability */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
            fontSize: '0.9rem',
            opacity: 0.9
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
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '300px',
            margin: '0 auto'
          }}>
            <button 
              onClick={() => {
                // Scroll to features section
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
              style={{
                backgroundColor: 'white',
                color: '#3b82f6',
                border: 'none',
                padding: '14px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.transform = 'scale(1.05)'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.transform = 'scale(1)'}
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
                color: 'white',
                border: '2px solid white',
                padding: '12px 28px',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = 'white'
                target.style.color = '#3b82f6'
              }}
              onMouseOut={(e) => {
                const target = e.target as HTMLButtonElement
                target.style.backgroundColor = 'transparent'
                target.style.color = 'white'
              }}
            >
              Learn More
            </button>
          </div>

          {/* Social Proof */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginTop: '32px',
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '-4px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #a855f7, #3b82f6)',
                    border: '2px solid white',
                    marginLeft: i > 1 ? '-8px' : '0'
                  }} />
                ))}
              </div>
              <span>Join 10,000+ couples</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: '#fbbf24' }}>★★★★★</span>
              <span>4.9/5 rating</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div id="features" style={{
          padding: '40px 20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <h3 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            Everything you need for shared finances
          </h3>
          
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
              // For now, just show an alert. In a real app, this would open a signup modal
              alert('Sign up functionality coming soon! For now, please use the desktop version to create an account.')
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
            Start Your Free Trial
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

  // Desktop version
  return <DesktopApp />
}