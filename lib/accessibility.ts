'use client'

import React from 'react'

/**
 * Accessibility utilities for SplitSave
 * Ensures the app is accessible to users with disabilities
 */

export interface AccessibilityConfig {
  enableHighContrast: boolean
  enableReducedMotion: boolean
  enableScreenReader: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  colorBlindSupport: boolean
}

export class AccessibilityManager {
  private config: AccessibilityConfig
  private listeners: Map<string, Function[]> = new Map()

  constructor() {
    this.config = {
      enableHighContrast: false,
      enableReducedMotion: false,
      enableScreenReader: false,
      fontSize: 'medium',
      colorBlindSupport: false
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Check for system preferences
    this.detectSystemPreferences()
    
    // Apply initial accessibility settings
    this.applyAccessibilitySettings()
    
    // Listen for preference changes
    this.setupPreferenceListeners()
  }

  private detectSystemPreferences() {
    if (typeof window.matchMedia === 'function') {
      // Check for reduced motion preference
      try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          this.config.enableReducedMotion = true
        }
      } catch (error) {
        console.warn('⚠️ AccessibilityManager: reduced motion detection failed', error)
      }

      // Check for high contrast preference
      try {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
          this.config.enableHighContrast = true
        }
      } catch (error) {
        console.warn('⚠️ AccessibilityManager: high contrast detection failed', error)
      }
    }

    // Check for screen reader (basic detection)
    if (window.navigator.userAgent.includes('NVDA') || 
        window.navigator.userAgent.includes('JAWS') ||
        window.navigator.userAgent.includes('VoiceOver')) {
      this.config.enableScreenReader = true
    }
  }

  private setupPreferenceListeners() {
    if (typeof window.matchMedia !== 'function') {
      return
    }

    const addMediaQueryListener = (
      query: MediaQueryList,
      callback: (event: MediaQueryListEvent) => void
    ) => {
      if (typeof query.addEventListener === 'function') {
        query.addEventListener('change', callback)
        return () => query.removeEventListener('change', callback)
      }

      // Fallback for Safari and older browsers
      if (typeof query.addListener === 'function') {
        query.addListener(callback)
        return () => query.removeListener(callback)
      }

      console.warn('⚠️ AccessibilityManager: MediaQueryList change listener not supported')
      return () => {}
    }

    // Listen for reduced motion changes
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    addMediaQueryListener(reducedMotionQuery, (event) => {
      this.config.enableReducedMotion = event.matches
      this.applyAccessibilitySettings()
      this.emit('reducedMotionChanged', event.matches)
    })

    // Listen for high contrast changes
    const highContrastQuery = window.matchMedia('(prefers-contrast: high)')
    addMediaQueryListener(highContrastQuery, (event) => {
      this.config.enableHighContrast = event.matches
      this.applyAccessibilitySettings()
      this.emit('highContrastChanged', event.matches)
    })
  }

  private applyAccessibilitySettings() {
    const root = document.documentElement

    // Apply reduced motion
    if (this.config.enableReducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }

    // Apply high contrast
    if (this.config.enableHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large')
    root.classList.add(`font-${this.config.fontSize}`)

    // Apply color blind support
    if (this.config.colorBlindSupport) {
      root.classList.add('colorblind-support')
    } else {
      root.classList.remove('colorblind-support')
    }

    // Apply screen reader optimizations
    if (this.config.enableScreenReader) {
      root.classList.add('screen-reader-optimized')
    } else {
      root.classList.remove('screen-reader-optimized')
    }
  }

  /**
   * Update accessibility configuration
   */
  updateConfig(newConfig: Partial<AccessibilityConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.applyAccessibilitySettings()
    this.emit('configChanged', this.config)
  }

  /**
   * Get current configuration
   */
  getConfig(): AccessibilityConfig {
    return { ...this.config }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)?.push(callback)
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(cb => cb !== callback))
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(callback => callback(...args))
  }
}

// Create global instance
export const accessibilityManager = new AccessibilityManager()

// Utility functions for accessibility
export const accessibilityUtils = {
  /**
   * Generate accessible color combinations
   */
  getAccessibleColors(foreground: string, background: string): { foreground: string; background: string } {
    // Basic contrast ratio check (simplified)
    // In a real implementation, you'd use a proper contrast ratio calculator
    return { foreground, background }
  },

  /**
   * Generate ARIA labels for financial data
   */
  generateAriaLabel(type: string, value: number, currency: string): string {
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === '£' ? 'GBP' : currency === '$' ? 'USD' : 'EUR'
    }).format(value)

    switch (type) {
      case 'income':
        return `Monthly income: ${formattedValue}`
      case 'expense':
        return `Monthly expense: ${formattedValue}`
      case 'savings':
        return `Savings goal: ${formattedValue}`
      case 'contribution':
        return `Contribution amount: ${formattedValue}`
      default:
        return `${type}: ${formattedValue}`
    }
  },

  /**
   * Generate accessible descriptions for charts
   */
  generateChartDescription(chartType: string, data: any[]): string {
    const itemCount = data.length
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0)
    
    switch (chartType) {
      case 'pie':
        return `Pie chart showing ${itemCount} categories with a total value of ${total}`
      case 'bar':
        return `Bar chart displaying ${itemCount} data points with values ranging from ${Math.min(...data.map(d => d.value))} to ${Math.max(...data.map(d => d.value))}`
      case 'line':
        return `Line chart showing trends over ${itemCount} time periods`
      default:
        return `Chart displaying ${itemCount} data points`
    }
  },

  /**
   * Check if element is visible to screen readers
   */
  isVisibleToScreenReader(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.getAttribute('aria-hidden') !== 'true'
  },

  /**
   * Focus management for modals and overlays
   */
  trapFocus(element: HTMLElement) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus()
            e.preventDefault()
          }
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTabKey)
    }
  },

  /**
   * Announce changes to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
}

// React hook for accessibility
export function useAccessibility() {
  const [config, setConfig] = React.useState(accessibilityManager.getConfig())

  React.useEffect(() => {
    const handleConfigChange = (newConfig: AccessibilityConfig) => {
      setConfig(newConfig)
    }

    accessibilityManager.on('configChanged', handleConfigChange)

    return () => {
      accessibilityManager.off('configChanged', handleConfigChange)
    }
  }, [])

  return {
    config,
    updateConfig: (newConfig: Partial<AccessibilityConfig>) => {
      accessibilityManager.updateConfig(newConfig)
    },
    announce: accessibilityUtils.announce,
    generateAriaLabel: accessibilityUtils.generateAriaLabel,
    generateChartDescription: accessibilityUtils.generateChartDescription
  }
}

// CSS classes for accessibility
export const accessibilityClasses = {
  // Screen reader only content
  srOnly: 'sr-only',
  
  // Focus management
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  
  // High contrast support
  highContrast: 'high-contrast',
  
  // Reduced motion
  reducedMotion: 'reduced-motion',
  
  // Color blind support
  colorBlindSupport: 'colorblind-support',
  
  // Font sizes
  fontSmall: 'font-small',
  fontMedium: 'font-medium',
  fontLarge: 'font-large',
  fontExtraLarge: 'font-extra-large'
}
