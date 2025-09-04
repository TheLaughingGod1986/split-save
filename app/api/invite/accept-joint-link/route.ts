import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('=== ACCEPT JOINT LINK API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Look up the invitation by joint link token
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('joint_link_token', token)
      .eq('status', 'pending')
      .single()

    if (fetchError || !invitation) {
      console.error('Invitation not found:', fetchError)
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    
    if (now > expiresAt) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    // Check if user is the intended recipient
    if (invitation.to_email && invitation.to_email !== user.email) {
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 })
    }

    // Check if user is trying to accept their own invitation
    if (invitation.from_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot accept your own invitation' }, { status: 400 })
    }

    // Check if partnership already exists
    const { data: existingPartnership, error: partnershipCheckError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${invitation.from_user_id},user2_id.eq.${invitation.from_user_id}`)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (existingPartnership) {
      return NextResponse.json({ error: 'Partnership already exists' }, { status: 400 })
    }

    // Start a transaction to create partnership and update invitation
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .insert({
        user1_id: invitation.from_user_id,
        user2_id: user.id,
        status: 'active'
      })
      .select()
      .single()

    if (partnershipError) {
      console.error('Partnership creation error:', partnershipError)
      return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
    }

    // Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from('partnership_invitations')
      .update({
        status: 'accepted',
        to_user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Invitation update error:', updateError)
      // Don't fail the whole operation if invitation update fails
    }

    console.log('Partnership created successfully:', partnership)

    return NextResponse.json({
      success: true,
      partnership: partnership,
      message: 'Partnership invitation accepted successfully'
    })
  } catch (error) {
    console.error('Accept joint link method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== ACCEPT JOINT LINK API ROUTE END ===')
  }
}
