export default function Home() {
  return (
    <>
      {/* Mobile Landing Page */}
      <div className="block md:hidden">
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          padding: '20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          {/* Mobile Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '20px 0'
          }}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#1e293b',
              marginBottom: '10px'
            }}>
              SplitSave
            </h1>
            <p style={{
              fontSize: '1.2rem',
              color: '#64748b',
              marginBottom: '20px'
            }}>
              Smart financial management for couples
            </p>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Split expenses fairly, track savings goals together, and build financial harmony with your partner.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '40px',
            maxWidth: '400px',
            margin: '0 auto 40px auto'
          }}>
            <button style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              Get Started
            </button>
            <button style={{
              backgroundColor: 'transparent',
              color: '#3b82f6',
              border: '2px solid #3b82f6',
              padding: '15px 30px',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Learn More
            </button>
          </div>

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '20px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💰</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '10px'
              }}>
                Fair Expense Splitting
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.5'
              }}>
                Split bills proportionally based on income or equally - whatever works for your relationship.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎯</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '10px'
              }}>
                Shared Goals
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.5'
              }}>
                Set and track savings goals together with real-time progress updates and celebrations.
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '25px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>📱</div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '10px'
              }}>
                Mobile First
              </h3>
              <p style={{
                color: '#64748b',
                lineHeight: '1.5'
              }}>
                Works perfectly on mobile, desktop, and as a PWA. Install it like a native app.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            textAlign: 'center',
            marginTop: '50px',
            padding: '20px',
            color: '#64748b',
            fontSize: '0.9rem'
          }}>
            <p>© 2024 SplitSave. Built with ❤️ for couples everywhere.</p>
          </div>
        </div>
      </div>

      {/* Desktop Landing Page */}
      <div className="hidden md:block">
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="px-4 pt-8 pb-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                SplitSave
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                Smart financial management for couples
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                Split expenses fairly, track savings goals together, and build financial harmony with your partner.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
                Get Started
              </button>
              <button className="border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold py-3 px-8 rounded-lg text-lg transition-colors">
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Fair Expense Splitting
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Split bills proportionally based on income or equally - whatever works for your relationship.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Shared Goals
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Set and track savings goals together with real-time progress updates and celebrations.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Mobile First
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Works perfectly on mobile, desktop, and as a PWA. Install it like a native app.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}