import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { goalSchema } from '@/lib/validation'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Allow goals without partnership - users can have personal goals
  // if (!user.partnershipId) {
  //   return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  // }

  const goalId = params.id

  try {
    const body = await req.json()
    console.log('🔍 Goal update - Received request body:', body)
    
    const goalData = goalSchema.parse(body)
    console.log('✅ Goal update - Validated goal data:', goalData)

    // Check if the goal exists and belongs to the user (partnership or personal)
    let query = supabaseAdmin
      .from('goals')
      .select('id, partnership_id, added_by_user_id')
      .eq('id', goalId)

    // If user has a partnership, check partnership goals
    // If no partnership, check personal goals
    if (user.partnershipId) {
      query = query.eq('partnership_id', user.partnershipId)
    } else {
      query = query.is('partnership_id', null).eq('added_by_user_id', user.id)
    }

    const { data: existingGoal, error: checkError } = await query.single()

    if (checkError || !existingGoal) {
      console.error('❌ Goal update - Goal not found or not accessible:', checkError)
      return NextResponse.json({ error: 'Goal not found or not accessible' }, { status: 404 })
    }

    // Handle partnership logic - allow personal goals if no partnership
    let requiresApproval = false
    let partnershipId: string | null = user.partnershipId || null
    
    if (user.partnershipId) {
      // Check number of partners in this partnership
      const { data: partnership, error: partnershipError } = await supabaseAdmin
        .from('partnerships')
        .select('id, user1_id, user2_id')
        .eq('id', user.partnershipId)
        .single()
      
      if (partnershipError) {
        console.error('❌ Goal update - Failed to fetch partnership:', partnershipError)
        return NextResponse.json({ error: 'Failed to fetch partnership details' }, { status: 500 })
      }
      
      // Count active partners (users who are not null)
      const activePartners = [partnership.user1_id, partnership.user2_id].filter(id => id !== null).length
      console.log('🔍 Goal update - Active partners in partnership:', activePartners)
      
      // Check if requires approval: only if there are 2+ partners and it's not the goal creator
      requiresApproval = activePartners >= 2 && existingGoal.added_by_user_id !== user.id
    } else {
      // No partnership - personal goal, no approval needed
      console.log('🔍 Goal update - Personal goal (no partnership)')
      requiresApproval = false
    }
    
    console.log('🔍 Goal update - Requires approval:', requiresApproval)

    if (requiresApproval) {
      // Create approval request
      const { error: approvalError } = await supabaseAdmin
        .from('approval_requests')
        .insert({
          partnership_id: partnershipId,
          requested_by_user_id: user.id,
          request_type: 'goal_update',
          request_data: {
            goal_id: goalId,
            updates: goalData
          },
          status: 'pending'
        })

      if (approvalError) {
        console.error('❌ Goal update - Failed to create approval request:', approvalError)
        return NextResponse.json({ error: 'Failed to create approval request' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Goal update request sent for approval',
        requiresApproval: true 
      })
    }

    // Update the goal directly
    let updateQuery = supabaseAdmin
      .from('goals')
      .update({
        name: goalData.name,
        target_amount: goalData.target_amount,
        current_amount: goalData.current_amount,
        target_date: goalData.target_date,
        description: goalData.description,
        priority: goalData.priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)

    // If user has a partnership, update partnership goal
    // If no partnership, update personal goal
    if (user.partnershipId) {
      updateQuery = updateQuery.eq('partnership_id', user.partnershipId)
    } else {
      updateQuery = updateQuery.is('partnership_id', null).eq('added_by_user_id', user.id)
    }

    const { data: updatedGoal, error: updateError } = await updateQuery.select().single()

    if (updateError) {
      console.error('❌ Goal update - Failed to update goal:', updateError)
      console.error('❌ Goal update - Update query details:', {
        goalId,
        partnershipId: user.partnershipId,
        updateData: {
          name: goalData.name,
          target_amount: goalData.target_amount,
          current_amount: goalData.current_amount,
          target_date: goalData.target_date,
          description: goalData.description,
          priority: goalData.priority
        }
      })
      return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
    }

    console.log('✅ Goal update - Goal updated successfully:', updatedGoal)
    return NextResponse.json({ 
      message: 'Goal updated successfully',
      goal: updatedGoal,
      requiresApproval: false 
    })

  } catch (error) {
    console.error('❌ Goal update - Error:', error)
    
    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      console.error('❌ Goal update - Validation error:', error.message)
      return NextResponse.json({ 
        error: 'Invalid input data', 
        details: error.message 
      }, { status: 400 })
    }
    
    // Handle other errors
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Allow goals without partnership - users can have personal goals
  // if (!user.partnershipId) {
  //   return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  // }

  const goalId = params.id

  try {
    // Check if the goal exists and belongs to the user's partnership
    const { data: existingGoal, error: checkError } = await supabaseAdmin
      .from('goals')
      .select('id, partnership_id, added_by_user_id')
      .eq('id', goalId)
      .eq('partnership_id', user.partnershipId)
      .single()

    if (checkError || !existingGoal) {
      console.error('❌ Goal delete - Goal not found or not accessible:', checkError)
      return NextResponse.json({ error: 'Goal not found or not accessible' }, { status: 404 })
    }

    // Check number of partners in this partnership
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('id, user1_id, user2_id')
      .eq('id', user.partnershipId)
      .single()
    
    if (partnershipError) {
      console.error('❌ Goal delete - Failed to fetch partnership:', partnershipError)
      return NextResponse.json({ error: 'Failed to fetch partnership details' }, { status: 500 })
    }
    
    // Count active partners (users who are not null)
    const activePartners = [partnership.user1_id, partnership.user2_id].filter(id => id !== null).length
    
    // Check if requires approval: only if there are 2+ partners and it's not the goal creator
    const requiresApproval = activePartners >= 2 && existingGoal.added_by_user_id !== user.id

    if (requiresApproval) {
      // Create approval request for deletion
      const { error: approvalError } = await supabaseAdmin
        .from('approval_requests')
        .insert({
          partnership_id: user.partnershipId,
          requested_by_user_id: user.id,
          request_type: 'goal_delete',
          request_data: {
            goal_id: goalId
          },
          status: 'pending'
        })

      if (approvalError) {
        console.error('❌ Goal delete - Failed to create approval request:', approvalError)
        return NextResponse.json({ error: 'Failed to create approval request' }, { status: 500 })
      }

      return NextResponse.json({ 
        message: 'Goal deletion request sent for approval',
        requiresApproval: true 
      })
    }

    // Delete the goal directly
    const { error: deleteError } = await supabaseAdmin
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('partnership_id', user.partnershipId)

    if (deleteError) {
      console.error('❌ Goal delete - Failed to delete goal:', deleteError)
      return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
    }

    console.log('✅ Goal delete - Goal deleted successfully')
    return NextResponse.json({ 
      message: 'Goal deleted successfully',
      requiresApproval: false 
    })

  } catch (error) {
    console.error('Goal delete error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
