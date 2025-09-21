'use client'

import React, { Component, ReactNode, ErrorInfo } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
  retryCount: number
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState(prevState => ({
      error,
      errorInfo,
      errorId: prevState.errorId || `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }))

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo)
    }
  }

  logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      // In a real app, this would send to your error tracking service
      console.log('Error logged to service:', errorData)
    } catch (logError) {
      console.error('Failed to log error to service:', logError)
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
  }

  handleReportIssue = async () => {
    const errorData = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
      alert('Error details copied to clipboard. Please paste them in your support request.')
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've encountered an unexpected error and our team has been notified.
              </p>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error Details</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={this.handleReportIssue}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  📧 Report Issue
                </button>
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  🔄 Reload Page
                </button>
              </div>

              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 What you can do:</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Clear your browser cache and cookies</li>
                  <li>• Check your internet connection</li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need help? Contact our support team at{' '}
                  <a href="mailto:support@splitsave.com" className="text-blue-600 hover:text-blue-700">
                    support@splitsave.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, componentName?: string) => {
    console.error(`Error in ${componentName || 'component'}:`, error)
    
    // In a real app, you might want to send this to an error tracking service
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  }

  return { handleError }
}

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Async error boundary for handling async operations
interface AsyncErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ children, fallback }) => {
  const [hasAsyncError, setHasAsyncError] = React.useState(false)
  const [boundaryKey, setBoundaryKey] = React.useState(0)

  const resetErrors = React.useCallback(() => {
    setHasAsyncError(false)
    setBoundaryKey((key) => key + 1)
  }, [])

  const renderFallback = React.useCallback(() => {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Something went wrong with this operation. Please try again.
          </p>
          <button
            onClick={resetErrors}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }, [fallback, resetErrors])

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasAsyncError(true)
      console.error('Async error caught:', event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setHasAsyncError(true)
      console.error('Unhandled promise rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  if (hasAsyncError) {
    return renderFallback()
  }

  return (
    <ErrorBoundary
      key={boundaryKey}
      fallback={renderFallback()}
      onError={() => setHasAsyncError(true)}
    >
      {children}
    </ErrorBoundary>
  )
}
