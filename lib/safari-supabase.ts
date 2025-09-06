import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example-anon-key'

// Use global variables to persist across hot reloads
declare global {
  var __safariSupabaseClient: SupabaseClient | undefined
}

// TEMPORARY FIX: Return the regular client to prevent dual instances
export const safariSupabase = (() => {
  // Import the regular client instead of creating a new one
  const { supabase } = require('./supabase')
  return supabase
})()
