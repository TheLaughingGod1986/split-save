import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { activityLogger } from '@/lib/activity-logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    // Authenticate the request
    const user = await authenticateRequest(request)
    if (!user) {
      // For development, return mock comments instead of failing
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Development mode: Returning mock comments due to auth failure')
        const mockComments = [
          {
            id: 'mock-comment-1',
            activity_id: params.activityId,
            user_id: 'mock-user',
            comment: 'Great job on this expense!',
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            user_name: 'Ben',
            user_avatar: undefined
          }
        ]
        
        return NextResponse.json({
          comments: mockComments,
          count: mockComments.length,
          mockData: true
        })
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activityId } = params
    if (!activityId) {
      return NextResponse.json({ error: 'Missing activityId' }, { status: 400 })
    }

    console.log(`🔄 Fetching comments for activity ${activityId}`)

    // Get comments for the activity using direct query
    const result = await activityLogger.getActivityComments(activityId)
    
    if (!result.success) {
      console.error('❌ Error fetching comments:', result.error)
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    console.log(`✅ Successfully fetched ${result.comments?.length || 0} comments`)

    return NextResponse.json({
      comments: result.comments || [],
      count: result.comments?.length || 0
    })

  } catch (error) {
    console.error('❌ Activity comments API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
