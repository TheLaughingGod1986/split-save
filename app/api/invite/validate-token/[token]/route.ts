import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  console.log('=== VALIDATE TOKEN API ROUTE START ===')
  
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 })
    }

    // Look up the invitation by joint link token
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('partnership_invitations')
      .select(`
        *,
        from_user:users!partnership_invitations_from_user_id_fkey(id, name, email)
      `)
      .eq('joint_link_token', token)
      .eq('status', 'pending')
      .single()

    console.log('Token validation result:', { invitation, fetchError })

    if (fetchError || !invitation) {
      console.error('Token validation failed:', fetchError)
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 })
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)
    
    if (now > expiresAt) {
      console.log('Token expired:', { now, expiresAt })
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 })
    }

    return NextResponse.json({
      success: true,
      invitation: invitation
    })
  } catch (error) {
    console.error('Validate token method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== VALIDATE TOKEN API ROUTE END ===')
  }
}
