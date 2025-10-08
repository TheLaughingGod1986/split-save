'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/SimpleAuthProvider'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { MobileLandingPage } from '@/components/mobile/MobileLandingPage'
import { MobileLoadingFallback } from '@/components/mobile/MobileLoadingFallback'

export default function MobilePage() {
  const { user, loading } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || loading) {
    return <MobileLoadingFallback />
  }

  if (user) {
    return <SplitsaveApp />
  }

  return <MobileLandingPage />
}
