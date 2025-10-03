'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function MobileRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Check if this is a mobile device
    const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    
    if (isMobile) {
      router.push('/mobile')
    }
  }, [router])

  return null
}
