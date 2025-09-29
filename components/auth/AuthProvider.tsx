'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { toast } from '@/lib/toast'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}>({ 
  user: null, 
  loading: true,
  signOut: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Detect mobile for debugging (only on client side)
    let isMobile = false
    if (typeof window !== 'undefined') {
      isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent)
      const isSmallScreen = window.innerWidth <= 768
      
      console.log('🔍 AuthProvider: Mobile detection', {
        isMobile,
        isSmallScreen,
        userAgent: navigator.userAgent,
        windowWidth: window.innerWidth
      })
    }
    
    // Immediate failsafe timeout to prevent infinite loading
    const immediateFailsafe = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ AuthProvider immediate failsafe: forcing loading to false')
        setLoading(false)
      }
    }, 1000) // Very short timeout to prevent long loading
    
    // Get initial session with timeout (very short timeout to prevent long loading)
    const sessionPromise = supabase.auth.getSession()
    const timeoutDuration = isMobile ? 500 : 300 // Very short timeout to prevent long loading
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), timeoutDuration)
    )
    
    console.log('🔍 AuthProvider: Starting session check', { 
      timeoutDuration, 
      isMobile,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL 
    })
    
    Promise.race([sessionPromise, timeoutPromise])
      .then(({ data: { session } }: any) => {
        console.log('✅ AuthProvider: Session check successful', { hasUser: !!session?.user })
        if (mounted) {
          clearTimeout(immediateFailsafe)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.warn('❌ AuthProvider: Session check failed', error)
        if (mounted) {
          clearTimeout(immediateFailsafe)
          setUser(null)
          setLoading(false)
        }
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔍 AuthProvider: Auth state change', { event, hasUser: !!session?.user })
        if (mounted) {
          clearTimeout(immediateFailsafe)
          if (event === 'SIGNED_IN' && session?.user) {
            // Welcome message is shown in LoadingScreen, no need for duplicate toast
          } else if (event === 'SIGNED_OUT') {
            toast.info('You have been signed out')
          }
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    // Additional failsafe: force loading to false after shorter time
    const failsafeTimeout = setTimeout(() => {
      if (mounted) {
        console.log('⚠️ AuthProvider failsafe: forcing loading to false', { isMobile })
        setLoading(false)
      }
    }, isMobile ? 3000 : 5000) // Shorter failsafe

    return () => {
      mounted = false
      subscription.unsubscribe()
      clearTimeout(immediateFailsafe)
      clearTimeout(failsafeTimeout)
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
