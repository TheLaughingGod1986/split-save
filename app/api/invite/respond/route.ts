import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('=== RESPOND TO INVITATION START ===')
    
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { invitationId, action } = await request.json()
    
    if (!invitationId || !action) {
      return NextResponse.json({ error: 'Invitation ID and action required' }, { status: 400 })
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "accept" or "decline"' }, { status: 400 })
    }

    console.log('1. Looking up invitation:', invitationId)
    
    // Get the invitation
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single()

    if (invError || !invitation) {
      console.log('2. Invitation not found or not pending')
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 404 })
    }

    // Check if invitation has expired
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      console.log('3. Invitation expired')
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 400 })
    }

    // Verify the user is the recipient
    if (invitation.to_user_id && invitation.to_user_id !== user.id) {
      console.log('4. User is not the recipient')
      return NextResponse.json({ error: 'You can only respond to invitations sent to you' }, { status: 403 })
    }

    // If invitation is by email, verify the email matches
    if (invitation.to_email && invitation.to_email !== user.email) {
      console.log('5. Email mismatch')
      return NextResponse.json({ error: 'This invitation was not sent to your email address' }, { status: 403 })
    }

    console.log('6. Processing', action, 'for invitation:', invitation)

    if (action === 'accept') {
      // Update invitation status to accepted
      const { error: updateError } = await supabaseAdmin
        .from('partnership_invitations')
        .update({ 
          status: 'accepted',
          to_user_id: user.id, // Link the invitation to the user
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)

      if (updateError) {
        console.error('7. Failed to update invitation:', updateError)
        return NextResponse.json({ error: 'Failed to accept invitation' }, { status: 500 })
      }

      // Create the partnership
      const { error: partnershipError } = await supabaseAdmin
        .from('partnerships')
        .insert({
          user1_id: invitation.from_user_id,
          user2_id: user.id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (partnershipError) {
        console.error('8. Failed to create partnership:', partnershipError)
        return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
      }

      console.log('9. Success! Partnership established')
      
      return NextResponse.json({
        message: 'Partnership established successfully!',
        partnership: 'active'
      })

    } else if (action === 'decline') {
      // Update invitation status to declined
      const { error: updateError } = await supabaseAdmin
        .from('partnership_invitations')
        .update({ 
          status: 'declined',
          to_user_id: user.id, // Link the invitation to the user
          updated_at: new Date().toISOString()
        })
        .eq('id', invitationId)

      if (updateError) {
        console.error('7. Failed to update invitation:', updateError)
        return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 })
      }

      console.log('9. Success! Invitation declined')
      
      return NextResponse.json({
        message: 'Invitation declined successfully'
      })
    }

  } catch (error) {
    console.error('Respond to invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== RESPOND TO INVITATION END ===')
  }
}
