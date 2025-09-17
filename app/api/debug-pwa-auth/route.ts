import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get user agent and other PWA-specific info
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const referer = request.headers.get('referer') || 'Unknown'
    const origin = request.headers.get('origin') || 'Unknown'
    
    // Check if this is a PWA request
    const isPWARequest = userAgent.includes('Mobile') || referer.includes('standalone')
    
    // Try to get session info (this won't work server-side but helps debug)
    let sessionInfo = 'Cannot check session server-side'
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAgent,
      referer,
      origin,
      isPWARequest,
      sessionInfo,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
      headers: {
        'user-agent': userAgent,
        'referer': referer,
        'origin': origin,
        'sec-fetch-site': request.headers.get('sec-fetch-site'),
        'sec-fetch-mode': request.headers.get('sec-fetch-mode'),
        'sec-fetch-dest': request.headers.get('sec-fetch-dest')
      }
    }
    
    return NextResponse.json(debugInfo, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Debug PWA Auth error:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
