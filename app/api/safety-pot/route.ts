import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Allow personal safety pots even without partnership
  // if (!user.partnershipId) {
  //   return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  // }

  try {
    // Get safety pot amount for this partnership or personal safety pot
    let query = supabaseAdmin
      .from('safety_pot')
      .select('*')
    
    if (user.partnershipId) {
      query = query.eq('partnership_id', user.partnershipId)
    } else {
      // For personal safety pot, use user_id instead of partnership_id
      query = query.is('partnership_id', null).eq('user_id', user.id)
    }
    
    const { data: safetyPot, error } = await query.single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Safety pot fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch safety pot' }, { status: 500 })
    }

    // If no safety pot exists, create one with 0 amount
    if (!safetyPot) {
      const insertData: any = {
        current_amount: 0,
        target_amount: 0,
        created_at: new Date().toISOString()
      }
      
      if (user.partnershipId) {
        insertData.partnership_id = user.partnershipId
      } else {
        insertData.partnership_id = null
        insertData.user_id = user.id
      }
      
      const { data: newSafetyPot, error: createError } = await supabaseAdmin
        .from('safety_pot')
        .insert(insertData)
        .select()
        .single()

      if (createError) {
        console.error('Safety pot creation error:', createError)
        return NextResponse.json({ error: 'Failed to create safety pot' }, { status: 500 })
      }

      return NextResponse.json(newSafetyPot)
    }

    return NextResponse.json(safetyPot)
  } catch (error) {
    console.error('Get safety pot error:', error)
    return NextResponse.json({ error: 'Failed to fetch safety pot' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Allow personal safety pots even without partnership
  // if (!user.partnershipId) {
  //   return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  // }

  try {
    const body = await req.json()
    const { action, amount, reason, targetGoalId } = body

    if (!action || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid action or amount' }, { status: 400 })
    }

    // Get current safety pot
    let query = supabaseAdmin
      .from('safety_pot')
      .select('*')
    
    if (user.partnershipId) {
      query = query.eq('partnership_id', user.partnershipId)
    } else {
      query = query.is('partnership_id', null).eq('user_id', user.id)
    }
    
    let { data: safetyPot } = await query.single()

    // Create safety pot if it doesn't exist
    if (!safetyPot) {
      const insertData: any = {
        current_amount: 0,
        target_amount: 0,
        created_at: new Date().toISOString()
      }
      
      if (user.partnershipId) {
        insertData.partnership_id = user.partnershipId
      } else {
        insertData.partnership_id = null
        insertData.user_id = user.id
      }
      
      console.log('🔍 DEBUG: Creating safety pot with data:', insertData)
      const { data: newSafetyPot, error: createError } = await supabaseAdmin
        .from('safety_pot')
        .insert(insertData)
        .select()
        .single()

      if (createError) {
        console.error('❌ Safety pot creation error:', createError)
        console.error('❌ Insert data was:', insertData)
        return NextResponse.json({ error: 'Failed to create safety pot' }, { status: 500 })
      }
      
      console.log('✅ Safety pot created successfully:', newSafetyPot)
      safetyPot = newSafetyPot
    }

    let newAmount = safetyPot.current_amount
    let targetGoal = null

    switch (action) {
      case 'add':
        newAmount += parseFloat(amount)
        break
      
      case 'withdraw':
        if (parseFloat(amount) > safetyPot.current_amount) {
          return NextResponse.json({ error: 'Cannot withdraw more than available' }, { status: 400 })
        }
        newAmount -= parseFloat(amount)
        break
      
      case 'reallocate':
        if (parseFloat(amount) > safetyPot.current_amount) {
          return NextResponse.json({ error: 'Cannot reallocate more than available' }, { status: 400 })
        }
        if (!targetGoalId) {
          return NextResponse.json({ error: 'Target goal ID required for reallocation' }, { status: 400 })
        }
        newAmount -= parseFloat(amount)
        
        // Add to target goal
        const { data: goal, error: goalError } = await supabaseAdmin
          .from('goals')
          .select('current_amount, target_amount')
          .eq('id', targetGoalId)
          .single()

        if (goalError) {
          return NextResponse.json({ error: 'Target goal not found' }, { status: 404 })
        }

        const updatedGoalAmount = Math.min(goal.current_amount + parseFloat(amount), goal.target_amount)
        
        const { error: updateGoalError } = await supabaseAdmin
          .from('goals')
          .update({ current_amount: updatedGoalAmount })
          .eq('id', targetGoalId)

        if (updateGoalError) {
          return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 })
        }

        targetGoal = { id: targetGoalId, amount: parseFloat(amount) }
        break
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update safety pot
    const { data: updatedSafetyPot, error: updateError } = await supabaseAdmin
      .from('safety_pot')
      .update({
        current_amount: newAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', safetyPot.id)
      .select()
      .single()

    if (updateError) {
      console.error('Safety pot update error:', updateError)
      return NextResponse.json({ error: 'Failed to update safety pot' }, { status: 500 })
    }

    // Log the transaction
    const { error: logError } = await supabaseAdmin
      .from('safety_pot_transactions')
      .insert({
        safety_pot_id: safetyPot.id,
        action: action,
        amount: parseFloat(amount),
        reason: reason || null,
        target_goal_id: targetGoalId || null,
        user_id: user.id,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Transaction logging error:', logError)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      safetyPot: updatedSafetyPot,
      targetGoal,
      action,
      amount: parseFloat(amount)
    })

  } catch (error) {
    console.error('Safety pot operation error:', error)
    return NextResponse.json({ error: 'Failed to perform safety pot operation' }, { status: 500 })
  }
}
