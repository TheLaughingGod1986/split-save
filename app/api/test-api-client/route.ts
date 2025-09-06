import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Test API client - starting check')
    
    // Test 1: Check if we can get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🔍 Test 1 - Session check:', { 
      hasSession: !!session, 
      error: sessionError?.message,
      accessToken: session?.access_token ? 'Present' : 'Missing'
    })
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        message: 'User needs to log in first'
      }, { status: 401 })
    }
    
    // Test 2: Check if we can make an authenticated request
    const authHeader = req.headers.get('authorization')
    console.log('🔍 Test 2 - Auth header:', authHeader ? 'Present' : 'Missing')
    
    // Test 3: Try to get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log('🔍 Test 3 - User check:', { 
      hasUser: !!user, 
      error: userError?.message,
      userId: user?.id,
      userEmail: user?.email
    })
    
    return NextResponse.json({
      success: true,
      tests: {
        session_check: {
          passed: !!session,
          has_access_token: !!session?.access_token,
          expires_at: session?.expires_at
        },
        auth_header: {
          passed: !!authHeader,
          header: authHeader ? 'Present' : 'Missing'
        },
        user_check: {
          passed: !!user,
          user_id: user?.id,
          user_email: user?.email
        }
      },
      session: {
        access_token: session.access_token ? 'Present' : 'Missing',
        refresh_token: session.refresh_token ? 'Present' : 'Missing',
        expires_at: session.expires_at,
        expires_in: session.expires_at ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000)) : 0
      }
    })
    
  } catch (error) {
    console.error('❌ Test API client error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
