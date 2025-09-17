import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { action, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    if (action === 'signup') {
      // Test user creation
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto-confirm for testing
      })

      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          code: error.status
        }, { status: 400 })
      }

      // Also create in public.users table
      if (data.user) {
        const { error: publicUserError } = await supabaseAdmin
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.email?.split('@')[0] || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_seen: new Date().toISOString()
          })

        if (publicUserError) {
          console.error('Error creating public user:', publicUserError)
        }
      }

      return NextResponse.json({ 
        success: true, 
        user: {
          id: data.user?.id,
          email: data.user?.email,
          confirmed: data.user?.email_confirmed_at
        }
      })

    } else if (action === 'signin') {
      // Test sign in with regular Supabase client
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return NextResponse.json({ 
          success: false, 
          error: error.message,
          code: error.status
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        user: {
          id: data.user?.id,
          email: data.user?.email,
          hasSession: !!data.session
        }
      })

    } else {
      return NextResponse.json({ error: 'Invalid action. Use "signup" or "signin"' }, { status: 400 })
    }

  } catch (error) {
    console.error('Test auth error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
