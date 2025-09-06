'use client'

import React, { useState, useEffect } from 'react'
import { serviceWorkerUtils } from '@/lib/service-worker'
import { PWAInstallPrompt, PWAStatus } from './PWAInstallPrompt'

interface MobilePWAProps {
  children: React.ReactNode
}

export function MobilePWA({ children }: MobilePWAProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [showMobileOptimizations, setShowMobileOptimizations] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }

    const checkPWA = () => {
      setIsPWA(serviceWorkerUtils.isPWA())
      setIsStandalone(serviceWorkerUtils.isStandalone())
    }

    checkMobile()
    checkPWA()

    // Show mobile optimizations for mobile users
    if (isMobile) {
      setShowMobileOptimizations(true)
    }
  }, [isMobile])

  // Add mobile-specific meta tags and viewport settings
  useEffect(() => {
    if (isMobile && typeof document !== 'undefined') {
      // Set viewport meta tag for mobile
      let viewport = document.querySelector('meta[name="viewport"]')
      if (!viewport) {
        viewport = document.createElement('meta')
        viewport.setAttribute('name', 'viewport')
        document.head.appendChild(viewport)
      }
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')

      // Add mobile-specific meta tags
      const mobileMetaTags = [
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'SplitSave' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#7c3aed' }
      ]

      mobileMetaTags.forEach(tag => {
        let meta = document.querySelector(`meta[name="${tag.name}"]`)
        if (!meta) {
          meta = document.createElement('meta')
          meta.setAttribute('name', tag.name)
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', tag.content)
      })

      // Add iOS-specific meta tags
      const iosMetaTags = [
        { name: 'apple-touch-fullscreen', content: 'yes' },
        { name: 'apple-mobile-web-app-orientations', content: 'portrait' }
      ]

      iosMetaTags.forEach(tag => {
        let meta = document.querySelector(`meta[name="${tag.name}"]`)
        if (!meta) {
          meta = document.createElement('meta')
          meta.setAttribute('name', tag.name)
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', tag.content)
      })
    }
  }, [isMobile])

  // Add mobile-specific CSS classes
  useEffect(() => {
    if (isMobile && typeof document !== 'undefined') {
      document.documentElement.classList.add('mobile-device')
      
      if (isStandalone) {
        document.documentElement.classList.add('pwa-standalone')
      }
      
      if (isPWA) {
        document.documentElement.classList.add('pwa-mode')
      }
    }
  }, [isMobile, isStandalone, isPWA])

  return (
    <>
      {children}
      
      {/* PWA Status Indicator */}
      <PWAStatus />
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
      
      {/* Mobile-specific optimizations */}
      {showMobileOptimizations && (
        <MobileOptimizations 
          isPWA={isPWA} 
          isStandalone={isStandalone} 
          isMobile={isMobile} 
        />
      )}
    </>
  )
}

interface MobileOptimizationsProps {
  isPWA: boolean
  isStandalone: boolean
  isMobile: boolean
}

function MobileOptimizations({ isPWA, isStandalone, isMobile }: MobileOptimizationsProps) {
  useEffect(() => {
    // Add mobile-specific event listeners
    const handleTouchStart = (e: TouchEvent) => {
      // Prevent zoom on double tap
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent pull-to-refresh on mobile
      if (e.touches.length === 1 && e.touches[0].clientY > 100) {
        e.preventDefault()
      }
    }

    // Add passive event listeners for better performance
    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  // Add mobile-specific styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.textContent = `
        /* Mobile-specific styles */
        .mobile-device {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          /* Ensure no white overlay */
          background: transparent !important;
        }
        
        .mobile-device input,
        .mobile-device textarea {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        /* PWA standalone mode styles */
        .pwa-standalone {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        /* Hide address bar in PWA mode */
        .pwa-standalone body {
          height: 100vh;
          height: -webkit-fill-available;
        }
        
        /* Mobile viewport fixes */
        @media screen and (max-width: 768px) {
          .mobile-device {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
          
          /* Ensure main content is visible */
          .mobile-device main {
            background: transparent !important;
            z-index: 1;
          }
          
          /* Fix any potential white overlays */
          .mobile-device > div {
            background: transparent !important;
          }
        }
        
        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .mobile-device {
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Ensure PWA components don't create white overlays */
        .pwa-mobile-navigation {
          background: transparent !important;
        }
        
        /* Fix any white background issues */
        .mobile-device .bg-white {
          background: transparent !important;
        }
      `
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  return null
}

// Hook to detect mobile and PWA status
export function useMobilePWA() {
  const [isMobile, setIsMobile] = useState(false)
  const [isPWA, setIsPWA] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
    }

    const checkPWA = () => {
      setIsPWA(serviceWorkerUtils.isPWA())
      setIsStandalone(serviceWorkerUtils.isStandalone())
    }

    checkMobile()
    checkPWA()
  }, [])

  return {
    isMobile,
    isPWA,
    isStandalone,
    isMobilePWA: isMobile && isPWA
  }
}
