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

    // Update approval status
    const { error: updateError } = await supabaseAdmin
      .from('approval_requests')
      .update({
        status: 'approved',
        responded_by: user.id,
        responded_at: new Date().toISOString()
      })
      .eq('id', approvalId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to approve request' }, { status: 400 })
    }

    // If approved, create the actual item
    if (approval.request_type === 'expense_add') {
      const expenseData = approval.request_data
      const { error: expenseError } = await supabaseAdmin
        .from('expenses')
        .insert({
          partnership_id: approval.partnership_id,
          name: expenseData.name,
          amount: expenseData.amount,
          category: expenseData.category,
          frequency: expenseData.frequency,
          added_by: approval.requested_by,
          status: 'active'
        })

      if (expenseError) {
        console.error('Failed to create approved expense:', expenseError)
      }
    } else if (approval.request_type === 'goal_add') {
      const goalData = approval.request_data
      const { error: goalError } = await supabaseAdmin
        .from('goals')
        .insert({
          partnership_id: approval.partnership_id,
          name: goalData.name,
          target_amount: goalData.targetAmount,
          goal_type: goalData.goalType,
          priority: goalData.priority || 1,
          added_by: approval.requested_by,
          status: 'active'
        })

      if (goalError) {
        console.error('Failed to create approved goal:', goalError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve request error:', error)
    return NextResponse.json({ error: 'Failed to approve request' }, { status: 500 })
  }
}
