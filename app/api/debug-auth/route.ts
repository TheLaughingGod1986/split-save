import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG AUTH START ===')
    
    // List all users in auth.users
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error listing users:', usersError)
      return NextResponse.json({ 
        error: 'Failed to list users',
        details: usersError.message 
      }, { status: 500 })
    }

    console.log('Found users:', users.users.length)
    
    // Check for our test users
    const testUsers = users.users.filter(user => 
      user.email === 'demo@splitsave.com' || 
      user.email === 'test@example.com' || 
      user.email === 'partner@example.com'
    )

    console.log('Test users found:', testUsers.length)

    // Find demo user in the list
    const demoUser = users.users.find(user => user.email === 'demo@splitsave.com')
    
    console.log('Demo user lookup:', { demoUser: demoUser?.id, found: !!demoUser })

    return NextResponse.json({
      success: true,
      totalUsers: users.users.length,
      testUsers: testUsers.map(user => ({
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
        createdAt: user.created_at,
        lastSignIn: user.last_sign_in_at
      })),
      demoUser: demoUser ? {
        id: demoUser.id,
        email: demoUser.email,
        emailConfirmed: demoUser.email_confirmed_at,
        createdAt: demoUser.created_at
      } : null
    })

  } catch (error: any) {
    console.error('Unexpected error in debug auth:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
