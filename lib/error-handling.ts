'use client'

import { toast } from 'react-hot-toast'

export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: Date
  userId?: string
  context?: string
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle application errors with user-friendly messages
   */
  handleError(error: Error | AppError, context?: string): void {
    const appError: AppError = this.normalizeError(error, context)
    
    // Log error
    this.logError(appError)
    
    // Show user-friendly message
    this.showUserMessage(appError)
    
    // Report to analytics (if available)
    this.reportError(appError)
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error: any, endpoint: string): void {
    const message = this.getApiErrorMessage(error)
    const appError: AppError = {
      code: 'API_ERROR',
      message,
      details: { endpoint, status: error.status, response: error.response },
      timestamp: new Date(),
      context: `API: ${endpoint}`
    }
    
    this.handleError(appError, `API: ${endpoint}`)
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: Error): void {
    const appError: AppError = {
      code: 'NETWORK_ERROR',
      message: 'Connection issue. Please check your internet connection and try again.',
      details: error,
      timestamp: new Date(),
      context: 'Network'
    }
    
    this.handleError(appError, 'Network')
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field: string, message: string): void {
    const appError: AppError = {
      code: 'VALIDATION_ERROR',
      message: `${field}: ${message}`,
      details: { field },
      timestamp: new Date(),
      context: 'Validation'
    }
    
    this.handleError(appError, 'Validation')
  }

  private normalizeError(error: Error | AppError, context?: string): AppError {
    if ('code' in error) {
      return error
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date(),
      context
    }
  }

  private getErrorMessage(error: Error): string {
    // Map common errors to user-friendly messages
    const errorMessages: { [key: string]: string } = {
      'NetworkError': 'Unable to connect. Please check your internet connection.',
      'TimeoutError': 'Request timed out. Please try again.',
      'ValidationError': 'Please check your input and try again.',
      'AuthenticationError': 'Please log in again to continue.',
      'PermissionError': 'You don\'t have permission to perform this action.',
      'NotFoundError': 'The requested item could not be found.',
      'ServerError': 'Something went wrong on our end. Please try again later.'
    }

    return errorMessages[error.name] || 'An unexpected error occurred. Please try again.'
  }

  private getApiErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Please log in again to continue.'
    }
    if (error.status === 403) {
      return 'You don\'t have permission to perform this action.'
    }
    if (error.status === 404) {
      return 'The requested item could not be found.'
    }
    if (error.status === 429) {
      return 'Too many requests. Please wait a moment and try again.'
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.'
    }
    if (error.message) {
      return error.message
    }
    return 'An error occurred while processing your request.'
  }

  private showUserMessage(error: AppError): void {
    // Don't show toast for validation errors (they should be shown inline)
    if (error.code === 'VALIDATION_ERROR') {
      return
    }

    // Show appropriate toast based on error type
    switch (error.code) {
      case 'NETWORK_ERROR':
        toast.error(error.message, { duration: 5000 })
        break
      case 'API_ERROR':
        toast.error(error.message, { duration: 4000 })
        break
      case 'AUTHENTICATION_ERROR':
        toast.error(error.message, { duration: 3000 })
        break
      default:
        toast.error(error.message, { duration: 4000 })
    }
  }

  private logError(error: AppError): void {
    this.errorLog.push(error)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('App Error:', error)
    }
  }

  private reportError(error: AppError): void {
    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // errorReportingService.captureException(error)
    }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog.slice(-limit)
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = []
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error scenarios
export const handleApiError = (error: any, endpoint: string) => {
  errorHandler.handleApiError(error, endpoint)
}

export const handleNetworkError = (error: Error) => {
  errorHandler.handleNetworkError(error)
}

export const handleValidationError = (field: string, message: string) => {
  errorHandler.handleValidationError(field, message)
}

// React hook for error handling
export function useErrorHandler() {
  return {
    handleError: (error: Error | AppError, context?: string) => errorHandler.handleError(error, context),
    handleApiError: (error: any, endpoint: string) => errorHandler.handleApiError(error, endpoint),
    handleNetworkError: (error: Error) => errorHandler.handleNetworkError(error),
    handleValidationError: (field: string, message: string) => errorHandler.handleValidationError(field, message),
    getRecentErrors: (limit?: number) => errorHandler.getRecentErrors(limit),
    clearErrors: () => errorHandler.clearErrors()
  }
}
