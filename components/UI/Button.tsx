import React from 'react'
import { getButtonClasses } from '../DesignSystem'

interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  className?: string
  'aria-label'?: string
  'aria-describedby'?: string
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy
}: ButtonProps) {
  const baseClasses = getButtonClasses(variant, size)
  const isDisabled = disabled || loading
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={`${baseClasses} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading && (
        <div className="inline-flex items-center mr-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        </div>
      )}
      {children}
    </button>
  )
}
