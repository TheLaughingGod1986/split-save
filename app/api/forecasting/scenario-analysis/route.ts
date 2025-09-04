import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { financialForecastingEngine, ScenarioModification } from '@/lib/financial-forecasting-engine'
import { z } from 'zod'

const scenarioAnalysisSchema = z.object({
  scenarioName: z.string().min(1, 'Scenario name is required'),
  modifications: z.array(z.object({
    type: z.enum(['increase_contribution', 'decrease_contribution', 'adjust_goal', 'change_priority', 'income_change']),
    target: z.string(),
    value: z.number(),
    description: z.string()
  })).min(1, 'At least one modification is required')
})

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { scenarioName, modifications } = scenarioAnalysisSchema.parse(body)

    console.log('🔮 API: Generating scenario analysis for user:', user.id, 'Scenario:', scenarioName)

    // Generate scenario analysis
    const scenarioAnalysis = await financialForecastingEngine.generateScenarioAnalysis(
      user.id, 
      scenarioName, 
      modifications as ScenarioModification[]
    )

    return NextResponse.json({
      success: true,
      scenarioAnalysis,
      message: 'Scenario analysis generated successfully'
    })

  } catch (error) {
    console.error('❌ API: Error generating scenario analysis:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to generate scenario analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    console.log('🔮 API: Fetching scenario analyses for user:', user.id)

    // Fetch scenario analyses
    const { data: scenarios, error } = await supabase
      .from('scenario_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ API: Error fetching scenario analyses:', error)
      return NextResponse.json({ error: 'Failed to fetch scenario analyses' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      scenarios: scenarios || [],
      message: 'Scenario analyses retrieved successfully'
    })

  } catch (error) {
    console.error('❌ API: Error fetching scenario analyses:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch scenario analyses',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
