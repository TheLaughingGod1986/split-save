import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { financialForecastingEngine } from '@/lib/financial-forecasting-engine'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔮 API: Assessing financial risks for user:', user.id)

    // Assess financial risks
    const riskAssessment = await financialForecastingEngine.assessFinancialRisks(user.id)

    return NextResponse.json({
      success: true,
      riskAssessment,
      message: 'Risk assessment completed successfully'
    })

  } catch (error) {
    console.error('❌ API: Error assessing financial risks:', error)
    return NextResponse.json({ 
      error: 'Failed to assess financial risks',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔮 API: Fetching risk assessments for user:', user.id)

    // Fetch latest risk assessment
    const { data: riskAssessment, error } = await supabase
      .from('risk_assessments')
      .select('*')
      .eq('user_id', user.id)
      .order('last_assessed', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('❌ API: Error fetching risk assessment:', error)
      return NextResponse.json({ error: 'Failed to fetch risk assessment' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      riskAssessment: riskAssessment || null,
      message: 'Risk assessment retrieved successfully'
    })

  } catch (error) {
    console.error('❌ API: Error fetching risk assessment:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch risk assessment',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
