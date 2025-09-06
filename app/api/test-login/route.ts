import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST LOGIN START ===')
    
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password required' 
      }, { status: 400 })
    }

    console.log('Attempting login with:', { email, password: '***' })

    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    console.log('Login result:', { 
      success: !!data.user, 
      error: error?.message,
      userId: data.user?.id 
    })

    if (error) {
      return NextResponse.json({ 
        error: 'Login failed',
        details: error.message,
        code: error.status
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: data.user?.id,
        email: data.user?.email,
        emailConfirmed: data.user?.email_confirmed_at
      }
    })

  } catch (error: any) {
    console.error('Unexpected error in test login:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
