import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  console.log('=== INVITE RESPOND API ROUTE START ===')
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { invitationId, action } = await request.json()
    
    if (!invitationId || !action) {
      return NextResponse.json({ error: 'Invitation ID and action required' }, { status: 400 })
    }

    if (!['accept', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    console.log('1. Processing invitation response:', { invitationId, action, userId: user.id })

    // Get invitation - check both to_user_id and to_email
    const { data: invitation, error: invError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('status', 'pending')
      .or(`to_user_id.eq.${user.id},to_email.eq.${user.email}`)
      .single()

    if (invError || !invitation) {
      console.log('2. Invitation not found or not pending')
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    console.log('3. Invitation found:', invitation)

    if (action === 'accept') {
      console.log('4. Creating partnership')
      // Create partnership
      const { error: partError } = await supabaseAdmin
        .from('partnerships')
        .insert({
          user1_id: invitation.from_user_id,
          user2_id: user.id,
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (partError) {
        console.error('5. Partnership creation error:', partError)
        return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
      }

      console.log('6. Partnership created successfully')
    }

    // Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from('partnership_invitations')
      .update({ 
        status: action === 'accept' ? 'accepted' : 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    if (updateError) {
      console.error('7. Invitation update error:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    console.log('8. Invitation status updated to:', action === 'accept' ? 'accepted' : 'declined')

    return NextResponse.json({
      message: `Invitation ${action}ed successfully`
    })
  } catch (error) {
    console.error('Invite respond error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
