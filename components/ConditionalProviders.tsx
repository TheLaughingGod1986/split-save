'use client'

import { SimpleAuthProvider } from '@/components/auth/SimpleAuthProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { MobilePWA } from '@/components/pwa/MobilePWA'
import { useEffect, useState } from 'react'

export function ConditionalProviders({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Check if this is a mobile device
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
    }
    
    checkMobile()
    setMounted(true)
    
    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Show loading while checking
  if (!mounted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            marginBottom: '10px'
          }}>
            SplitSave
          </h1>
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // For mobile devices, render children directly without providers
  if (isMobile) {
    return <>{children}</>
  }

  // For desktop, wrap with all providers
  return (
    <SimpleAuthProvider>
      <ThemeProvider>
        <MobilePWA>
          {children}
        </MobilePWA>
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </SimpleAuthProvider>
  )
}
