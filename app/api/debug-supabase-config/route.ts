import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG SUPABASE CONFIG ===')
    
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***SET***' : 'NOT_SET',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '***SET***' : 'NOT_SET',
      nodeEnv: process.env.NODE_ENV,
      appUrl: process.env.NEXT_PUBLIC_APP_URL
    }

    console.log('Supabase config:', config)

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        supabaseUrl: config.supabaseUrl,
        supabaseAnonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        serviceRoleKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      }
    })

  } catch (error: any) {
    console.error('Unexpected error in debug config:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
