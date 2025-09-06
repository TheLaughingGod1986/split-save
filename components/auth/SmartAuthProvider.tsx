'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthProvider } from './AuthProvider'
// import { SafariAuthProvider } from './SafariAuthProvider' // TEMPORARILY DISABLED
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
    
    // TEMPORARY FIX: Force use of regular auth provider to avoid dual clients
    const forceRegularProvider = true
    
    // Always log browser detection for debugging
    console.log('🍎 SmartAuthProvider: Browser detection', {
      userAgent: userAgent.substring(0, 100),
      isSafari: isSafariBrowser,
      isIOS,
      shouldUseSafariProvider: isSafariBrowser || isIOS,
      isChrome: /chrome/i.test(userAgent),
      forceRegularProvider
    })
    
    // TEMPORARY FIX: Always use regular provider to avoid dual clients
    setIsSafari(false)
  }, [])

  // Show loading while detecting browser, but don't hide children
  if (!isClient || isSafari === null) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 SmartAuthProvider: Still detecting browser', { isClient, isSafari })
    }
    return (
      <AuthContext.Provider value={{ user: null, loading: true, signOut: async () => {} }}>
        {children}
      </AuthContext.Provider>
    )
  }

  // TEMPORARY FIX: Always use regular provider to completely eliminate Safari client
  console.log('🌐 SmartAuthProvider: FORCING regular AuthProvider (Safari detection disabled)')
  return <AuthProvider>{children}</AuthProvider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SmartAuthProvider')
  }
  return context
}
