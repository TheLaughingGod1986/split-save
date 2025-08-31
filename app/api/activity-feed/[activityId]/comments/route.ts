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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { activityId } = params
    if (!activityId) {
      return NextResponse.json({ error: 'Missing activityId' }, { status: 400 })
    }

    console.log(`🔄 Fetching comments for activity ${activityId}`)

    // Get comments for the activity
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
