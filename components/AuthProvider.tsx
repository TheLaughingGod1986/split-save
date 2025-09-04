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
    
    // Get initial session with timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session timeout')), 5000)
    )
    
    Promise.race([sessionPromise, timeoutPromise])
      .then(({ data: { session } }: any) => {
        if (mounted) {
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })
      .catch((error) => {
        console.warn('Auth session check failed:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
        }
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
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

    // Failsafe: force loading to false after 10 seconds
    const failsafeTimeout = setTimeout(() => {
      if (mounted) {
        console.log('AuthProvider failsafe: forcing loading to false')
        setLoading(false)
      }
    }, 10000)

    return () => {
      mounted = false
      subscription.unsubscribe()
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
