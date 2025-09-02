'use client'

import React from 'react'

/**
 * Mobile Optimization Utilities
 * Provides utilities for mobile-specific optimizations and responsive design
 */

export interface MobileOptimizationConfig {
  enableTouchOptimizations: boolean
  enableSwipeGestures: boolean
  enableHapticFeedback: boolean
  enableReducedMotion: boolean
  enableBatteryOptimizations: boolean
}

export class MobileOptimizationManager {
  private config: MobileOptimizationConfig
  private isMobile: boolean = false
  private isTouchDevice: boolean = false
  private supportsHaptics: boolean = false

  constructor(config: Partial<MobileOptimizationConfig> = {}) {
    this.config = {
      enableTouchOptimizations: true,
      enableSwipeGestures: true,
      enableHapticFeedback: true,
      enableReducedMotion: true,
      enableBatteryOptimizations: true,
      ...config
    }

    this.initialize()
  }

  private initialize() {
    if (typeof window === 'undefined') return

    this.isMobile = this.detectMobile()
    this.isTouchDevice = this.detectTouchDevice()
    this.supportsHaptics = this.detectHapticSupport()

    this.applyOptimizations()
  }

  /**
   * Detect if device is mobile
   */
  private detectMobile(): boolean {
    if (typeof window === 'undefined') return false

    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768 ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0)
    )
  }

  /**
   * Detect if device supports touch
   */
  private detectTouchDevice(): boolean {
    if (typeof window === 'undefined') return false

    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    )
  }

  /**
   * Detect if device supports haptic feedback
   */
  private detectHapticSupport(): boolean {
    if (typeof window === 'undefined') return false

    return (
      'vibrate' in navigator ||
      // @ts-ignore
      'webkitVibrate' in navigator
    )
  }

  /**
   * Apply mobile optimizations
   */
  private applyOptimizations() {
    if (typeof window === 'undefined') return

    // Apply touch optimizations
    if (this.config.enableTouchOptimizations && this.isTouchDevice) {
      this.applyTouchOptimizations()
    }

    // Apply reduced motion preferences
    if (this.config.enableReducedMotion) {
      this.applyReducedMotion()
    }

    // Apply battery optimizations
    if (this.config.enableBatteryOptimizations) {
      this.applyBatteryOptimizations()
    }
  }

  /**
   * Apply touch-specific optimizations
   */
  private applyTouchOptimizations() {
    // Add touch-friendly CSS classes
    document.documentElement.classList.add('touch-device')

    // Optimize touch targets
    const style = document.createElement('style')
    style.textContent = `
      .touch-device button,
      .touch-device .clickable {
        min-height: 44px;
        min-width: 44px;
      }
      
      .touch-device input,
      .touch-device textarea,
      .touch-device select {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      .touch-device .swipeable {
        touch-action: pan-x pan-y;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Apply reduced motion preferences
   */
  private applyReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion')
      
      const style = document.createElement('style')
      style.textContent = `
        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `
      document.head.appendChild(style)
    }
  }

  /**
   * Apply battery optimizations
   */
  private applyBatteryOptimizations() {
    // Reduce animations when battery is low
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          document.documentElement.classList.add('low-battery')
        }

        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            document.documentElement.classList.add('low-battery')
          } else {
            document.documentElement.classList.remove('low-battery')
          }
        })
      })
    }

    // Optimize for low-power mode
    if ('connection' in navigator) {
      // @ts-ignore
      const connection = navigator.connection as any
      if (connection && connection.effectiveType === 'slow-2g') {
        document.documentElement.classList.add('slow-connection')
      }
    }
  }

  /**
   * Provide haptic feedback
   */
  public vibrate(pattern: number | number[] = 50): void {
    if (!this.config.enableHapticFeedback || !this.supportsHaptics) return

    try {
      navigator.vibrate(pattern)
    } catch (error) {
      console.warn('Haptic feedback not supported:', error)
    }
  }

  /**
   * Get device information
   */
  public getDeviceInfo() {
    return {
      isMobile: this.isMobile,
      isTouchDevice: this.isTouchDevice,
      supportsHaptics: this.supportsHaptics,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      screenHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1
    }
  }

  /**
   * Check if device is mobile
   */
  public isMobileDevice(): boolean {
    return this.isMobile
  }

  /**
   * Check if device supports touch
   */
  public isTouchDeviceSupported(): boolean {
    return this.isTouchDevice
  }

  /**
   * Check if device supports haptics
   */
  public supportsHapticFeedback(): boolean {
    return this.supportsHaptics
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<MobileOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig }
    this.applyOptimizations()
  }
}

// Create global instance
export const mobileOptimization = new MobileOptimizationManager()

// Utility functions
export const mobileUtils = {
  /**
   * Check if device is mobile
   */
  isMobile(): boolean {
    return mobileOptimization.isMobileDevice()
  },

  /**
   * Check if device supports touch
   */
  isTouch(): boolean {
    return mobileOptimization.isTouchDeviceSupported()
  },

  /**
   * Get optimal touch target size
   */
  getTouchTargetSize(): number {
    return mobileOptimization.isMobileDevice() ? 44 : 32
  },

  /**
   * Get optimal font size for mobile
   */
  getOptimalFontSize(baseSize: number = 16): number {
    return mobileOptimization.isMobileDevice() ? Math.max(baseSize, 16) : baseSize
  },

  /**
   * Check if device prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  /**
   * Get device pixel ratio
   */
  getPixelRatio(): number {
    if (typeof window === 'undefined') return 1
    return window.devicePixelRatio || 1
  },

  /**
   * Check if device is in landscape mode
   */
  isLandscape(): boolean {
    if (typeof window === 'undefined') return false
    return window.innerWidth > window.innerHeight
  },

  /**
   * Get viewport dimensions
   */
  getViewportDimensions(): { width: number; height: number } {
    if (typeof window === 'undefined') return { width: 0, height: 0 }
    return {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
}

// React hook for mobile optimization
export function useMobileOptimization() {
  const [deviceInfo, setDeviceInfo] = React.useState(mobileOptimization.getDeviceInfo())

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(mobileOptimization.getDeviceInfo())
    }

    window.addEventListener('resize', updateDeviceInfo)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return {
    ...deviceInfo,
    vibrate: mobileOptimization.vibrate.bind(mobileOptimization),
    isMobile: mobileOptimization.isMobileDevice(),
    isTouch: mobileOptimization.isTouchDeviceSupported(),
    supportsHaptics: mobileOptimization.supportsHapticFeedback()
  }
}
