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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    setIsClient(true)

    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      setIsMobile(isMobileDevice)
      
      // Show mobile optimizations for mobile users
      if (isMobileDevice) {
        setShowMobileOptimizations(true)
      }
    }

    const checkPWA = () => {
      setIsPWA(serviceWorkerUtils.isPWA())
      setIsStandalone(serviceWorkerUtils.isStandalone())
    }

    checkMobile()
    checkPWA()
  }, []) // Remove dependencies to prevent infinite re-renders

  // Add mobile-specific meta tags and viewport settings
  useEffect(() => {
    if (isMobile && typeof window !== 'undefined' && typeof document !== 'undefined') {
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
      {/* Only render PWA components on client side */}
      {isClient && (
        <>
          <PWAStatus />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
        </>
      )}
      
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
    // Add mobile-specific event listeners (disabled to allow scrolling)
    const handleTouchStart = (e: TouchEvent) => {
      // Only prevent zoom on multi-touch, allow single touch scrolling
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    // Remove touchmove handler that was preventing scrolling
    // Allow natural scrolling behavior

    // Add passive event listeners for better performance
    document.addEventListener('touchstart', handleTouchStart, { passive: true })

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
    }
  }, [])

  // Add mobile-specific styles - SIMPLIFIED to prevent conflicts
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // SIMPLIFIED CSS injection - only essential fixes
      const immediateStyle = document.createElement('style')
      immediateStyle.id = 'mobile-immediate-fix'
      immediateStyle.textContent = `
        /* ESSENTIAL MOBILE FIX - Prevent white screen with proper dark mode support */
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        /* Mobile fixes that respect theme */
        @media screen and (max-width: 768px) {
          html, body {
            min-height: 100vh !important;
            min-height: 100dvh !important; /* Dynamic viewport height */
          }
          
          /* Only set background if no theme class exists */
          html:not(.dark), html:not(.dark) body {
            background: #f9fafb !important;
            background-color: #f9fafb !important;
          }
          
          /* Dark mode support */
          html.dark, html.dark body {
            background: #0f172a !important;
            background-color: #0f172a !important;
          }
        }
      `
      document.head.appendChild(immediateStyle)

      // Main mobile styles - SIMPLIFIED to prevent conflicts
      const style = document.createElement('style')
      style.id = 'mobile-main-styles'
      style.textContent = `
        /* Mobile-specific styles - MINIMAL VERSION */
        .mobile-device {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          /* Enable scrolling */
          overflow: auto !important;
          -webkit-overflow-scrolling: touch !important;
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
        
        /* Mobile viewport fixes - ONLY essential ones */
        @media screen and (max-width: 768px) {
          .mobile-device {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
          }
        }
        
        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .mobile-device {
            -webkit-overflow-scrolling: touch;
          }
        }
      `
      document.head.appendChild(style)

      return () => {
        const immediateStyleEl = document.getElementById('mobile-immediate-fix')
        const mainStyleEl = document.getElementById('mobile-main-styles')
        if (immediateStyleEl) document.head.removeChild(immediateStyleEl)
        if (mainStyleEl) document.head.removeChild(mainStyleEl)
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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return
    }

    setIsClient(true)

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
    isMobilePWA: isMobile && isPWA,
    isClient
  }
}
