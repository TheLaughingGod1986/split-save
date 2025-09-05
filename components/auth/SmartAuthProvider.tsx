'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthProvider } from './AuthProvider'
import { SafariAuthProvider } from './SafariAuthProvider'
import type { User } from '@supabase/supabase-js'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}>({ 
  user: null, 
  loading: true,
  signOut: async () => {}
})

export function SmartAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSafari, setIsSafari] = useState<boolean | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    setIsClient(true)
    
    // Detect Safari specifically (including iPhone Safari)
    const userAgent = navigator.userAgent
    const isSafariBrowser = /safari/i.test(userAgent) && !/chrome/i.test(userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)
    
    console.log('🍎 SmartAuthProvider: Browser detection', {
      userAgent: userAgent.substring(0, 100),
      isSafari: isSafariBrowser,
      isIOS,
      shouldUseSafariProvider: isSafariBrowser || isIOS
    })
    
    setIsSafari(isSafariBrowser || isIOS)
  }, [])

  // Show loading while detecting browser
  if (!isClient || isSafari === null) {
    return (
      <AuthContext.Provider value={{ user: null, loading: true, signOut: async () => {} }}>
        {children}
      </AuthContext.Provider>
    )
  }

  // Use Safari-specific provider for Safari browsers (including iPhone Safari)
  if (isSafari) {
    console.log('🍎 SmartAuthProvider: Using SafariAuthProvider')
    return <SafariAuthProvider>{children}</SafariAuthProvider>
  }

  // Use regular provider for other browsers
  console.log('🌐 SmartAuthProvider: Using regular AuthProvider')
  return <AuthProvider>{children}</AuthProvider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SmartAuthProvider')
  }
  return context
}
