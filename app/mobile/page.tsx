'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { MobileLandingPage } from '@/components/mobile/MobileLandingPage'
import { MobileLoadingFallback } from '@/components/mobile/MobileLoadingFallback'

export default function MobilePage() {
  const { user, loading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)
  const [authTimedOut, setAuthTimedOut] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAuthTimeout = useCallback(() => {
    setAuthTimedOut(true)
  }, [])

  useEffect(() => {
    if (authTimedOut) {
      return
    }

    // Increased timeout to 15 seconds for slow mobile networks
    const timer = setTimeout(() => {
      setAuthTimedOut(true)
    }, 15000)

    return () => clearTimeout(timer)
  }, [authTimedOut])

  if (!isMounted || (loading && !user && !authTimedOut)) {
    return (
      <MobileLoadingFallback
        onTimeout={handleAuthTimeout}
        timeoutMs={15000}
      />
    )
  }

  if (user) {
    return <SplitsaveApp />
  }

  return <MobileLandingPage />
}
