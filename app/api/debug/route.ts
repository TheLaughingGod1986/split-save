import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG API START ===')
    
    // Check all partnerships
    const { data: partnerships, error: partError } = await supabaseAdmin
      .from('partnerships')
      .select(`
        id,
        user1_id,
        user2_id,
        status,
        created_at,
        updated_at,
        user1:users!partnerships_user1_id_fkey(id, email, name),
        user2:users!partnerships_user2_id_fkey(id, email, name)
      `)
      .order('created_at', { ascending: false })

    if (partError) {
      console.error('Partnerships fetch error:', partError)
      return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
    }

    // Check all partnership invitations
    const { data: invitations, error: invError } = await supabaseAdmin
      .from('partnership_invitations')
      .select(`
        id,
        from_user_id,
        to_user_id,
        to_email,
        status,
        created_at,
        updated_at,
        expires_at,
        from_user:users!partnership_invitations_from_user_id_fkey(id, email, name),
        to_user:users!partnership_invitations_to_user_id_fkey(id, email, name)
      `)
      .order('created_at', { ascending: false })

    if (invError) {
      console.error('Invitations fetch error:', invError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    // Check all users
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        created_at,
        profiles:user_profiles(country_code, currency)
      `)
      .order('created_at', { ascending: false })

    if (userError) {
      console.error('Users fetch error:', userError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Check auth.users count
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    console.log('=== DEBUG API SUCCESS ===')
    
    return NextResponse.json({
      partnerships: partnerships || [],
      invitations: invitations || [],
      users: users || [],
      authUsersCount: authUsers?.users?.length || 0,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
