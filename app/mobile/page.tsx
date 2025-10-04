export default function MobilePage() {
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
        <a 
          href="/?desktop=true&mobile=override"
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Sign In
        </a>
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
          <a 
            href="/?desktop=true&mobile=override"
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
              minWidth: '160px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Get Started Free
          </a>
          <a 
            href="#features"
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
              minWidth: '160px',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Learn More
          </a>
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
        <a 
          href="/?desktop=true&mobile=override"
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
            transition: 'all 0.2s ease',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Get Started Free
        </a>
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