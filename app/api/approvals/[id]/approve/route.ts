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
  console.log('🔍 Approval API - Starting approval process for ID:', approvalId)

  try {
    // Get approval request details
    const { data: approval, error } = await supabaseAdmin
      .from('approval_requests')
      .select('*')
      .eq('id', approvalId)
      .single()

    if (error || !approval) {
      console.error('❌ Approval API - Approval request not found:', error)
      return NextResponse.json({ error: 'Approval request not found' }, { status: 404 })
    }

    console.log('✅ Approval API - Found approval request:', {
      id: approval.id,
      request_type: approval.request_type,
      status: approval.status,
      partnership_id: approval.partnership_id
    })

    // Check if user is part of the partnership
    const { data: partnership } = await supabaseAdmin
      .from('partnerships')
      .select('id')
      .eq('id', approval.partnership_id)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single()

    if (!partnership) {
      console.error('❌ Approval API - User not authorized for partnership:', {
        user_id: user.id,
        partnership_id: approval.partnership_id
      })
      return NextResponse.json({ error: 'Not authorized to respond to this request' }, { status: 403 })
    }

    console.log('✅ Approval API - User authorized for partnership')

    if (approval.status !== 'pending') {
      console.error('❌ Approval API - Request already processed:', approval.status)
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 })
    }

    // Prevent users from approving their own requests
    if (approval.requested_by_user_id === user.id) {
      console.error('❌ Approval API - User cannot approve their own request:', {
        user_id: user.id,
        requested_by: approval.requested_by_user_id
      })
      return NextResponse.json({ error: 'You cannot approve your own request' }, { status: 403 })
    }

    console.log('✅ Approval API - Request is pending and from partner, proceeding with approval')

    // Update approval status
    console.log('🔍 Approval API - Updating approval status to approved')
    const { error: updateError } = await supabaseAdmin
      .from('approval_requests')
      .update({
        status: 'approved',
        responded_by: user.id,
        responded_at: new Date().toISOString()
      })
      .eq('id', approvalId)

    if (updateError) {
      console.error('❌ Approval API - Failed to approve request:', updateError)
      return NextResponse.json({ error: 'Failed to approve request' }, { status: 400 })
    }

    console.log('✅ Approval API - Approval request updated to approved')

    // If approved, create the actual item
    if (approval.request_type === 'expense') {
      const expenseData = approval.request_data
      const { error: expenseError } = await supabaseAdmin
        .from('expenses')
        .insert({
          partnership_id: approval.partnership_id,
          description: expenseData.name,
          amount: expenseData.amount,
          category: expenseData.category,
          added_by_user_id: approval.requested_by_user_id,
          date: new Date().toISOString().split('T')[0]
        })

      if (expenseError) {
        console.error('❌ Approval API - Failed to create approved expense:', expenseError)
      } else {
        console.log('✅ Approval API - Approved expense created successfully')
      }
    } else if (approval.request_type === 'goal') {
      const goalData = approval.request_data
      const { error: goalError } = await supabaseAdmin
        .from('goals')
        .insert({
          partnership_id: approval.partnership_id,
          name: goalData.name,
          target_amount: goalData.targetAmount,
          description: goalData.description,
          added_by_user_id: approval.requested_by_user_id
        })

      if (goalError) {
        console.error('❌ Approval API - Failed to create approved goal:', goalError)
      } else {
        console.log('✅ Approval API - Approved goal created successfully')
      }
    }

    console.log('✅ Approval API - Approval process completed successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Approval API - Approve request error:', error)
    return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 })
  }
}
