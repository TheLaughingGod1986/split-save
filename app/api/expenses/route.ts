import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { expenseSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
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
    const expenseData = expenseSchema.parse(body)
    
    // Check if requires approval (expenses over $100)
    const requiresApproval = expenseData.amount > 100

    if (requiresApproval) {
      // Create approval request
      const { data: approval, error } = await supabaseAdmin
        .from('approval_requests')
        .insert({
          partnership_id: user.partnershipId,
          requested_by_user_id: user.id, // Use correct column name
          request_type: 'expense_add',
          request_data: expenseData,
          message: expenseData.message || null
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to create approval request' }, { status: 400 })
      }

      return NextResponse.json({
        requiresApproval: true,
        approvalRequestId: approval.id
      }, { status: 201 })
    } else {
      // Create expense directly
      const { data: expense, error } = await supabaseAdmin
        .from('expenses')
        .insert({
          partnership_id: user.partnershipId,
          description: expenseData.name, // Map name to description
          amount: expenseData.amount,
          category: expenseData.category,
          date: new Date().toISOString().split('T')[0], // Use current date
          added_by_user_id: user.id // Use correct column name
        })
        .select(`
          *,
          added_by_user:users!expenses_added_by_user_id_fkey(id, name)
        `)
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to add expense' }, { status: 400 })
      }

      return NextResponse.json(expense, { status: 201 })
    }
  } catch (error) {
    console.error('Add expense error:', error)
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  }
}
