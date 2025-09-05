import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { activityLogger } from '@/lib/activity-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      // For development, return mock replies instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Development mode: Returning mock replies due to auth failure')
        const mockReplies = [
          {
            id: 'mock-reply-1',
            user_id: 'mock-user',
            comment: 'Thanks for the feedback!',
            is_edited: false,
            parent_comment_id: params.commentId,
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
            updated_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            user_name: 'Ben',
            user_avatar: undefined
          }
        ]
        
        return NextResponse.json({
          replies: mockReplies,
          count: mockReplies.length,
          mockData: true
        })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { commentId } = params
    if (!commentId) {
      return NextResponse.json({ error: 'Missing commentId' }, { status: 400 })
    }

    console.log(`🔄 Fetching replies for comment ${commentId}`)

    // Get replies for the comment
    const result = await activityLogger.getCommentReplies(commentId)
    
    if (!result.success) {
      console.error('❌ Error fetching replies:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${result.replies?.length || 0} replies`)

    return NextResponse.json({
      replies: result.replies || [],
      count: result.replies?.length || 0
    })

  } catch (error) {
    console.error('❌ Comment replies API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

