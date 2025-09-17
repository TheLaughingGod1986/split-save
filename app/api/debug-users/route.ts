import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Check if we have admin access
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Supabase admin not configured' }, { status: 500 })
    }

    // Get users from auth.users table
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return NextResponse.json({ 
        error: 'Failed to fetch users', 
        details: usersError.message 
      }, { status: 500 })
    }

    // Get public users table info
    const { data: publicUsers, error: publicUsersError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, created_at')
      .limit(10)

    const debugInfo = {
      timestamp: new Date().toISOString(),
      authUsers: {
        total: users?.users?.length || 0,
        users: users?.users?.map(user => ({
          id: user.id,
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
          createdAt: user.created_at,
          lastSignIn: user.last_sign_in_at,
          provider: user.app_metadata?.provider
        })) || []
      },
      publicUsers: {
        total: publicUsers?.length || 0,
        error: publicUsersError?.message,
        users: publicUsers?.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          createdAt: user.created_at
        })) || []
      },
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    return NextResponse.json(debugInfo, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Debug users error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
