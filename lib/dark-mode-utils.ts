'use client'

import React from 'react'

/**
 * Dark Mode Utilities
 * Provides utilities for consistent dark mode implementation
 */

export interface DarkModeConfig {
  enableSystemPreference: boolean
  defaultMode: 'light' | 'dark' | 'system'
  storageKey: string
  enableTransitions: boolean
}

export class DarkModeManager {
  private config: DarkModeConfig
  private currentMode: 'light' | 'dark' | 'system' = 'light'
  private actualMode: 'light' | 'dark' = 'light'
  private systemPreference: 'light' | 'dark' = 'light'
  private listeners: Set<(mode: 'light' | 'dark') => void> = new Set()

  constructor(config: Partial<DarkModeConfig> = {}) {
    this.config = {
      enableSystemPreference: true,
      defaultMode: 'system',
      storageKey: 'splitsave-theme',
      enableTransitions: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    // Get system preference
    this.systemPreference = this.getSystemPreference()

    // Get stored preference
    const stored = localStorage.getItem(this.config.storageKey)
    const initialMode = stored || this.config.defaultMode

    // Set initial mode
    this.setModeInternal(initialMode as 'light' | 'dark' | 'system')

    // Listen for system preference changes
    if (this.config.enableSystemPreference && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = (event: MediaQueryListEvent) => {
        this.systemPreference = event.matches ? 'dark' : 'light'
        if (this.currentMode === 'system') {
          this.actualMode = this.systemPreference
          this.applyMode(this.systemPreference)
          this.notifyListeners(this.systemPreference)
        }
      }

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', listener)
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(listener)
      } else {
        console.warn('⚠️ DarkModeManager: MediaQueryList change listener not supported')
      }
    }
  }

  private getSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'light'
    }

    try {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch (error) {
      console.warn('⚠️ DarkModeManager: system preference detection failed', error)
      return 'light'
    }
  }

  private setModeInternal(mode: 'light' | 'dark' | 'system') {
    const actualMode = mode === 'system' ? this.systemPreference : mode
    this.currentMode = mode
    this.actualMode = actualMode
    this.applyMode(actualMode)
    localStorage.setItem(this.config.storageKey, mode)
    this.notifyListeners(actualMode)
  }

  private applyMode(mode: 'light' | 'dark') {
    const root = document.documentElement
    
    if (this.config.enableTransitions) {
      root.style.transition = 'background-color 0.3s ease, color 0.3s ease'
    }

    if (mode === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Update meta theme-color
    this.updateMetaThemeColor(mode)
  }

  private updateMetaThemeColor(mode: 'light' | 'dark') {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'dark' ? '#1f2937' : '#ffffff')
    }
  }

  private notifyListeners(mode: 'light' | 'dark') {
    this.listeners.forEach(listener => listener(mode))
  }

  /**
   * Toggle between light and dark mode
   */
  public toggle(): void {
    const newMode = this.actualMode === 'light' ? 'dark' : 'light'
    this.setModeInternal(newMode)
  }

  /**
   * Set specific mode
   */
  public setMode(mode: 'light' | 'dark' | 'system'): void {
    this.setModeInternal(mode)
  }

  /**
   * Get current mode
   */
  public getMode(): 'light' | 'dark' {
    return this.actualMode
  }

  /**
   * Check if dark mode is active
   */
  public isDark(): boolean {
    return this.actualMode === 'dark'
  }

  /**
   * Check if light mode is active
   */
  public isLight(): boolean {
    return this.actualMode === 'light'
  }

  /**
   * Add mode change listener
   */
  public addListener(listener: (mode: 'light' | 'dark') => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<DarkModeConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

// Create global instance
export const darkModeManager = new DarkModeManager()

// Utility functions for consistent dark mode classes
export const darkModeUtils = {
  /**
   * Get consistent background classes
   */
  getBackgroundClasses(light: string, dark: string): string {
    return `${light} dark:${dark}`
  },

  /**
   * Get consistent text classes
   */
  getTextClasses(light: string, dark: string): string {
    return `${light} dark:${dark}`
  },

  /**
   * Get consistent border classes
   */
  getBorderClasses(light: string, dark: string): string {
    return `${light} dark:${dark}`
  },

  /**
   * Get consistent shadow classes
   */
  getShadowClasses(light: string, dark: string): string {
    return `${light} dark:${dark}`
  },

  /**
   * Get common background classes
   */
  getCommonBackgrounds: {
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-gray-50 dark:bg-gray-900',
    tertiary: 'bg-gray-100 dark:bg-gray-700',
    card: 'bg-white dark:bg-gray-800',
    modal: 'bg-white dark:bg-gray-800',
    overlay: 'bg-black/50 dark:bg-black/70'
  },

  /**
   * Get common text classes
   */
  getCommonText: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    tertiary: 'text-gray-500 dark:text-gray-400',
    muted: 'text-gray-400 dark:text-gray-500',
    accent: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400'
  },

  /**
   * Get common border classes
   */
  getCommonBorders: {
    default: 'border-gray-200 dark:border-gray-700',
    light: 'border-gray-100 dark:border-gray-800',
    medium: 'border-gray-300 dark:border-gray-600',
    strong: 'border-gray-400 dark:border-gray-500'
  },

  /**
   * Get common shadow classes
   */
  getCommonShadows: {
    sm: 'shadow-sm dark:shadow-gray-900/20',
    md: 'shadow-md dark:shadow-gray-900/30',
    lg: 'shadow-lg dark:shadow-gray-900/40',
    xl: 'shadow-xl dark:shadow-gray-900/50'
  }
}

