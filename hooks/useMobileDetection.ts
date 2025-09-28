'use client'

import { useState, useEffect } from 'react'

interface MobileDetection {
  isMobile: boolean
  isSmallScreen: boolean
  isClient: boolean
  userAgent: string
  screenSize: string
  isIOS: boolean
  isMobileSafari: boolean
}

export function useMobileDetection(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>({
    isMobile: false,
    isSmallScreen: false,
    isClient: false,
    userAgent: '',
    screenSize: '',
    isIOS: false,
    isMobileSafari: false
  })

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const userAgent = navigator.userAgent
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isSmallScreen = window.innerWidth <= 768
    const screenSize = `${window.innerWidth}x${window.innerHeight}`
    
    // Additional iOS detection
    const isIOS =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent)
    const isMobileSafari = isSafari && isIOS
    
    console.log('🔍 Mobile Detection:', {
      userAgent: userAgent.substring(0, 100),
      isMobile,
      isSmallScreen,
      isIOS,
      isMobileSafari,
      screenSize,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints
    })

    setDetection({
      isMobile: isMobile || isSmallScreen,
      isSmallScreen,
      isClient: true,
      userAgent,
      screenSize,
      isIOS,
      isMobileSafari
    })

    // Listen for resize events
    const handleResize = () => {
      setDetection((prev) => {
        const nextIsSmallScreen = window.innerWidth <= 768
        return {
          ...prev,
          isSmallScreen: nextIsSmallScreen,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          isMobile: prev.isMobile || nextIsSmallScreen
        }
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return detection
}
