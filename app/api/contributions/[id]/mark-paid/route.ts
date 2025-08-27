import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the request
    const { user, error: authError } = await authenticateRequest(request)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contributionId = params.id

    // Get the contribution record
    const { data: contribution, error: fetchError } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('id', contributionId)
      .single()

    if (fetchError || !contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    // Get user's partnership to verify they're part of it
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('id', contribution.partnership_id)
      .eq('status', 'active')
      .single()

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'Not authorized to modify this contribution' }, { status: 403 })
    }

    // Determine which user this is (user1 or user2)
    const isUser1 = partnership.user1_id === user.id
    const isUser2 = partnership.user2_id === user.id

    if (!isUser1 && !isUser2) {
      return NextResponse.json({ error: 'Not authorized to modify this contribution' }, { status: 403 })
    }

    // Update the appropriate user's payment status
    const updateData: any = {}
    
    if (isUser1) {
      updateData.user1_paid = true
      updateData.user1_paid_date = new Date().toISOString()
    } else if (isUser2) {
      updateData.user2_paid = true
      updateData.user2_paid_date = new Date().toISOString()
    }

    updateData.updated_at = new Date().toISOString()

    // Update the contribution record
    const { data: updatedContribution, error: updateError } = await supabaseAdmin
      .from('contributions')
      .update(updateData)
      .eq('id', contributionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating contribution:', updateError)
      return NextResponse.json({ error: 'Failed to mark contribution as paid' }, { status: 500 })
    }

    // Check if both users have paid (contribution is complete)
    const isComplete = updatedContribution.user1_paid && updatedContribution.user2_paid

    return NextResponse.json({
      ...updatedContribution,
      isComplete,
      message: isComplete 
        ? 'Monthly contribution is now complete! 🎉' 
        : 'Contribution marked as paid. Waiting for partner.'
    })
  } catch (error) {
    console.error('Mark contribution as paid error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
