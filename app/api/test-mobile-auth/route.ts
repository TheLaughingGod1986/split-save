import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, testType = 'signin' } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Get user agent to detect mobile
    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent)

    const result: any = {
      timestamp: new Date().toISOString(),
      userAgent: userAgent.substring(0, 100),
      isMobile,
      testType,
      steps: []
    }

    // Step 1: Test authentication
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      result.steps.push({
        step: 'authentication',
        success: !!data.user,
        error: error?.message,
        user: data.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: !!data.user.email_confirmed_at
        } : null,
        session: data.session ? {
          hasAccessToken: !!data.session.access_token,
          hasRefreshToken: !!data.session.refresh_token,
          expiresAt: data.session.expires_at
        } : null
      })

      if (error) {
        return NextResponse.json(result, { status: 400 })
      }

      // Step 2: Test session retrieval (simulate what the app does)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      result.steps.push({
        step: 'session_retrieval',
        success: !!session,
        error: sessionError?.message,
        sessionMatches: session?.user?.id === data.user?.id
      })

      // Step 3: Test API call with session (simulate what the app does)
      if (session?.access_token) {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          })
          
          const profileData = await response.text()
          
          result.steps.push({
            step: 'profile_api_test',
            success: response.ok,
            status: response.status,
            response: response.ok ? JSON.parse(profileData) : profileData
          })
        } catch (profileError) {
          result.steps.push({
            step: 'profile_api_test',
            success: false,
            error: profileError instanceof Error ? profileError.message : 'Unknown error'
          })
        }
      }

      // Step 4: Create a test session for mobile
      if (testType === 'create_session') {
        try {
          // This simulates what happens when a mobile user signs in
          const sessionData = {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_at: data.session?.expires_at,
            user: data.user
          }
          
          result.steps.push({
            step: 'mobile_session_simulation',
            success: true,
            sessionData: {
              hasTokens: !!(sessionData.access_token && sessionData.refresh_token),
              userInfo: {
                id: sessionData.user?.id,
                email: sessionData.user?.email
              }
            }
          })
        } catch (mobileError) {
          result.steps.push({
            step: 'mobile_session_simulation',
            success: false,
            error: mobileError instanceof Error ? mobileError.message : 'Unknown error'
          })
        }
      }

    } catch (authError) {
      result.steps.push({
        step: 'authentication',
        success: false,
        error: authError instanceof Error ? authError.message : 'Unknown auth error'
      })
    }

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Mobile auth test error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
