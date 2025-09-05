import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-anon-key'

// Safari-specific Supabase client configuration
export const safariSupabase = (() => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Safari-specific auth configuration
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow for better Safari security
      
      // Safari-specific storage handling
      storage: typeof window !== 'undefined' ? {
        getItem: (key: string) => {
          try {
            return window.localStorage.getItem(key)
          } catch (error) {
            console.warn('🍎 Safari localStorage access failed:', error)
            return null
          }
        },
        setItem: (key: string, value: string) => {
          try {
            window.localStorage.setItem(key, value)
          } catch (error) {
            console.warn('🍎 Safari localStorage write failed:', error)
          }
        },
        removeItem: (key: string) => {
          try {
            window.localStorage.removeItem(key)
          } catch (error) {
            console.warn('🍎 Safari localStorage remove failed:', error)
          }
        }
      } : undefined,
      
      storageKey: 'splitsave-safari-auth-token',
      
      // Safari-specific settings
      debug: process.env.NODE_ENV === 'development',
      
      // Longer timeouts for Safari
      // Note: refreshTokenRetryAttempts and refreshTokenRetryDelay are not valid options in current Supabase version
    },
    
    // Safari-optimized realtime settings
    realtime: {
      params: {
        eventsPerSecond: 1 // Even fewer events for Safari
      }
    },
    
    // Safari-specific global settings
    global: {
      headers: {
        'X-Client-Info': 'safari-splitsave'
      }
    }
  })
})()
