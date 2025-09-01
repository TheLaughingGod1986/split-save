import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🤖 ML API: Getting adaptive recommendations for user:', user.id)

          // Get active adaptive recommendations
      const { data: recommendations, error } = await supabaseAdmin
        .from('adaptive_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .is('dismissed_at', null)
        .order('confidence', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ ML API: Failed to get recommendations:', error)
      return NextResponse.json(
        { error: 'Failed to retrieve recommendations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      recommendations: recommendations || [],
      message: 'Recommendations retrieved successfully'
    })
  } catch (error) {
    console.error('❌ ML API: Failed to get recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve recommendations' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { recommendationId, action, feedback } = body

    console.log('🤖 ML API: Processing recommendation action:', {
      userId: user.id,
      recommendationId,
      action,
      feedback
    })

    let updateData: any = {}

    switch (action) {
      case 'apply':
        updateData = {
          applied_at: new Date().toISOString(),
          is_active: false
        }
        break
      case 'dismiss':
        updateData = {
          dismissed_at: new Date().toISOString(),
          is_active: false
        }
        break
      case 'feedback':
        updateData = {
          feedback_rating: feedback?.rating,
          feedback_comment: feedback?.comment
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const { error } = await supabaseAdmin
      .from('adaptive_recommendations')
      .update(updateData)
      .eq('id', recommendationId)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ ML API: Failed to update recommendation:', error)
      return NextResponse.json(
        { error: 'Failed to update recommendation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendation action processed successfully'
    })
  } catch (error) {
    console.error('❌ ML API: Failed to process recommendation action:', error)
    return NextResponse.json(
      { error: 'Failed to process recommendation action' },
      { status: 500 }
    )
  }
}
