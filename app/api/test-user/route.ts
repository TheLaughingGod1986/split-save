import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATING TEST USER ===')
    
    // Create test user using Supabase Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'demo@splitsave.com',
      password: 'demo123',
      email_confirm: true,
      user_metadata: {
        name: 'Demo User'
      }
    })

    if (error) {
      console.error('Error creating test user:', error)
      return NextResponse.json({ 
        error: 'Failed to create test user',
        details: error.message 
      }, { status: 500 })
    }

    console.log('Test user created successfully:', data.user?.id)

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      credentials: {
        email: 'demo@splitsave.com',
        password: 'demo123'
      },
      userId: data.user?.id
    })

  } catch (error: any) {
    console.error('Unexpected error creating test user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test user endpoint',
    usage: 'POST to create test user',
    credentials: {
      email: 'demo@splitsave.com',
      password: 'demo123'
    }
  })
}
