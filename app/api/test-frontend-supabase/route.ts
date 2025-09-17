import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== TEST FRONTEND SUPABASE CLIENT ===')
    
    // Test the same client that the frontend uses
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@splitsave.com',
      password: 'demo123'
    })

    console.log('Frontend client test result:', { 
      success: !!data.user, 
      error: error?.message,
      userId: data.user?.id 
    })

    if (error) {
      return NextResponse.json({ 
        error: 'Frontend client login failed',
        details: error.message,
        code: error.status
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Frontend client login successful',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })

  } catch (error: any) {
    console.error('Unexpected error in frontend client test:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
