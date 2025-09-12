import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Use global variables to persist across hot reloads
declare global {
  var __supabaseClient: SupabaseClient | undefined
  var __supabaseAdminClient: SupabaseClient | undefined
}

// Check if we have valid Supabase configuration
const hasValidConfig = supabaseUrl !== 'https://placeholder.supabase.co' && 
                      supabaseAnonKey !== 'placeholder-anon-key'

// Singleton pattern to prevent multiple client instances
export const supabase = (() => {
  if (!global.__supabaseClient) {
    // If we don't have valid config, create a mock client that handles errors gracefully
    if (!hasValidConfig) {
      console.warn('⚠️ Supabase not configured - using mock client for development')
      global.__supabaseClient = createClient('https://mock.supabase.co', 'mock-key', {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        }
      })
    } else {
      global.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          // Mobile-specific auth configuration
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce', // Use PKCE flow for better mobile security
          // Shorter timeout for mobile
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'splitsave-auth-token',
          // Mobile-optimized settings
          debug: false // Disable debug logging to reduce console noise
        },
        // Mobile-optimized realtime settings
        realtime: {
          params: {
            eventsPerSecond: 2 // Reduce events for mobile
          }
        }
      })
    }
    
    // Add global error handler for auth errors (only for real clients)
    if (hasValidConfig) {
      global.__supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('🔍 Token refresh failed, clearing session')
          // Clear invalid session
          if (typeof window !== 'undefined') {
            localStorage.removeItem('splitsave-auth-token')
          }
        }
      })
    }
  }
  return global.__supabaseClient
})()

// Server-side Supabase client with service role key
export const supabaseAdmin = (() => {
  if (!global.__supabaseAdminClient) {
    if (!hasValidConfig) {
      console.warn('⚠️ Supabase admin not configured - using mock client for development')
      global.__supabaseAdminClient = createClient('https://mock.supabase.co', 'mock-admin-key')
    } else {
      global.__supabaseAdminClient = createClient(
        supabaseUrl,
        process.env.SUPABASE_SERVICE_ROLE_KEY || 'example-service-role-key'
      )
    }
  }
  return global.__supabaseAdminClient
})()
