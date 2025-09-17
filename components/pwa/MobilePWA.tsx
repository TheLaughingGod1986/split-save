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

  // Add mobile-specific styles - IMMEDIATE injection to prevent white screen
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // IMMEDIATE CSS injection to prevent white screen
      const immediateStyle = document.createElement('style')
      immediateStyle.id = 'mobile-immediate-fix'
      immediateStyle.textContent = `
        /* IMMEDIATE MOBILE FIX - Prevent white screen */
        html, body {
          background: #f9fafb !important;
          background-color: #f9fafb !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow-x: hidden !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        /* Force body to show content immediately */
        body > div {
          background: #f9fafb !important;
          min-height: 100vh !important;
        }
        
        /* Mobile device specific fixes */
        .mobile-device {
          background: #f9fafb !important;
          background-color: #f9fafb !important;
        }
        
        .mobile-device * {
          background-color: transparent !important;
        }
        
        .mobile-device .bg-white,
        .mobile-device .bg-gray-50,
        .mobile-device .bg-slate-50 {
          background: #f9fafb !important;
          background-color: #f9fafb !important;
        }
      `
      document.head.appendChild(immediateStyle)

      // Main mobile styles
      const style = document.createElement('style')
      style.id = 'mobile-main-styles'
      style.textContent = `
        /* Mobile-specific styles */
        .mobile-device {
          -webkit-touch-callout: none;
          /* Allow text selection for inputs and textareas */
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          /* Ensure no white overlay */
          background: #f9fafb !important;
          background-color: #f9fafb !important;
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
            background: #f9fafb !important;
            background-color: #f9fafb !important;
          }
          
          /* Ensure main content is visible */
          .mobile-device main {
            background: #f9fafb !important;
            background-color: #f9fafb !important;
            z-index: 1;
          }
          
          /* Fix any potential white overlays */
          .mobile-device > div {
            background: #f9fafb !important;
            background-color: #f9fafb !important;
          }
          
          /* Force all containers to have proper background */
          .mobile-device .min-h-screen {
            background: #f9fafb !important;
            background-color: #f9fafb !important;
          }
        }
        
        /* iOS specific fixes */
        @supports (-webkit-touch-callout: none) {
          .mobile-device {
            -webkit-overflow-scrolling: touch;
            background: #f9fafb !important;
            background-color: #f9fafb !important;
          }
        }
        
        /* Ensure PWA components don't create white overlays */
        .pwa-mobile-navigation {
          background: transparent !important;
        }
        
        /* Fix any white background issues */
        .mobile-device .bg-white {
          background: #f9fafb !important;
          background-color: #f9fafb !important;
        }
        
        /* Ensure body and html allow scrolling */
        .mobile-device body,
        .mobile-device html {
          overflow: auto !important;
          -webkit-overflow-scrolling: touch !important;
          height: auto !important;
          min-height: 100vh !important;
          background: #f9fafb !important;
          background-color: #f9fafb !important;
        }
        
        /* Fix any fixed positioning issues */
        .mobile-device .fixed {
          position: fixed !important;
        }
        
        /* Ensure main content is scrollable */
        .mobile-device main {
          overflow: visible !important;
          height: auto !important;
          min-height: calc(100vh - 120px) !important;
          background: #f9fafb !important;
          background-color: #f9fafb !important;
        }
        
        /* Force loading screens to have proper background */
        .mobile-device .bg-gradient-to-br {
          background: #f9fafb !important;
          background-color: #f9fafb !important;
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
