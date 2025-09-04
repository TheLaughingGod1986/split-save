import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { financialForecastingEngine } from '@/lib/financial-forecasting-engine'
import { z } from 'zod'

const generateForecastSchema = z.object({
  timeframe: z.enum(['3months', '6months', '12months', '24months', '5years']).optional().default('12months')
})

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { timeframe } = generateForecastSchema.parse(body)

    console.log('🔮 API: Generating forecast for user:', user.id, 'Timeframe:', timeframe)

    // Generate forecast
    const forecast = await financialForecastingEngine.generateFinancialForecast(user.id, timeframe)

    return NextResponse.json({
      success: true,
      forecast,
      message: 'Financial forecast generated successfully'
    })

  } catch (error) {
    console.error('❌ API: Error generating forecast:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Failed to generate forecast',
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
    const forecastType = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '5')

    console.log('🔮 API: Fetching forecasts for user:', user.id)

    // Build query
    let query = supabase
      .from('financial_forecasts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (forecastType) {
      query = query.eq('forecast_type', forecastType)
    }

    const { data: forecasts, error } = await query

    if (error) {
      console.error('❌ API: Error fetching forecasts:', error)
      return NextResponse.json({ error: 'Failed to fetch forecasts' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      forecasts: forecasts || [],
      message: 'Forecasts retrieved successfully'
    })

  } catch (error) {
    console.error('❌ API: Error fetching forecasts:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch forecasts',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
