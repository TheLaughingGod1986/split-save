import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const approvalId = params.id

  try {
    // Get approval request details
    const { data: approval, error } = await supabaseAdmin
      .from('approval_requests')
      .select('*')
      .eq('id', approvalId)
      .single()

    if (error || !approval) {
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 })
    }

    // Check if user is part of the partnership
    const { data: partnership } = await supabaseAdmin
      .from('partnerships')
      .select('id')
      .eq('id', approval.partnership_id)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single()

    if (!partnership) {
      return NextResponse.json({ error: 'Not authorized to respond to this request' }, { status: 403 })
    }

    if (approval.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Prevent users from declining their own requests
    if (approval.requested_by_user_id === user.id) {
      return NextResponse.json({ error: 'You cannot decline your own request' }, { status: 403 })
    }

    // Update approval status to declined
    const { error: updateError } = await supabaseAdmin
      .from('approval_requests')
      .update({
        status: 'declined',
        responded_by: user.id,
        responded_at: new Date().toISOString()
      })
      .eq('id', approvalId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to decline request' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Decline request error:', error)
    return NextResponse.json({ error: 'Failed to decline request' }, { status: 500 })
  }
}