// React hook for dark mode
export function useDarkMode() {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    setMode(darkModeManager.getMode())
    
    const unsubscribe = darkModeManager.addListener(setMode)
    return unsubscribe
  }, [])

  return {
    mode,
    isDark: mode === 'dark',
    isLight: mode === 'light',
    toggle: () => darkModeManager.toggle(),
    setMode: (newMode: 'light' | 'dark' | 'system') => darkModeManager.setMode(newMode)
  }
}

// Component for consistent dark mode styling
export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const { mode } = useDarkMode()

  React.useEffect(() => {
    // Apply global dark mode styles
    const style = document.createElement('style')
    style.textContent = `
      :root {
        --color-bg-primary: ${mode === 'dark' ? '#1f2937' : '#ffffff'};
        --color-bg-secondary: ${mode === 'dark' ? '#111827' : '#f9fafb'};
        --color-text-primary: ${mode === 'dark' ? '#ffffff' : '#111827'};
        --color-text-secondary: ${mode === 'dark' ? '#d1d5db' : '#6b7280'};
        --color-border: ${mode === 'dark' ? '#374151' : '#e5e7eb'};
      }
      
      .dark-mode-transition {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [mode])

  return React.createElement(React.Fragment, null, children)
}

// Utility for checking dark mode consistency
export function checkDarkModeConsistency() {
  if (typeof window === 'undefined') return { issues: [], score: 100 }

  const issues: string[] = []
  let score = 100

  // Check for elements without dark mode classes
  const elementsWithoutDarkMode = document.querySelectorAll('[class*="bg-white"]:not([class*="dark:bg-"])')
  if (elementsWithoutDarkMode.length > 0) {
    issues.push(`${elementsWithoutDarkMode.length} elements with bg-white but no dark mode equivalent`)
    score -= elementsWithoutDarkMode.length * 2
  }

  // Check for elements without dark mode text classes
  const textElementsWithoutDarkMode = document.querySelectorAll('[class*="text-gray-900"]:not([class*="dark:text-"])')
  if (textElementsWithoutDarkMode.length > 0) {
    issues.push(`${textElementsWithoutDarkMode.length} text elements without dark mode equivalent`)
    score -= textElementsWithoutDarkMode.length * 1
  }

  // Check for elements without dark mode border classes
  const borderElementsWithoutDarkMode = document.querySelectorAll('[class*="border-gray-200"]:not([class*="dark:border-"])')
  if (borderElementsWithoutDarkMode.length > 0) {
    issues.push(`${borderElementsWithoutDarkMode.length} border elements without dark mode equivalent`)
    score -= borderElementsWithoutDarkMode.length * 1
  }

  return {
    issues,
    score: Math.max(0, score),
    totalElements: document.querySelectorAll('*').length,
    elementsWithDarkMode: document.querySelectorAll('[class*="dark:"]').length
  }
}
