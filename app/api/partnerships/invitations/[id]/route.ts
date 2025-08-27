import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/auth'

// PUT /api/partnerships/invitations/[id] - Accept or decline invitation
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { action } = body // 'accept' or 'decline'

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', params.id)
      .eq('to_user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found or already processed' }, { status: 404 })
    }

    if (action === 'accept') {
      // Create the partnership
      const { data: partnership, error: partnershipError } = await supabaseAdmin
        .from('partnerships')
        .insert({
          user1_id: invitation.from_user_id,
          user2_id: invitation.to_user_id,
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
        .update({ status: 'accepted' })
        .eq('id', params.id)

      if (updateError) {
        console.error('Invitation update error:', updateError)
        return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Partnership created successfully',
        partnership
      })
    } else {
      // Decline the invitation
      const { error: updateError } = await supabaseAdmin
        .from('partnership_invitations')
        .update({ status: 'declined' })
        .eq('id', params.id)

      if (updateError) {
        console.error('Invitation decline error:', updateError)
        return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 })
      }

      return NextResponse.json({
        message: 'Invitation declined successfully'
      })
    }
  } catch (error) {
    console.error('Partnership invitation action error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/partnerships/invitations/[id] - Cancel invitation
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', params.id)
      .eq('from_user_id', user.id)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found or cannot be cancelled' }, { status: 404 })
    }

    // Delete the invitation
    const { error: deleteError } = await supabaseAdmin
      .from('partnership_invitations')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Invitation deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to cancel invitation' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Invitation cancelled successfully'
    })
  } catch (error) {
    console.error('Partnership invitation cancellation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
