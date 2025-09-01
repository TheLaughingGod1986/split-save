import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { mlLearningEngine } from '@/lib/ml-learning-engine'
import { z } from 'zod'

const underSavingSchema = z.object({
  reason: z.string().min(1, 'Reason is required'),
  context: z.object({
    goalId: z.string().optional(),
    expectedAmount: z.number().optional(),
    actualAmount: z.number().optional(),
    month: z.string().optional(),
    year: z.number().optional(),
    additionalNotes: z.string().optional()
  }).optional()
})

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validatedData = underSavingSchema.parse(body)

    console.log('🤖 ML API: Learning from under-saving behavior:', {
      userId: user.id,
      reason: validatedData.reason,
      context: validatedData.context
    })

    // Learn from under-saving behavior
    await mlLearningEngine.learnFromUnderSaving(
      user.id,
      validatedData.reason,
      validatedData.context || {}
    )

    // Generate new recommendations based on learning
    const recommendations = await mlLearningEngine.generateAdaptiveRecommendations(user.id)

    return NextResponse.json({
      success: true,
      recommendations,
      message: 'Successfully learned from under-saving behavior'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ ML API: Validation error:', error.errors)
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('❌ ML API: Failed to learn from under-saving behavior:', error)
    return NextResponse.json(
      { error: 'Failed to process under-saving learning' },
      { status: 500 }
    )
  }
}
