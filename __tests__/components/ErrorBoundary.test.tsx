import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorBoundary, useErrorHandler, withErrorBoundary, AsyncErrorBoundary } from '@/components/ui/ErrorBoundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Component that uses the error handler hook
const ComponentWithErrorHandler = () => {
  const { handleError } = useErrorHandler()
  
  const triggerError = () => {
    handleError(new Error('Hook error'), 'test-component')
  }
  
  return (
    <div>
      <button onClick={triggerError}>Trigger Error</button>
    </div>
  )
}

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  const originalConsoleLog = console.log
  
  beforeEach(() => {
    // Suppress console errors during tests
    console.error = jest.fn()
    console.warn = jest.fn()
    console.log = jest.fn()
  })
  
  afterEach(() => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    console.log = originalConsoleLog
  })

  describe('Basic Error Handling', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders error UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('🚨')).toBeInTheDocument()
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('We\'ve encountered an unexpected error and our team has been notified.')).toBeInTheDocument()
    })

    it('generates unique error ID', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      const errorId = screen.getByText(/ID:/)
      expect(errorId).toBeInTheDocument()
      expect(errorId.textContent).toMatch(/err_\d+_[a-z0-9]+/)
    })
  })

  describe('Error UI Elements', () => {
    it('displays error details in development mode', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Error Details')).toBeInTheDocument()
      // Check that the error message is displayed in the error details section
      expect(screen.getByText(/Message:/)).toBeInTheDocument()
      // Check that the error message content is displayed
      expect(screen.getByText('Test error message')).toBeInTheDocument()
      
      // Restore environment
      process.env.NODE_ENV = originalEnv
    })

    it('shows action buttons', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByRole('button', { name: /🔄 Try Again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /📧 Report Issue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🔄 Reload Page/i })).toBeInTheDocument()
    })

    it('displays helpful tips', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true } />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('💡 What you can do:')).toBeInTheDocument()
      expect(screen.getByText('• Try refreshing the page')).toBeInTheDocument()
      expect(screen.getByText('• Clear your browser cache and cookies')).toBeInTheDocument()
      expect(screen.getByText('• Check your internet connection')).toBeInTheDocument()
    })

    it('shows support contact information', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText(/Need help\? Contact our support team at/)).toBeInTheDocument()
      expect(screen.getByText('support@splitsave.com')).toBeInTheDocument()
    })


  })

  describe('Error Boundary Actions', () => {
    beforeEach(() => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
    })

    it('handles retry action', () => {
      const retryButton = screen.getByRole('button', { name: /🔄 Try Again/i })
      fireEvent.click(retryButton)
      
      // Should attempt to recover
      expect(screen.getByText('🚨')).toBeInTheDocument()
    })

    it('handles report issue action', () => {
      // Mock clipboard API
      const mockClipboard = {
        writeText: jest.fn().mockResolvedValue(undefined),
      }
      Object.assign(navigator, { clipboard: mockClipboard })
      
      const reportButton = screen.getByRole('button', { name: /📧 Report Issue/i })
      fireEvent.click(reportButton)
      
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })

    it('handles reload page action', () => {
      // Mock window.location.reload
      const mockReload = jest.fn()
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      })
      
      const reloadButton = screen.getByRole('button', { name: /🔄 Reload Page/i })
      fireEvent.click(reloadButton)
      
      expect(mockReload).toHaveBeenCalled()
    })
  })

  describe('Custom Fallback UI', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('🚨')).not.toBeInTheDocument()
    })
  })

  describe('Error Handler Hook', () => {
    it('provides error handling function', () => {
      render(<ComponentWithErrorHandler />)
      
      const button = screen.getByRole('button', { name: /Trigger Error/i })
      expect(button).toBeInTheDocument()
      
      fireEvent.click(button)
      
      // Should call console.error (mocked)
      expect(console.error).toHaveBeenCalledWith('Error in test-component:', expect.any(Error))
    })
  })

  describe('Higher-Order Component', () => {
    it('wraps component with error boundary', () => {
      const TestComponent = () => <div>Test component</div>
      const WrappedComponent = withErrorBoundary(TestComponent)
      
      render(<WrappedComponent />)
      
      expect(screen.getByText('Test component')).toBeInTheDocument()
    })

    it('handles errors in wrapped component', () => {
      const TestComponent = () => <ThrowError shouldThrow={true} />
      const WrappedComponent = withErrorBoundary(TestComponent)
      
      render(<WrappedComponent />)
      
      expect(screen.getByText('🚨')).toBeInTheDocument()
    })
  })

  describe('Async Error Boundary', () => {
    it('renders default fallback for async operations', () => {
      render(
        <AsyncErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AsyncErrorBoundary>
      )
      
      expect(screen.getByText('⚠️')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong with this operation. Please try again.')).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
      const customFallback = <div>Custom async error</div>
      
      render(
        <AsyncErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </AsyncErrorBoundary>
      )
      
      expect(screen.getByText('Custom async error')).toBeInTheDocument()
    })
  })

  describe('Error Logging', () => {
    it('logs errors to console in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(console.error).toHaveBeenCalledWith('ErrorBoundary caught an error:', expect.any(Error), expect.any(Object))
      
      process.env.NODE_ENV = originalEnv
    })

    it('calls custom error handler when provided', () => {
      const mockErrorHandler = jest.fn()
      
      render(
        <ErrorBoundary onError={mockErrorHandler}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(mockErrorHandler).toHaveBeenCalledWith(expect.any(Error), expect.any(Object))
    })
  })

  describe('Production Environment', () => {
    it('logs errors to external service in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      // Mock fetch for external service
      global.fetch = jest.fn()
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Should attempt to log to external service
      expect(console.log).toHaveBeenCalledWith('Error logged to service:', expect.any(Object))
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Accessibility', () => {
    beforeEach(() => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
    })

    it('has proper heading structure', () => {
      expect(screen.getByRole('heading', { name: /Oops! Something went wrong/i })).toBeInTheDocument()
    })

    it('has accessible buttons', () => {
      expect(screen.getByRole('button', { name: /🔄 Try Again/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /📧 Report Issue/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /🔄 Reload Page/i })).toBeInTheDocument()
    })

    it('provides clear error information', () => {
      expect(screen.getByText('We\'ve encountered an unexpected error and our team has been notified.')).toBeInTheDocument()
    })
  })

  describe('Error Recovery', () => {
    it('tracks retry count', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      const retryButton = screen.getByRole('button', { name: /🔄 Try Again/i })
      
      // First retry
      fireEvent.click(retryButton)
      
      // Trigger error again
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      // Should still show error UI
      expect(screen.getByText('🚨')).toBeInTheDocument()
    })
  })
})


