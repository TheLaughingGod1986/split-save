import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const debugSteps = []

    // Step 1: Test Supabase client configuration
    debugSteps.push({
      step: 1,
      name: 'Supabase Client Check',
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    })

    // Step 2: Test authentication
    let authResult = null
    let authError = null
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      authResult = {
        hasUser: !!data.user,
        hasSession: !!data.session,
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: !!data.user?.email_confirmed_at
      }
      authError = error?.message
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Unknown auth error'
    }

    debugSteps.push({
      step: 2,
      name: 'Authentication Test',
      success: !!authResult?.hasUser,
      result: authResult,
      error: authError
    })

    // Step 3: Check if user exists in public.users
    let publicUserExists = false
    let publicUserError = null
    if (authResult?.userId) {
      try {
        const { data: publicUser, error } = await supabaseAdmin
          .from('users')
          .select('id, email, name')
          .eq('id', authResult.userId)
          .single()
        
        publicUserExists = !!publicUser
        publicUserError = error?.message
      } catch (error) {
        publicUserError = error instanceof Error ? error.message : 'Unknown public user error'
      }
    }

    debugSteps.push({
      step: 3,
      name: 'Public User Check',
      exists: publicUserExists,
      error: publicUserError
    })

    // Step 4: Check user profile
    let profileExists = false
    let profileError = null
    if (authResult?.userId) {
      try {
        const { data: profile, error } = await supabaseAdmin
          .from('user_profiles')
          .select('user_id, currency, country_code')
          .eq('user_id', authResult.userId)
          .single()
        
        profileExists = !!profile
        profileError = error?.message
      } catch (error) {
        profileError = error instanceof Error ? error.message : 'Unknown profile error'
      }
    }

    debugSteps.push({
      step: 4,
      name: 'User Profile Check',
      exists: profileExists,
      error: profileError
    })

    // Step 5: Test session persistence
    let sessionPersistence = null
    if (authResult?.hasSession) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        sessionPersistence = {
          canGetSession: !!session,
          sessionMatches: session?.user?.id === authResult.userId,
          error: error?.message
        }
      } catch (error) {
        sessionPersistence = {
          error: error instanceof Error ? error.message : 'Unknown session error'
        }
      }
    }

    debugSteps.push({
      step: 5,
      name: 'Session Persistence Test',
      result: sessionPersistence
    })

    // Overall assessment
    const allStepsSuccessful = 
      debugSteps[1]?.success && // Auth successful
      debugSteps[2]?.exists && // Public user exists
      debugSteps[3]?.exists    // Profile exists

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      email,
      overallSuccess: allStepsSuccessful,
      debugSteps,
      recommendation: allStepsSuccessful 
        ? 'All steps successful - issue might be client-side'
        : 'Found issues in server-side authentication flow'
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Debug signin flow error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
