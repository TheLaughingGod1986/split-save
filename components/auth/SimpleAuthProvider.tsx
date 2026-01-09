'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}>({ 
  user: null, 
  loading: false,
  signOut: async () => {}
})

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    let failsafeTimer: ReturnType<typeof setTimeout> | null = null

    // Simple session check with immediate timeout
    const checkSession = async () => {
      try {
        setLoading(true)
        failsafeTimer = setTimeout(() => {
          if (mounted) {
            console.warn('Auth check taking too long, forcing loading to false')
            setLoading(false)
          }
        }, 2000)
        
        // Very short timeout to prevent hanging
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 1000)
        )
        
        const sessionPromise = supabase.auth.getSession()
        
        const result = await Promise.race([sessionPromise, timeoutPromise])
        
        if (mounted && result && result.data?.session?.user) {
          setUser(result.data.session.user)
        }
      } catch (error) {
        console.log('Auth check failed or timed out:', error)
        // Continue without authentication
      } finally {
        if (mounted) {
          if (failsafeTimer) {
            clearTimeout(failsafeTimer)
            failsafeTimer = null
          }
          setLoading(false)
        }
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      if (failsafeTimer) {
        clearTimeout(failsafeTimer)
      }
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
