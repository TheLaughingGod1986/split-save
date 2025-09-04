import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  console.log('=== INVITE JOINT LINK API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitationId } = body

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 })
    }

    // Verify the user owns this invitation
    console.log('Looking up invitation:', invitationId, 'for user:', user.id)
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('from_user_id', user.id)
      .single()

    console.log('Invitation lookup result:', { invitation, fetchError })

    if (fetchError || !invitation) {
      console.error('Invitation not found or unauthorized:', fetchError)
      return NextResponse.json({ error: 'Invitation not found or unauthorized' }, { status: 404 })
    }

    // Generate a unique joint link token
    const jointLinkToken = crypto.randomBytes(32).toString('hex')
    
    // Update the invitation with the joint link token
    const { data: updatedInvitation, error: updateError } = await supabaseAdmin
      .from('partnership_invitations')
      .update({
        joint_link_token: jointLinkToken,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      console.error('Update invitation with joint link error:', updateError)
      console.error('Error details:', JSON.stringify(updateError, null, 2))
      return NextResponse.json({ 
        error: 'Failed to generate joint link',
        details: updateError.message || 'Unknown database error'
      }, { status: 500 })
    }

    // Generate the joint link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const jointLink = `${baseUrl}/invite/join/${jointLinkToken}`
    
    console.log('Generated joint link:', jointLink)

    return NextResponse.json({ 
      message: 'Joint link generated successfully',
      jointLink: jointLink,
      invitation: updatedInvitation
    })
  } catch (error) {
    console.error('Joint link method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== INVITE JOINT LINK API ROUTE END ===')
  }
}
