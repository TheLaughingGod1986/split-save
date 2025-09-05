import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { activityLogger } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Activity feed GET request received')
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      console.log('❌ Activity feed GET: Authentication failed')
      // For development, return mock data instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Development mode: Returning mock data due to auth failure')
        const mockActivities = [
          {
            id: 'mock-1',
            user_id: 'mock-user',
            partnership_id: 'mock-partnership',
            activity_type: 'expense_added',
            title: 'Added expense: phone',
            description: '£35.00 - phone',
            metadata: {},
            amount: 35.00,
            currency: 'GBP',
            entity_type: 'expense',
            entity_id: 'mock-expense-1',
            visibility: 'partners',
            is_milestone: false,
            created_at: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // 9 hours ago
            user_name: 'Ben',
            user_avatar: undefined,
            type_display_name: 'Added an Expense',
            type_icon: '💳',
            type_color: 'blue',
            reaction_count: 0,
            comment_count: 0,
            user_has_reacted: false
          },
          {
            id: 'mock-2',
            user_id: 'mock-user',
            partnership_id: 'mock-partnership',
            activity_type: 'expense_added',
            title: 'Added shared expense: Groceries',
            description: 'Weekly grocery shopping at Tesco',
            metadata: {},
            amount: 85.50,
            currency: 'GBP',
            entity_type: 'expense',
            entity_id: 'mock-expense-2',
            visibility: 'partners',
            is_milestone: false,
            created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
            user_name: 'Ben',
            user_avatar: undefined,
            type_display_name: 'Added an Expense',
            type_icon: '💳',
            type_color: 'blue',
            reaction_count: 0,
            comment_count: 0,
            user_has_reacted: false
          }
        ]
        
        return NextResponse.json({
          activities: mockActivities,
          pagination: {
            limit: 50,
            offset: 0,
            total: mockActivities.length,
            hasMore: false
          },
          filter: 'all',
          mockData: true
        })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ Activity feed GET: User authenticated:', user.id)

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100) // Max 100 items
    const offset = parseInt(searchParams.get('offset') || '0')
    const filter = searchParams.get('filter') // 'all', 'financial', 'achievements', 'social'

    console.log(`🔄 Fetching activity feed for user ${user.id}, limit: ${limit}, offset: ${offset}, filter: ${filter}`)

    // Get activity feed
    const result = await activityLogger.getActivityFeed(user.id, limit, offset)
    
    if (!result.success) {
      console.error('❌ Error fetching activity feed:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    let activities = result.activities || []

    // Apply client-side filtering if needed
    if (filter && filter !== 'all') {
      const filterMap = {
        financial: ['financial'],
        achievements: ['achievements'],
        social: ['social'],
        system: ['system']
      }
      
      const allowedCategories = filterMap[filter as keyof typeof filterMap]
      if (allowedCategories) {
        activities = activities.filter(activity => {
          // Get activity type info to determine category
          const activityType = activity.activity_type
          const financialTypes = ['expense_added', 'expense_approved', 'goal_created', 'goal_updated', 'goal_contribution', 'goal_completed', 'safety_pot_contribution']
          const achievementTypes = ['achievement_unlocked', 'streak_milestone', 'level_up']
          const socialTypes = ['partnership_joined', 'profile_updated']
          const systemTypes = ['monthly_progress', 'budget_exceeded', 'savings_milestone']
          
          if (filter === 'financial') return financialTypes.includes(activityType)
          if (filter === 'achievements') return achievementTypes.includes(activityType)
          if (filter === 'social') return socialTypes.includes(activityType)
          if (filter === 'system') return systemTypes.includes(activityType)
          
          return true
        })
      }
    }

    console.log(`✅ Successfully fetched ${activities.length} activities`)

    return NextResponse.json({
      activities,
      pagination: {
        limit,
        offset,
        total: activities.length,
        hasMore: activities.length === limit
      },
      filter: filter || 'all'
    })

  } catch (error) {
    console.error('❌ Activity feed API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Activity feed POST request received')
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()))
    
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      console.log('❌ Activity feed POST: Authentication failed')
      // For development, return success for mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Development mode: Returning success for mock data due to auth failure')
        const body = await request.json()
        const { action, activityId, reactionType, comment } = body
        
        console.log(`🔄 Mock activity feed action: ${action} for activity ${activityId}`)
        
        // Return appropriate responses for different actions
        switch (action) {
          case 'add_reaction':
            return NextResponse.json({ 
              success: true, 
              message: 'Reaction added (mock)',
              mockData: true
            })
          case 'remove_reaction':
            return NextResponse.json({ 
              success: true, 
              message: 'Reaction removed (mock)',
              mockData: true
            })
          case 'add_comment':
            return NextResponse.json({ 
              success: true, 
              message: 'Comment added (mock)',
              commentId: 'mock-comment-' + Date.now(),
              mockData: true
            })
          case 'mark_viewed':
            return NextResponse.json({ 
              success: true, 
              message: 'Activities marked as viewed (mock)',
              mockData: true
            })
          default:
            return NextResponse.json({ 
              success: true, 
              message: 'Mock response (development mode)',
              mockData: true
            })
        }
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ Activity feed POST: User authenticated:', user.id)

    const body = await request.json()
    const { action, activityId, reactionType, comment, commentId, parentCommentId, newComment } = body

    console.log(`🔄 Activity feed action: ${action} by user ${user.id}`)

    switch (action) {
      case 'add_reaction':
        if (!activityId || !reactionType) {
          return NextResponse.json({ error: 'Missing activityId or reactionType' }, { status: 400 })
        }
        
        const reactionResult = await activityLogger.addReaction(activityId, user.id, reactionType)
        if (!reactionResult.success) {
          return NextResponse.json({ error: reactionResult.error }, { status: 500 })
        }
        
        return NextResponse.json({ success: true, message: 'Reaction added' })

      case 'remove_reaction':
        if (!activityId || !reactionType) {
          return NextResponse.json({ error: 'Missing activityId or reactionType' }, { status: 400 })
        }
        
        const removeResult = await activityLogger.removeReaction(activityId, user.id, reactionType)
        if (!removeResult.success) {
          return NextResponse.json({ error: removeResult.error }, { status: 500 })
        }
        
        return NextResponse.json({ success: true, message: 'Reaction removed' })

      case 'add_comment':
        if (!activityId || !comment || comment.trim().length === 0) {
          return NextResponse.json({ error: 'Missing activityId or comment' }, { status: 400 })
        }
        
        if (comment.trim().length > 500) {
          return NextResponse.json({ error: 'Comment too long (max 500 characters)' }, { status: 400 })
        }
        
        const commentResult = await activityLogger.addComment(activityId, user.id, comment.trim())
        if (!commentResult.success) {
          return NextResponse.json({ error: commentResult.error }, { status: 500 })
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Comment added',
          commentId: commentResult.commentId
        })

      case 'edit_comment':
        if (!commentId || !newComment || newComment.trim().length === 0) {
          return NextResponse.json({ error: 'Missing commentId or newComment' }, { status: 400 })
        }
        
        if (newComment.trim().length > 500) {
          return NextResponse.json({ error: 'Comment too long (max 500 characters)' }, { status: 400 })
        }
        
        const editResult = await activityLogger.updateComment(commentId, user.id, newComment.trim())
        if (!editResult.success) {
          return NextResponse.json({ error: editResult.error }, { status: 500 })
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Comment updated'
        })

      case 'delete_comment':
        if (!commentId) {
          return NextResponse.json({ error: 'Missing commentId' }, { status: 400 })
        }
        
        const deleteResult = await activityLogger.deleteComment(commentId, user.id)
        if (!deleteResult.success) {
          return NextResponse.json({ error: deleteResult.error }, { status: 500 })
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Comment deleted'
        })

      case 'get_reaction_details':
        if (!activityId) {
          return NextResponse.json({ error: 'Missing activityId' }, { status: 400 })
        }
        
        const reactionDetailsResult = await activityLogger.getReactionDetails(activityId)
        if (!reactionDetailsResult.success) {
          return NextResponse.json({ error: reactionDetailsResult.error }, { status: 500 })
        }
        
        return NextResponse.json({ 
          success: true, 
          reactions: reactionDetailsResult.reactions
        })

      case 'mark_viewed':
        if (!Array.isArray(body.activityIds) || body.activityIds.length === 0) {
          return NextResponse.json({ error: 'Missing or invalid activityIds' }, { status: 400 })
        }
        
        const viewResult = await activityLogger.markActivitiesAsViewed(user.id, body.activityIds)
        if (!viewResult.success) {
          return NextResponse.json({ error: viewResult.error }, { status: 500 })
        }
        
        return NextResponse.json({ success: true, message: 'Activities marked as viewed' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('❌ Activity feed POST API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
