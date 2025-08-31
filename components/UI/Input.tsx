import React from 'react'
import { getInputClasses } from '../DesignSystem'

interface InputProps {
  label?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  id?: string
  'aria-describedby'?: string
  autoComplete?: string
  inputMode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
}

export function Input({ 
  label,
  value, 
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  size = 'md',
  className = '',
  id,
  'aria-describedby': ariaDescribedBy,
  autoComplete,
  inputMode
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ')
  const inputClasses = getInputClasses(size, !!error)
  
  return (
    <div className={className}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-describedby={describedBy || undefined}
        aria-invalid={!!error}
        className={inputClasses}
      />
      
      {error && (
        <div 
          id={errorId}
          role="alert"
          className="mt-2 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </div>
      )}
    </div>
  )
}
