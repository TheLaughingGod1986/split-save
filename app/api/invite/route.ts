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

export async function GET(request: NextRequest) {
  console.log('=== INVITE API ROUTE GET START ===')
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('1. Fetching partnerships for user:', user.id)
    const { data: partnerships, error } = await supabaseAdmin
      .from('partnerships')
      .select(`
        *,
        user1:users!partnerships_user1_id_fkey(id, name, email),
        user2:users!partnerships_user2_id_fkey(id, name, email)
      `)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)

    if (error) {
      console.error('Partnerships fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
    }

    console.log('2. Fetching invitations for user:', user.id)
    const { data: invitations, error: invError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)

    if (invError) {
      console.error('Invitations fetch error:', invError)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    console.log('3. Success! Returning data')
    return NextResponse.json({
      partnerships: partnerships || [],
      invitations: invitations || []
    })
  } catch (error) {
    console.error('GET method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== INVITE API ROUTE GET END ===')
  }
}

export async function POST(request: NextRequest) {
  console.log('=== INVITE API ROUTE START ===')
  console.log('1. Route handler called')
  console.log('2. Request method:', request.method)
  console.log('3. Request URL:', request.url)
  
  try {
    console.log('4. Starting authentication...')
    const user = await authenticateRequest(request)
    console.log('5. Authentication result:', user ? `User ID: ${user.id}, Email: ${user.email}` : 'No user')
    
    if (!user) {
      console.log('6. Authentication failed - returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('7. Parsing request body...')
    const body = await request.json()
    console.log('8. Request body:', body)
    
    const { toEmail } = body
    console.log('9. Extracted toEmail:', toEmail)
    
    if (!toEmail) {
      console.log('10. No email provided - returning 400')
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    if (toEmail === user.email) {
      console.log('11. Self-invitation attempt - returning 400')
      return NextResponse.json({ error: 'Cannot invite yourself' }, { status: 400 })
    }

    console.log('12. Looking up recipient user...')
    // Check if user already exists
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', toEmail)
      .single()

    console.log('13. User lookup result:', { existingUser, error: userError })

    // Check if invitation already exists
    const { data: existingInvitation, error: invCheckError } = await supabaseAdmin
      .from('partnership_invitations')
      .select('*')
      .eq('from_user_id', user.id)
      .eq('to_email', toEmail)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      console.log('14. Invitation already exists - returning 400')
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    console.log('15. Creating partnership invitation...')
    // Create invitation with or without user_id
    const invitationData: any = {
      from_user_id: user.id,
      to_email: toEmail,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      created_at: new Date().toISOString(),
      joint_link_token: crypto.randomBytes(32).toString('hex')
    }

    // If user exists, link the invitation to them
    if (existingUser) {
      invitationData.to_user_id = existingUser.id
    }

    const { data: invitation, error: invError } = await supabaseAdmin
      .from('partnership_invitations')
      .insert(invitationData)
      .select()
      .single()

    if (invError) {
      console.error('17. Invitation creation error:', invError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    console.log('18. Invitation created successfully, sending email...')

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
          invitationLink
        }
      })

      if (emailError) {
        emailErrorMessage = emailError.message || 'Unknown email delivery error'
        console.error('19. Email sending failed:', emailError)
      } else {
        emailDelivered = true
        console.log('19. Email sent successfully:', emailResult)
      }
    } catch (emailError) {
      emailErrorMessage = emailError instanceof Error ? emailError.message : 'Failed to send invitation email'
      console.error('19. Email sending error:', emailError)
    }

    console.log('20. Success! Returning invitation data')
    return NextResponse.json({
      message: emailDelivered
        ? existingUser
          ? 'Invitation sent to existing user'
          : 'Invitation sent - user will be notified to create account'
        : 'Invitation created, but the email could not be delivered. Share the invite link manually.',
      invitation,
      emailDelivered,
      invitationLink,
      emailError: emailErrorMessage
    }, { status: emailDelivered ? 200 : 202 })
  } catch (error) {
    console.error('21. Unexpected error in invite route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== INVITE API ROUTE END ===')
  }
}

export async function DELETE(request: NextRequest) {
  console.log('=== INVITE DELETE API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const invitationId = searchParams.get('id')

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 })
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

    // Delete the invitation
    const { error: deleteError } = await supabaseAdmin
      .from('partnership_invitations')
      .delete()
      .eq('id', invitationId)

    if (deleteError) {
      console.error('Delete invitation error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Invitation withdrawn successfully' })
  } catch (error) {
    console.error('DELETE method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== INVITE DELETE API ROUTE END ===')
  }
}
