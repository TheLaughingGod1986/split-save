'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class SafariErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🍎 Safari Error Boundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-6 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🍎</div>
              <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                Safari Compatibility Issue
              </h2>
              <p className="text-red-700 dark:text-red-300 mb-4">
                We encountered a Safari-specific error. This might be due to Safari's security settings or private browsing mode.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Try Standard Version
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-left">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Error Details:
                </h3>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="mt-1 text-xs overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
