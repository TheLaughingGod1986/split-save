import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🎭 Creating sample activities for user:', user.id)

    // Get user's partnership ID
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('id')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    let partnershipId: string

    if (partnershipError || !partnership) {
      console.log('❌ No partnership found, creating one first')
      // Create a partnership first
      const { data: newPartnership, error: createError } = await supabaseAdmin
        .from('partnerships')
        .insert({
          user1_id: user.id,
          user2_id: user.id, // Demo: same user for both sides
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (createError) {
        console.error('❌ Error creating partnership:', createError)
        return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
      }

      partnershipId = newPartnership.id
    } else {
      partnershipId = partnership.id
    }

    // Create sample activities
    const sampleActivities = [
      {
        user_id: user.id,
        partnership_id: partnershipId,
        activity_type: 'expense_added',
        title: 'Added expense: Grocery shopping',
        description: 'Weekly grocery shopping at Tesco - £45.50',
        metadata: { category: 'groceries', location: 'Tesco' },
        amount: 45.50,
        currency: 'GBP',
        entity_type: 'expense',
        entity_id: 'sample-expense-1',
        visibility: 'partners',
        is_milestone: false,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        user_id: user.id,
        partnership_id: partnershipId,
        activity_type: 'goal_created',
        title: 'Created goal: House deposit',
        description: 'Saving for house deposit - Target: £50,000',
        metadata: { target_amount: 50000, current_amount: 0 },
        amount: 50000,
        currency: 'GBP',
        entity_type: 'goal',
        entity_id: 'sample-goal-1',
        visibility: 'partners',
        is_milestone: false,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
      },
      {
        user_id: user.id,
        partnership_id: partnershipId,
        activity_type: 'goal_contribution',
        title: 'Made contribution to house deposit',
        description: 'Added £500 to house deposit goal',
        metadata: { contribution_amount: 500, goal_name: 'House deposit' },
        amount: 500,
        currency: 'GBP',
        entity_type: 'goal',
        entity_id: 'sample-goal-1',
        visibility: 'partners',
        is_milestone: true,
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      },
      {
        user_id: user.id,
        partnership_id: partnershipId,
        activity_type: 'expense_added',
        title: 'Added expense: Restaurant dinner',
        description: 'Date night dinner at Italian restaurant - £78.00',
        metadata: { category: 'dining', location: 'Italian Restaurant' },
        amount: 78.00,
        currency: 'GBP',
        entity_type: 'expense',
        entity_id: 'sample-expense-2',
        visibility: 'partners',
        is_milestone: false,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      },
      {
        user_id: user.id,
        partnership_id: partnershipId,
        activity_type: 'achievement_unlocked',
        title: 'Achievement unlocked: First Goal!',
        description: 'Congratulations! You created your first financial goal.',
        metadata: { achievement_type: 'first_goal', badge: 'first_goal' },
        amount: 0,
        currency: 'GBP',
        entity_type: 'achievement',
        entity_id: 'sample-achievement-1',
        visibility: 'partners',
        is_milestone: true,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      }
    ]

    // Insert sample activities
    const { data: activities, error: insertError } = await supabaseAdmin
      .from('activity_feed')
      .insert(sampleActivities)
      .select('id')

    if (insertError) {
      console.error('❌ Error creating sample activities:', insertError)
      return NextResponse.json({ error: 'Failed to create sample activities' }, { status: 500 })
    }

    console.log('✅ Created sample activities:', activities?.length || 0)

    // Create some sample comments and reactions
    if (activities && activities.length > 0) {
      const sampleComments = [
        {
          activity_id: activities[0].id,
          user_id: user.id,
          content: 'Great job on the grocery shopping! We stayed under budget this week 🎉',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        },
        {
          activity_id: activities[1].id,
          user_id: user.id,
          content: 'Exciting! Can\'t wait to start house hunting once we reach our target 💪',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        }
      ]

      const { error: commentsError } = await supabaseAdmin
        .from('activity_comments')
        .insert(sampleComments)

      if (commentsError) {
        console.warn('⚠️ Failed to create sample comments:', commentsError)
      }

      // Create some sample reactions
      const sampleReactions = [
        {
          activity_id: activities[0].id,
          user_id: user.id,
          reaction_type: 'like',
          created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        },
        {
          activity_id: activities[2].id,
          user_id: user.id,
          reaction_type: 'love',
          created_at: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        },
        {
          activity_id: activities[4].id,
          user_id: user.id,
          reaction_type: 'celebration',
          created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
        }
      ]

      const { error: reactionsError } = await supabaseAdmin
        .from('activity_reactions')
        .insert(sampleReactions)

      if (reactionsError) {
        console.warn('⚠️ Failed to create sample reactions:', reactionsError)
      }
    }

    return NextResponse.json({
      message: 'Sample activities created successfully',
      activitiesCreated: activities?.length || 0,
      partnershipId: partnershipId
    })
  } catch (error) {
    console.error('❌ Create sample activities error:', error)
    return NextResponse.json({ error: 'Failed to create sample activities' }, { status: 500 })
  }
}
