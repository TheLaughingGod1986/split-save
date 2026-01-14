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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let failsafeTimer: ReturnType<typeof setTimeout> | null = null

    // Simple session check with longer timeout for mobile networks
    const checkSession = async () => {
      try {
        setLoading(true)

        // Longer failsafe for slow mobile networks (10 seconds)
        failsafeTimer = setTimeout(() => {
          if (mounted) {
            console.warn('Auth check taking too long, forcing loading to false')
            setLoading(false)
          }
        }, 10000)

        // Direct session check without race condition - wait for actual result
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.log('Auth check error:', error)
          // Continue without authentication
        } else if (mounted && session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.log('Auth check failed:', error)
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
