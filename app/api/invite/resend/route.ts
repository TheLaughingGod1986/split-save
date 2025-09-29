import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

function getAppBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')
  }

  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.replace(/\/$/, '')
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  console.log('=== INVITE RESEND API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { invitationId, toEmail } = body

    if (!invitationId || !toEmail) {
      return NextResponse.json({ error: 'Invitation ID and email required' }, { status: 400 })
    }

    // Verify the user owns this invitation
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('from_user_id', user.id)
      .single()

    if (fetchError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found or unauthorized' }, { status: 404 })
    }

    // Update the invitation with new expiry date
    let jointLinkToken = invitation.joint_link_token
    if (!jointLinkToken) {
      jointLinkToken = crypto.randomBytes(32).toString('hex')
    }

    const { data: updatedInvitation, error: updateError } = await supabaseAdmin
      .from('partnership_invitations')
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        updated_at: new Date().toISOString(),
        joint_link_token: jointLinkToken
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      console.error('Update invitation error:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    const baseUrl = getAppBaseUrl()
    const invitationLink = `${baseUrl}/api/invite/accept/${invitation.id}`

    // Get user profile data for the email
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    const fromUserName = userProfile?.name || 'SplitSave User'

    // Send invitation email
    let emailDelivered = false
    let emailErrorMessage: string | null = null

    try {
      const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke('send-invitation-email', {
        body: {
          invitationId: invitation.id,
          toEmail: toEmail,
          fromUserName: fromUserName,
          fromUserEmail: user.email,
          invitationLink,
          isResend: true
        }
      })

      if (emailError) {
        emailErrorMessage = emailError.message || 'Unknown email delivery error'
        console.error('Resend email sending failed:', emailError)
      } else {
        emailDelivered = true
        console.log('Resend email sent successfully:', emailResult)
      }
    } catch (emailError) {
      emailErrorMessage = emailError instanceof Error ? emailError.message : 'Failed to send invitation email'
      console.error('Resend email sending error:', emailError)
    }

    return NextResponse.json({
      message: emailDelivered
        ? 'Invitation resent successfully'
        : 'Invitation refreshed, but the email could not be delivered. Share the invite link manually.',
      invitation: updatedInvitation,
      emailDelivered,
      invitationLink,
      emailError: emailErrorMessage
    })
  } catch (error) {
    console.error('Resend method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== INVITE RESEND API ROUTE END ===')
  }
}
