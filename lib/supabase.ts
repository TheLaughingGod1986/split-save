import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-anon-key'

// Use global variables to persist across hot reloads
declare global {
  var __supabaseClient: SupabaseClient | undefined
  var __supabaseAdminClient: SupabaseClient | undefined
}

// Singleton pattern to prevent multiple client instances
export const supabase = (() => {
  if (!global.__supabaseClient) {
    global.__supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return global.__supabaseClient
})()

// Server-side Supabase client with service role key
export const supabaseAdmin = (() => {
  if (!global.__supabaseAdminClient) {
    global.__supabaseAdminClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'example-service-role-key'
    )
  }
  return global.__supabaseAdminClient
})()
