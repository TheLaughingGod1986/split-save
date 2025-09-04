import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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
    const { data: updatedInvitation, error: updateError } = await supabaseAdmin
      .from('partnership_invitations')
      .update({
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        updated_at: new Date().toISOString()
      })
      .eq('id', invitationId)
      .select()
      .single()

    if (updateError) {
      console.error('Update invitation error:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    // Get user profile data for the email
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    const fromUserName = userProfile?.name || 'SplitSave User'

    // Send invitation email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invitation-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invitationId: invitation.id,
          toEmail: toEmail,
          fromUserName: fromUserName,
          fromUserEmail: user.email,
          isResend: true
        }),
      })

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('Resend email sent successfully:', emailResult)
      } else {
        const errorText = await emailResponse.text()
        console.error('Resend email sending failed:', emailResponse.status, errorText)
        // Don't fail the resend if email fails
      }
    } catch (emailError) {
      console.error('Resend email sending error:', emailError)
      // Don't fail the resend if email fails
    }

    return NextResponse.json({ 
      message: 'Invitation resent successfully',
      invitation: updatedInvitation
    })
  } catch (error) {
    console.error('Resend method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== INVITE RESEND API ROUTE END ===')
  }
}
