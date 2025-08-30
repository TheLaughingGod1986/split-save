import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { expenseUpdateSchema } from '@/lib/validation'

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
    const body = await req.json()
    console.log('🔍 Expense Update API - Received body:', body)
    
    const updateData = expenseUpdateSchema.parse(body)
    console.log('✅ Expense Update API - Validated data:', updateData)
    
    // First, verify the expense exists and belongs to this partnership
    const { data: existingExpense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('id, partnership_id, added_by_user_id')
      .eq('id', params.id)
      .eq('partnership_id', user.partnershipId)
      .single()
    
    if (fetchError || !existingExpense) {
      console.error('❌ Expense Update API - Expense not found or access denied:', fetchError)
      return NextResponse.json({ error: 'Expense not found or access denied' }, { status: 404 })
    }
    
    // Check if user can edit this expense (either they created it or they're a partner)
    const canEdit = existingExpense.added_by_user_id === user.id || 
                   (user.partnershipId === existingExpense.partnership_id)
    
    if (!canEdit) {
      console.error('❌ Expense Update API - User cannot edit this expense')
      return NextResponse.json({ error: 'Cannot edit this expense' }, { status: 403 })
    }
    
    // Update the expense
    const { data: updatedExpense, error: updateError } = await supabaseAdmin
      .from('expenses')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        added_by_user:users!expenses_added_by_user_id_fkey(id, name)
      `)
      .single()

    if (updateError) {
      console.error('❌ Expense Update API - Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
    }

    console.log('✅ Expense Update API - Expense updated successfully:', updatedExpense.id)
    return NextResponse.json(updatedExpense)
  } catch (error) {
    console.error('❌ Expense Update API - Error:', error)
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
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
    // First, verify the expense exists and belongs to this partnership
    const { data: existingExpense, error: fetchError } = await supabaseAdmin
      .from('expenses')
      .select('id, partnership_id, added_by_user_id, is_recurring')
      .eq('id', params.id)
      .eq('partnership_id', user.partnershipId)
      .single()
    
    if (fetchError || !existingExpense) {
      console.error('❌ Expense Delete API - Expense not found or access denied:', fetchError)
      return NextResponse.json({ error: 'Expense not found or access denied' }, { status: 404 })
    }
    
    // Check if user can delete this expense (either they created it or they're a partner)
    const canDelete = existingExpense.added_by_user_id === user.id || 
                     (user.partnershipId === existingExpense.partnership_id)
    
    if (!canDelete) {
      console.error('❌ Expense Delete API - User cannot delete this expense')
      return NextResponse.json({ error: 'Cannot delete this expense' }, { status: 403 })
    }
    
    // For recurring expenses, we'll soft delete by setting status to 'deleted'
    // For one-time expenses, we can hard delete
    if (existingExpense.is_recurring) {
      // Soft delete for recurring expenses
      const { error: softDeleteError } = await supabaseAdmin
        .from('expenses')
        .update({
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
      
      if (softDeleteError) {
        console.error('❌ Expense Delete API - Soft delete error:', softDeleteError)
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
      }
      
      console.log('✅ Expense Delete API - Recurring expense soft deleted:', params.id)
      return NextResponse.json({ message: 'Recurring expense archived' })
    } else {
      // Hard delete for one-time expenses
      const { error: hardDeleteError } = await supabaseAdmin
        .from('expenses')
        .delete()
        .eq('id', params.id)
      
      if (hardDeleteError) {
        console.error('❌ Expense Delete API - Hard delete error:', hardDeleteError)
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
      }
      
      console.log('✅ Expense Delete API - One-time expense deleted:', params.id)
      return NextResponse.json({ message: 'Expense deleted successfully' })
    }
  } catch (error) {
    console.error('❌ Expense Delete API - Error:', error)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
