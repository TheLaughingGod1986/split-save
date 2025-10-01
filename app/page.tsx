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
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Smart Financial Management for Couples
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '32px',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>
            Split expenses fairly, track savings goals together, and build financial harmony with your partner.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxWidth: '300px',
            margin: '0 auto'
          }}>
            <button style={{
              backgroundColor: 'white',
              color: '#3b82f6',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              Get Started Free
            </button>
            <button style={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Learn More
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{
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
          <button style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
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