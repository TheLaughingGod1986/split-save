import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { authenticateRequest } from '@/lib/auth'
import { calculateMonthlyContribution } from '@/lib/contribution-utils'

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's partnership
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'No active partnership found' }, { status: 404 })
    }

    // Get all contributions for this partnership
    const { data: contributions, error: contributionsError } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('partnership_id', partnership.id)
      .order('month', { ascending: false })

    if (contributionsError) {
      console.error('Error fetching contributions:', contributionsError)
      return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 })
    }

    return NextResponse.json(contributions || [])
  } catch (error) {
    console.error('Contributions GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's partnership
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'No active partnership found' }, { status: 404 })
    }

    const body = await request.json()
    const { month, userContribution, partnerContribution, notes } = body

    if (!month) {
      return NextResponse.json({ error: 'Month is required' }, { status: 400 })
    }

    if (!userContribution || !partnerContribution) {
      return NextResponse.json({ error: 'Both user and partner contributions are required' }, { status: 400 })
    }

    // Check if contribution for this month already exists
    const { data: existingContribution } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('partnership_id', partnership.id)
      .eq('month', month)
      .single()

    if (existingContribution) {
      // Update existing contribution
      const { data: updatedContribution, error: updateError } = await supabaseAdmin
        .from('contributions')
        .update({
          user1_amount: userContribution,
          user2_amount: partnerContribution,
          total_required: userContribution + partnerContribution,
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingContribution.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating contribution:', updateError)
        return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 })
      }

      return NextResponse.json(updatedContribution)
    }

    // Create new contribution record
    const newContribution = {
      partnership_id: partnership.id,
      month,
      user1_amount: userContribution,
      user2_amount: partnerContribution,
      user1_paid: false,
      user2_paid: false,
      total_required: userContribution + partnerContribution,
      notes: notes || null
    }

    const { data: contribution, error: insertError } = await supabaseAdmin
      .from('contributions')
      .insert(newContribution)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating contribution:', insertError)
      return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 })
    }

    return NextResponse.json(contribution)
  } catch (error) {
    console.error('Contributions POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
