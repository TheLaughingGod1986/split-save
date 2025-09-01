'use client'

import React from 'react'
import { useTheme } from 'next-themes'

// Design tokens
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    900: '#0c4a6e',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
}

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
}

export const borderRadius = {
  sm: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  full: '9999px',
}

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
}

export const animations = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
  },
}

// Design System Constants
export const DESIGN_SYSTEM = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
}

// Button utility functions
export function getButtonClasses(variant: 'primary' | 'secondary' | 'outline' | 'ghost' = 'primary', size: 'sm' | 'md' | 'lg' = 'md') {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-lg',
  }
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:ring-blue-500',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-500',
  }
  
  return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`
}

// Card utility functions
export function getCardClasses(interactive: boolean = false) {
  const baseClasses = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm'
  const interactiveClasses = interactive ? 'cursor-pointer hover:shadow-md transform hover:-translate-y-1 transition-all duration-200' : ''
  
  return `${baseClasses} ${interactiveClasses}`
}

// Input utility functions
export function getInputClasses(size: 'sm' | 'md' | 'lg' = 'md', hasError: boolean = false) {
  const baseClasses = 'w-full border focus:outline-none focus:ring-2 transition-colors duration-200 dark:bg-gray-700 dark:text-white'
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-4 py-3 text-base rounded-lg',
  }
  
  const stateClasses = hasError 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
  
  return `${baseClasses} ${sizeClasses[size]} ${stateClasses}`
}

// Dark Mode Toggle Component
export function DarkModeToggle({ 
  variant = 'icon', 
  className = '',
  showLabel = false 
}: {
  variant?: 'icon' | 'button' | 'switch'
  className?: string
  showLabel?: boolean
}) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`} />
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const isDark = resolvedTheme === 'dark'

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isDark 
            ? 'bg-gray-800 text-white hover:bg-gray-700' 
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        } ${className}`}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="mr-2">
          {isDark ? '☀️' : '🌙'}
        </span>
        {showLabel && (isDark ? 'Light Mode' : 'Dark Mode')}
      </button>
    )
  }

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDark ? 'bg-blue-600' : 'bg-gray-200'
        } ${className}`}
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    )
  }

  return null
}

// Theme-aware color utilities
export function useThemeColors() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return {
    background: isDark ? colors.gray[900] : colors.gray[50],
    surface: isDark ? colors.gray[800] : 'white',
    text: {
      primary: isDark ? colors.gray[100] : colors.gray[900],
      secondary: isDark ? colors.gray[400] : colors.gray[600],
      muted: isDark ? colors.gray[500] : colors.gray[500],
    },
    border: isDark ? colors.gray[700] : colors.gray[200],
    accent: colors.primary[500],
  }
}

// CSS Variables for theme switching
export const cssVariables = {
  light: {
    '--color-background': colors.gray[50],
    '--color-surface': 'white',
    '--color-text-primary': colors.gray[900],
    '--color-text-secondary': colors.gray[600],
    '--color-border': colors.gray[200],
    '--color-accent': colors.primary[500],
  },
  dark: {
    '--color-background': colors.gray[900],
    '--color-surface': colors.gray[800],
    '--color-text-primary': colors.gray[100],
    '--color-text-secondary': colors.gray[400],
    '--color-border': colors.gray[700],
    '--color-accent': colors.primary[500],
  },
}
