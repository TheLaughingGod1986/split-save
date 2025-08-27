import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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
      .select('*')
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
      created_at: new Date().toISOString()
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

    // Get user profile data for the email
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    const fromUserName = userProfile?.name || 'SplitSave User'

    // Send invitation email
    try {
      console.log('18a. About to call Edge Function...')
      console.log('18b. Edge Function URL:', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invitation-email`)
      console.log('18c. Service Role Key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
      
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
          fromUserEmail: user.email
        }),
      })

      console.log('18d. Edge Function response status:', emailResponse.status)
      console.log('18e. Edge Function response headers:', Object.fromEntries(emailResponse.headers.entries()))

      if (emailResponse.ok) {
        const emailResult = await emailResponse.json()
        console.log('19. Email sent successfully:', emailResult)
      } else {
        const errorText = await emailResponse.text()
        console.error('19. Email sending failed:', emailResponse.status, errorText)
        // Don't fail the invitation creation if email fails
      }
    } catch (emailError) {
      console.error('19. Email sending error:', emailError)
      // Don't fail the invitation creation if email fails
    }

    console.log('20. Success! Returning invitation data')
    return NextResponse.json({
      message: existingUser ? 'Invitation sent to existing user' : 'Invitation sent - user will be notified to create account',
      invitation
    })
  } catch (error) {
    console.error('21. Unexpected error in invite route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== INVITE API ROUTE END ===')
  }
}
