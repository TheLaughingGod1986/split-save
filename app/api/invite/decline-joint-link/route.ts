import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('=== DECLINE JOINT LINK API ROUTE START ===')
  
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

    // Check if user is the intended recipient
    if (invitation.to_email && invitation.to_email !== user.email) {
      return NextResponse.json({ error: 'This invitation is not for you' }, { status: 403 })
    }

    // Update invitation status to declined
    const { error: updateError } = await supabaseAdmin
      .from('partnership_invitations')
      .update({
        status: 'declined',
        to_user_id: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Invitation update error:', updateError)
      return NextResponse.json({ error: 'Failed to decline invitation' }, { status: 500 })
    }

    console.log('Invitation declined successfully')

    return NextResponse.json({
      success: true,
      message: 'Invitation declined successfully'
    })
  } catch (error) {
    console.error('Decline joint link method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== DECLINE JOINT LINK API ROUTE END ===')
  }
}
