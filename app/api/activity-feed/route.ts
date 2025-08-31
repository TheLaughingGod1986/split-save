import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { activityLogger } from '@/lib/activity-logger'

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, activityId, reactionType, comment } = body

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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
