import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Get user from auth.users
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError || !authUser.user) {
      return NextResponse.json({ error: 'User not found in auth table' }, { status: 404 })
    }

    const user = authUser.user

    // Create user in public.users table
    const { data: publicUser, error: publicUserError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: user.id,
        email: user.email,
        name: user.email?.split('@')[0] || 'User',
        created_at: user.created_at,
        updated_at: new Date().toISOString(),
        last_seen: new Date().toISOString()
      })
      .select()
      .single()

    if (publicUserError) {
      console.error('Error creating public user:', publicUserError)
      return NextResponse.json({ 
        error: 'Failed to create public user record',
        details: publicUserError.message
      }, { status: 500 })
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        user_id: user.id,
        country_code: 'GB',
        currency: 'GBP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Don't fail if profile creation fails, just log it
    }

    return NextResponse.json({
      success: true,
      message: 'User data fixed successfully',
      user: {
        id: user.id,
        email: user.email,
        publicUserCreated: !!publicUser,
        profileCreated: !!profile
      }
    })

  } catch (error) {
    console.error('Fix user data error:', error)
    return NextResponse.json(
      { 
        error: 'Server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
