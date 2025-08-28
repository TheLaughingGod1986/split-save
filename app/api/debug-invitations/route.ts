import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  console.log('=== DEBUG INVITATIONS API START ===')
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('1. User authenticated:', { id: user.id, email: user.email })
    
    // Check all invitations in the table
    const { data: allInvitations, error: allError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .order('created_at', { ascending: false })

    if (allError) {
      console.error('All invitations fetch error:', allError)
      return NextResponse.json({ error: 'Failed to fetch all invitations' }, { status: 500 })
    }

    // Check invitations from this user
    const { data: fromUserInvitations, error: fromError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('from_user_id', user.id)

    if (fromError) {
      console.error('From user invitations fetch error:', fromError)
      return NextResponse.json({ error: 'Failed to fetch from user invitations' }, { status: 500 })
    }

    // Check invitations to this user
    const { data: toUserInvitations, error: toError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('to_user_id', user.id)

    if (toError) {
      console.error('To user invitations fetch error:', toError)
      return NextResponse.json({ error: 'Failed to fetch to user invitations' }, { status: 500 })
    }

    // Check invitations by email
    const { data: emailInvitations, error: emailError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('to_email', user.email)

    if (emailError) {
      console.error('Email invitations fetch error:', emailError)
      return NextResponse.json({ error: 'Failed to fetch email invitations' }, { status: 500 })
    }

    console.log('2. Success! Returning debug data')
    return NextResponse.json({
      user: { id: user.id, email: user.email },
      allInvitations: allInvitations || [],
      fromUserInvitations: fromUserInvitations || [],
      toUserInvitations: toUserInvitations || [],
      emailInvitations: emailInvitations || [],
      summary: {
        total: allInvitations?.length || 0,
        fromUser: fromUserInvitations?.length || 0,
        toUser: toUserInvitations?.length || 0,
        byEmail: emailInvitations?.length || 0
      }
    })
  } catch (error) {
    console.error('GET method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== DEBUG INVITATIONS API END ===')
  }
}
