import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { expenseSchema } from '@/lib/validation'
import { ActivityHelpers } from '@/lib/activity-logger'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ expenses: [] }, { status: 200 })
  }

  try {
          const { data: expenses, error } = await supabaseAdmin
        .from('expenses')
        .select(`
          *,
          added_by_user:users!expenses_added_by_user_id_fkey(id, name)
        `)
        .eq('partnership_id', user.partnershipId)
        .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
    }

    return NextResponse.json(expenses)
  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 })
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
    console.log('🔍 Expenses API - Received body:', body)
    console.log('🔍 Expenses API - Body types:', {
      description: typeof body.description,
      amount: typeof body.amount,
      category: typeof body.category,
      message: typeof body.message
    })
    
    const expenseData = expenseSchema.parse(body)
    console.log('✅ Expenses API - Validated data:', expenseData)
    
    // Check number of partners in this partnership
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('id, user1_id, user2_id')
      .eq('id', user.partnershipId)
      .single()
    
    if (partnershipError) {
      console.error('❌ Expenses API - Failed to fetch partnership:', partnershipError)
      return NextResponse.json({ error: 'Failed to fetch partnership details' }, { status: 500 })
    }
    
    console.log('🔍 Expenses API - Partnership data:', partnership)
    console.log('🔍 Expenses API - user1_id:', partnership.user1_id)
    console.log('🔍 Expenses API - user2_id:', partnership.user2_id)
    
    // Count active partners (users who are not null)
    const activePartners = [partnership.user1_id, partnership.user2_id].filter(id => id !== null).length
    console.log('🔍 Expenses API - Active partners in partnership:', activePartners)
    
    // Check if requires approval: only if amount > 100 AND there are 2+ partners
    const requiresApproval = expenseData.amount > 100 && activePartners > 1
    
    if (requiresApproval) {
      console.log('🔍 Expenses API - Creating approval request for amount:', expenseData.amount, '(2+ partners)')
      // Create approval request
      const { data: approval, error } = await supabaseAdmin
        .from('approval_requests')
        .insert({
          partnership_id: user.partnershipId,
          requested_by_user_id: user.id, // Use correct column name
          request_type: 'expense', // Fixed: was 'expense_add', should be 'expense'
          request_data: expenseData,
          message: expenseData.message || null
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Expenses API - Approval request creation error:', error)
        return NextResponse.json({ error: 'Failed to create approval request' }, { status: 400 })
      }

      console.log('✅ Expenses API - Approval request created:', approval.id)
      return NextResponse.json({
        requiresApproval: true,
        approvalRequestId: approval.id
      }, { status: 201 })
    } else {
      const reason = expenseData.amount <= 100 ? 'amount under threshold' : 'single partner (no approval needed)'
      console.log('🔍 Expenses API - Creating expense directly for amount:', expenseData.amount, `(${reason})`)
      // Create expense directly
      const { data: expense, error } = await supabaseAdmin
        .from('expenses')
        .insert({
          partnership_id: user.partnershipId,
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date || new Date().toISOString().split('T')[0], // Use provided date or current date
          added_by_user_id: user.id, // Use correct column name
          is_recurring: expenseData.is_recurring || false,
          recurring_frequency: expenseData.is_recurring ? expenseData.recurring_frequency : null,
          recurring_end_date: expenseData.recurring_end_date || null,
          notes: expenseData.notes || null,
          status: 'active'
        })
        .select(`
          *,
          added_by_user:users!expenses_added_by_user_id_fkey(id, name)
        `)
        .single()

      if (error) {
        console.error('❌ Expenses API - Direct expense creation error:', error)
        return NextResponse.json({ error: 'Failed to add expense' }, { status: 400 })
      }

      console.log('✅ Expenses API - Expense created directly:', expense.id)
      
      // Log activity for the expense
      if (user.partnershipId) {
        try {
          await ActivityHelpers.logExpenseActivity(
            user.id,
            user.partnershipId,
            expense.id,
            expenseData.amount,
            expenseData.description,
            false // not approved, created directly
          )
          console.log('✅ Activity logged for expense:', expense.id)
        } catch (activityError) {
          console.warn('⚠️ Failed to log expense activity:', activityError)
          // Don't fail the main operation if activity logging fails
        }
      }
      
      return NextResponse.json(expense, { status: 201 })
    }
  } catch (error) {
    console.error('❌ Expenses API - Add expense error:', error)
    if (error instanceof z.ZodError) {
      console.error('❌ Expenses API - Validation errors:', error.errors)
    }
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  }
}
