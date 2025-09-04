'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { safariSupabase as supabase } from '@/lib/safari-supabase'
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

export function SafariAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    let mounted = true
    
    // Detect Safari specifically
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent
      const isSafariBrowser = /safari/i.test(userAgent) && !/chrome/i.test(userAgent)
      setIsSafari(isSafariBrowser)
      
      console.log('🍎 SafariAuthProvider: Safari detection', {
        isSafari: isSafariBrowser,
        userAgent: userAgent.substring(0, 100)
      })
    }
    
    // Safari-specific authentication flow
    const initializeAuth = async () => {
      try {
        console.log('🍎 SafariAuthProvider: Starting Safari-specific auth flow')
        
        // For Safari, we need to be more careful with localStorage access
        let session = null
        
        try {
          // Check if localStorage is available (Safari private mode might block this)
          if (typeof window !== 'undefined' && window.localStorage) {
            const storedSession = localStorage.getItem('sb-splitsave-auth-token')
            if (storedSession) {
              console.log('🍎 SafariAuthProvider: Found stored session')
            }
          }
        } catch (error) {
          console.warn('🍎 SafariAuthProvider: localStorage access failed (private mode?)', error)
        }
        
        // Get session with Safari-optimized timeout
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Safari session timeout')), 8000) // Longer timeout for Safari
        )
        
        const result = await Promise.race([sessionPromise, timeoutPromise]) as any
        session = result.data.session
        
        console.log('🍎 SafariAuthProvider: Session result', { 
          hasSession: !!session,
          hasUser: !!session?.user 
        })
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
        
      } catch (error) {
        console.warn('🍎 SafariAuthProvider: Auth initialization failed', error)
        
        // Safari fallback: try to get user without session
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (mounted) {
            setUser(currentUser)
            setLoading(false)
          }
        } catch (userError) {
          console.warn('🍎 SafariAuthProvider: User fetch also failed', userError)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
        }
      }
    }
    
    // Safari-specific auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🍎 SafariAuthProvider: Auth state change', { event, hasSession: !!session })
        
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
        
        // Handle Safari-specific auth events
        if (event === 'SIGNED_OUT') {
          try {
            // Clear Safari-specific storage
            if (typeof window !== 'undefined' && window.localStorage) {
              localStorage.removeItem('sb-splitsave-auth-token')
              localStorage.removeItem('splitsave-auth-token')
            }
          } catch (error) {
            console.warn('🍎 SafariAuthProvider: Failed to clear storage', error)
          }
        }
      }
    )
    
    // Initialize auth
    initializeAuth()
    
    // Safari-specific cleanup
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])
  
  const signOut = async () => {
    try {
      console.log('🍎 SafariAuthProvider: Signing out')
      await supabase.auth.signOut()
      
      // Safari-specific cleanup
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.removeItem('sb-splitsave-auth-token')
          localStorage.removeItem('splitsave-auth-token')
        }
      } catch (error) {
        console.warn('🍎 SafariAuthProvider: Failed to clear storage on signout', error)
      }
      
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('🍎 SafariAuthProvider: Sign out error', error)
      toast.error('Failed to sign out')
    }
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SafariAuthProvider')
  }
  return context
}
