import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/auth'

// GET /api/partnerships - Get user's partnerships and invitations
export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's active partnerships
    const { data: partnerships, error: partnershipsError } = await supabaseAdmin
      .from('partnerships')
      .select(`
        *,
        user1:users!partnerships_user1_id_fkey(id, name, email),
        user2:users!partnerships_user2_id_fkey(id, name, email)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

    if (partnershipsError) {
      console.error('Partnerships fetch error:', partnershipsError)
      return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
    }

    // Get pending invitations sent by user
    const { data: sentInvitations, error: sentError } = await supabaseAdmin
      .from('partnership_invitations')
      .select(`
        *,
        to_user:users!partnership_invitations_to_user_id_fkey(id, name, email)
      `)
      .eq('from_user_id', user.id)
      .eq('status', 'pending')

    if (sentError) {
      console.error('Sent invitations fetch error:', sentError)
      return NextResponse.json({ error: 'Failed to fetch sent invitations' }, { status: 500 })
    }

    // Get pending invitations received by user
    const { data: receivedInvitations, error: receivedError } = await supabaseAdmin
      .from('partnership_invitations')
      .select(`
        *,
        from_user:users!partnership_invitations_from_user_id_fkey(id, name, email)
      `)
      .eq('to_user_id', user.id)
      .eq('status', 'pending')

    if (receivedError) {
      console.error('Received invitations fetch error:', receivedError)
      return NextResponse.json({ error: 'Failed to fetch received invitations' }, { status: 500 })
    }

    return NextResponse.json({
      partnerships: partnerships || [],
      sentInvitations: sentInvitations || [],
      receivedInvitations: receivedInvitations || []
    })
  } catch (error) {
    console.error('Partnerships API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/partnerships - Send partnership invitation
export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { toEmail, message } = body

    if (!toEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 })
    }

    // Check if user is trying to invite themselves
    if (toEmail === user.email) {
      return NextResponse.json({ error: 'You cannot invite yourself' }, { status: 400 })
    }

    // Find the recipient user
    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', toEmail)
      .single()

    if (recipientError || !recipient) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if partnership already exists
    const { data: existingPartnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${recipient.id}),and(user1_id.eq.${recipient.id},user2_id.eq.${user.id})`)
      .single()

    if (partnershipError && partnershipError.code !== 'PGRST116') {
      console.error('Partnership check error:', partnershipError)
      return NextResponse.json({ error: 'Failed to check existing partnership' }, { status: 500 })
    }

    if (existingPartnership) {
      if (existingPartnership.status === 'active') {
        return NextResponse.json({ error: 'Partnership already exists' }, { status: 400 })
      } else if (existingPartnership.status === 'pending') {
        return NextResponse.json({ error: 'Partnership invitation already pending' }, { status: 400 })
      }
    }

    // Check if invitation already exists
    const { data: existingInvitation, error: invitationError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${recipient.id}),and(from_user_id.eq.${recipient.id},to_user_id.eq.${user.id})`)
      .eq('status', 'pending')
      .single()

    if (invitationError && invitationError.code !== 'PGRST116') {
      console.error('Invitation check error:', invitationError)
      return NextResponse.json({ error: 'Failed to check existing invitation' }, { status: 500 })
    }

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already exists' }, { status: 400 })
    }

    // Create the invitation
    const { data: invitation, error: createError } = await supabaseAdmin
      .from('partnership_invitations')
      .insert({
        from_user_id: user.id,
        to_user_id: recipient.id,
        message: message || `Hi! I'd like to connect with you on SplitSave to manage our shared finances together.`
      })
      .select()
      .single()

    if (createError) {
      console.error('Invitation creation error:', createError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Partnership invitation sent successfully',
      invitation
    })
  } catch (error) {
    console.error('Partnership invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
