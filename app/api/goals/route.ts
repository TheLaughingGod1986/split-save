import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { goalSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const { data: goals, error } = await supabaseAdmin
      .from('goals')
      .select(`
        *,
        added_by_user:users!goals_added_by_user_id_fkey(id, name)
      `)
      .eq('partnership_id', user.partnershipId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Goals fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
    }

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Get goals error:', error)
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const goalData = goalSchema.parse(body)

    // Goals always require approval
    const { data: approval, error } = await supabaseAdmin
      .from('approval_requests')
      .insert({
        partnership_id: user.partnershipId,
        requested_by_user_id: user.id,
        request_type: 'goal',
        request_data: goalData,
        message: goalData.message || null
      })
      .select()
      .single()

    if (error) {
      console.error('Approval request creation error:', error)
      return NextResponse.json({ error: 'Failed to create approval request' }, { status: 400 })
    }

    return NextResponse.json({
      requiresApproval: true,
      approvalRequestId: approval.id
    }, { status: 201 })
  } catch (error) {
    console.error('Add goal error:', error)
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  }
}
