import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { mlLearningEngine } from '@/lib/ml-learning-engine'

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🤖 ML API: Analyzing behavior for user:', user.id)

    // Analyze user behavior
    const analysis = await mlLearningEngine.analyzeUserBehavior(user.id)

    // Generate adaptive recommendations
    const recommendations = await mlLearningEngine.generateAdaptiveRecommendations(user.id)

    return NextResponse.json({
      success: true,
      analysis,
      recommendations,
      message: 'Behavior analysis completed successfully'
    })
  } catch (error) {
    console.error('❌ ML API: Behavior analysis failed:', error)
    return NextResponse.json(
      { error: 'Failed to analyze behavior' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🤖 ML API: Getting behavior analysis for user:', user.id)

    // Get latest behavior analysis
    const analysis = await mlLearningEngine['getLatestBehaviorAnalysis'](user.id)

    if (!analysis) {
      return NextResponse.json({
        success: true,
        analysis: null,
        message: 'No behavior analysis found'
      })
    }

    return NextResponse.json({
      success: true,
      analysis,
      message: 'Behavior analysis retrieved successfully'
    })
  } catch (error) {
    console.error('❌ ML API: Failed to get behavior analysis:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve behavior analysis' },
      { status: 500 }
    )
  }
}
