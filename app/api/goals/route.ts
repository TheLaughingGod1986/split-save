import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { goalSchema } from '@/lib/validation'
import { ActivityHelpers } from '@/lib/activity-logger'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    const { data: goals, error } = await supabaseAdmin
      .from('goals')
      .select(`
        *,
        added_by_user:users!goals_added_by_user_id_fkey(id, name),
        contributions:goal_contributions(
          id,
          amount,
          message,
          month,
          year,
          expected_amount,
          over_under_amount,
          created_at,
          user:users!goal_contributions_user_id_fkey(id, name)
        )
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

    // Check number of partners in this partnership
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('id, user1_id, user2_id')
      .eq('id', user.partnershipId)
      .single()
    
    if (partnershipError) {
      console.error('❌ Goals API - Failed to fetch partnership:', partnershipError)
      return NextResponse.json({ error: 'Failed to fetch partnership details' }, { status: 500 })
    }
    
    // Count active partners (users who are not null)
    const activePartners = [partnership.user1_id, partnership.user2_id].filter(id => id !== null).length
    console.log('🔍 Goals API - Active partners in partnership:', activePartners)
    
    // Check if requires approval: only if there are 2+ partners
    const requiresApproval = activePartners > 1
    
    if (requiresApproval) {
      console.log('🔍 Goals API - Creating approval request (2+ partners)')
      // Goals require approval when there are multiple partners
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
    } else {
      console.log('🔍 Goals API - Creating goal directly (single partner)')
      // Create goal directly when there's only one partner
      const { data: goal, error } = await supabaseAdmin
        .from('goals')
        .insert({
          partnership_id: user.partnershipId,
          name: goalData.name,
          description: goalData.description,
          target_amount: goalData.target_amount,
          current_amount: goalData.current_amount || 0,
          category: goalData.category,
          target_date: goalData.target_date || null,
          added_by_user_id: user.id
        })
        .select(`
          *,
          added_by_user:users!goals_added_by_user_id_fkey(id, name)
        `)
        .single()

      if (error) {
        console.error('Direct goal creation error:', error)
        return NextResponse.json({ error: 'Failed to create goal' }, { status: 400 })
      }

      // Log activity for the goal creation
      if (user.partnershipId) {
        try {
          await ActivityHelpers.logGoalActivity(
            user.id,
            user.partnershipId,
            goal.id,
            goalData.name,
            'created',
            goalData.target_amount,
            { category: goalData.category, target_date: goalData.target_date }
          )
          console.log('✅ Activity logged for goal creation:', goal.id)
        } catch (activityError) {
          console.warn('⚠️ Failed to log goal activity:', activityError)
          // Don't fail the main operation if activity logging fails
        }
      }

      return NextResponse.json(goal, { status: 201 })
    }
  } catch (error) {
    console.error('Add goal error:', error)
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  }
}
