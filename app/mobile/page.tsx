'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    if (!loading) {
      setAuthTimedOut(false)
      return
    }

    const timer = setTimeout(() => {
      setAuthTimedOut(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [loading])

  if (!isMounted || (loading && !user && !authTimedOut)) {
    return (
      <MobileLoadingFallback
        onTimeout={() => setAuthTimedOut(true)}
        timeoutMs={4000}
      />
    )
  }

  if (user) {
    return <SplitsaveApp />
  }

  return <MobileLandingPage />
}
