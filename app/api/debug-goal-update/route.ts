import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('🔍 DEBUG: Goal update request body:', body)
    console.log('🔍 DEBUG: User info:', { id: user.id, email: user.email, partnershipId: user.partnershipId })

    // Get the goal to see its current state
    const { data: goal, error: goalError } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('id', body.goalId)
      .single()

    if (goalError) {
      console.error('❌ DEBUG: Error fetching goal:', goalError)
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 })
    }

    console.log('🔍 DEBUG: Current goal state:', goal)

    // Try to update the goal with the new priority
    const { data: updatedGoal, error: updateError } = await supabaseAdmin
      .from('goals')
      .update({
        priority: body.priority,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.goalId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ DEBUG: Error updating goal:', updateError)
      return NextResponse.json({ error: 'Failed to update goal', details: updateError }, { status: 500 })
    }

    console.log('✅ DEBUG: Goal updated successfully:', updatedGoal)

    return NextResponse.json({
      message: 'Goal updated successfully',
      originalGoal: goal,
      updatedGoal: updatedGoal,
      updateData: {
        priority: body.priority
      }
    })
  } catch (error) {
    console.error('❌ DEBUG: Unexpected error:', error)
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
