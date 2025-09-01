import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { expenseSchema } from '@/lib/validation'
import { ActivityHelpers } from '@/lib/activity-logger'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const expenseId = params.id
    
    // First, check if the expense exists and belongs to the user's partnership
    const { data: existingExpense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('partnership_id', user.partnershipId)
      .single()

    if (fetchError || !existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if user has permission to edit (either the creator or partner in the partnership)
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('user1_id, user2_id')
      .eq('id', user.partnershipId)
      .single()

    if (partnershipError) {
      return NextResponse.json({ error: 'Failed to verify partnership' }, { status: 500 })
    }

    const isAuthorized = partnership.user1_id === user.id || partnership.user2_id === user.id
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to edit this expense' }, { status: 403 })
    }

    const body = await req.json()
    console.log('🔍 Expense Update API - Received body:', body)
    
    const expenseData = expenseSchema.parse(body)
    console.log('✅ Expense Update API - Validated data:', expenseData)

    // Check if this edit requires approval (large amount changes or if original was large)
    const amountChanged = existingExpense.amount !== expenseData.amount
    const requiresApproval = (expenseData.amount > 100 || existingExpense.amount > 100) && amountChanged

    if (requiresApproval) {
      console.log('🔍 Expense Update API - Creating approval request for update')
      
      // Create approval request for the update
      const { data: approval, error: approvalError } = await supabaseAdmin
        .from('approval_requests')
        .insert({
          partnership_id: user.partnershipId,
          requested_by_user_id: user.id,
          request_type: 'expense_edit',
          request_data: {
            expense_id: expenseId,
            original_data: existingExpense,
            updated_data: expenseData
          },
          message: `Update expense: ${expenseData.description}`
        })
        .select()
        .single()

      if (approvalError) {
        console.error('❌ Expense Update API - Approval request creation error:', approvalError)
        return NextResponse.json({ error: 'Failed to create approval request' }, { status: 400 })
      }

      console.log('✅ Expense Update API - Approval request created:', approval.id)
      return NextResponse.json({
        requiresApproval: true,
        approvalId: approval.id,
        message: 'Expense update requires partner approval'
      })
    }

    // Update the expense directly (no approval needed)
    const { data: updatedExpense, error: updateError } = await supabaseAdmin
      .from('expenses')
      .update({
        description: expenseData.description,
        amount: expenseData.amount,
        category: expenseData.category,
        date: expenseData.date || new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', expenseId)
      .select(`
        *,
        added_by_user:users!expenses_added_by_user_id_fkey(id, name)
      `)
      .single()

    if (updateError) {
      console.error('❌ Expense Update API - Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 400 })
    }

    // Log activity for expense update
    if (user.partnershipId) {
      try {
        await ActivityHelpers.logExpenseActivity(
          user.id,
          user.partnershipId,
          expenseId,
          expenseData.amount,
          expenseData.description,
          false, // not an approval, direct update
          'updated'
        )
        console.log('✅ Activity logged for expense update:', expenseId)
      } catch (activityError) {
        console.warn('⚠️ Failed to log expense update activity:', activityError)
      }
    }

    console.log('✅ Expense Update API - Expense updated successfully')
    return NextResponse.json({
      requiresApproval: false,
      expense: updatedExpense
    })

  } catch (error) {
    console.error('❌ Expense Update API - Error:', error)
    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json({ error: 'Invalid expense data' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
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

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const expenseId = params.id
    
    // First, check if the expense exists and belongs to the user's partnership
    const { data: existingExpense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .eq('partnership_id', user.partnershipId)
      .single()

    if (fetchError || !existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Check if user has permission to delete (either the creator or partner in the partnership)
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('user1_id, user2_id')
      .eq('id', user.partnershipId)
      .single()

    if (partnershipError) {
      return NextResponse.json({ error: 'Failed to verify partnership' }, { status: 500 })
    }

    const isAuthorized = partnership.user1_id === user.id || partnership.user2_id === user.id
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Not authorized to delete this expense' }, { status: 403 })
    }

    // Check if this deletion requires approval (large amount)
    const requiresApproval = existingExpense.amount > 100

    if (requiresApproval) {
      console.log('🔍 Expense Delete API - Creating approval request for deletion')
      
      // Create approval request for the deletion
      const { data: approval, error: approvalError } = await supabaseAdmin
        .from('approval_requests')
        .insert({
          partnership_id: user.partnershipId,
          requested_by_user_id: user.id,
          request_type: 'expense_delete',
          request_data: {
            expense_id: expenseId,
            expense_data: existingExpense
          },
          message: `Delete expense: ${existingExpense.description}`
        })
        .select()
        .single()

      if (approvalError) {
        console.error('❌ Expense Delete API - Approval request creation error:', approvalError)
        return NextResponse.json({ error: 'Failed to create approval request' }, { status: 400 })
      }

      console.log('✅ Expense Delete API - Approval request created:', approval.id)
      return NextResponse.json({
        requiresApproval: true,
        approvalId: approval.id,
        message: 'Expense deletion requires partner approval'
      })
    }

    // Delete the expense directly (no approval needed)
    const { error: deleteError } = await supabaseAdmin
      .from('expenses')
      .delete()
      .eq('id', expenseId)

    if (deleteError) {
      console.error('❌ Expense Delete API - Delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 400 })
    }

    // Log activity for expense deletion
    if (user.partnershipId) {
      try {
        await ActivityHelpers.logExpenseActivity(
          user.id,
          user.partnershipId,
          expenseId,
          existingExpense.amount,
          existingExpense.description,
          false, // not an approval, direct deletion
          'deleted'
        )
        console.log('✅ Activity logged for expense deletion:', expenseId)
      } catch (activityError) {
        console.warn('⚠️ Failed to log expense deletion activity:', activityError)
      }
    }

    console.log('✅ Expense Delete API - Expense deleted successfully')
    return NextResponse.json({
      requiresApproval: false,
      message: 'Expense deleted successfully'
    })

  } catch (error) {
    console.error('❌ Expense Delete API - Error:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}