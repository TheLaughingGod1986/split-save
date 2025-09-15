import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CREATING SIMPLE TEST USER ===')
    
    // Delete existing demo user first
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingDemoUser = existingUsers.users.find(user => user.email === 'demo@splitsave.com')
    
    if (existingDemoUser) {
      console.log('Deleting existing demo user:', existingDemoUser.id)
      await supabaseAdmin.auth.admin.deleteUser(existingDemoUser.id)
    }
    
    // Create new test user with a simple password
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

    // Test the login immediately
    const { data: loginData, error: loginError } = await supabaseAdmin.auth.signInWithPassword({
      email: 'demo@splitsave.com',
      password: 'demo123'
    })

    console.log('Test login result:', { 
      success: !!loginData.user, 
      error: loginError?.message 
    })

    return NextResponse.json({
      success: true,
      message: 'Test user created and verified',
      credentials: {
        email: 'demo@splitsave.com',
        password: 'demo123'
      },
      userId: data.user?.id,
      loginTest: {
        success: !!loginData.user,
        error: loginError?.message
      }
    })

  } catch (error: any) {
    console.error('Unexpected error creating test user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
