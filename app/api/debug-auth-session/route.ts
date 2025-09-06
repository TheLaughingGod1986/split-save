import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Debug auth session - starting check')
    
    // Check client-side session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log('🔍 Client session:', { session: !!session, error: sessionError })
    
    if (sessionError) {
      return NextResponse.json({ 
        error: 'Session error', 
        details: sessionError.message 
      }, { status: 401 })
    }
    
    if (!session) {
      return NextResponse.json({ 
        error: 'No session found',
        message: 'User is not logged in'
      }, { status: 401 })
    }
    
    console.log('🔍 Session details:', {
      access_token: session.access_token ? 'Present' : 'Missing',
      refresh_token: session.refresh_token ? 'Present' : 'Missing',
      expires_at: session.expires_at,
      user_id: session.user?.id,
      user_email: session.user?.email
    })
    
    // Verify token with admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(session.access_token)
    console.log('🔍 Admin user verification:', { user: !!user, error: userError })
    
    if (userError) {
      return NextResponse.json({ 
        error: 'Token verification failed', 
        details: userError.message 
      }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ 
        error: 'No user found for token',
        message: 'Token is invalid'
      }, { status: 401 })
    }
    
    // Check if user exists in database
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', user.id)
      .single()
    
    console.log('🔍 Database user check:', { user: !!dbUser, error: dbError })
    
    return NextResponse.json({
      success: true,
      session: {
        has_session: true,
        access_token: session.access_token ? 'Present' : 'Missing',
        refresh_token: session.refresh_token ? 'Present' : 'Missing',
        expires_at: session.expires_at,
        expires_in: session.expires_at ? Math.max(0, session.expires_at - Math.floor(Date.now() / 1000)) : 0
      },
      user: {
        id: user.id,
        email: user.email,
        email_confirmed: user.email_confirmed_at ? true : false,
        created_at: user.created_at
      },
      database: {
        user_exists: !!dbUser,
        user_data: dbUser
      }
    })
    
  } catch (error) {
    console.error('❌ Debug auth session error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
