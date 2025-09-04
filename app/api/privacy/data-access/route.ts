import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('=== DATA ACCESS REQUEST API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a data access request record
    const { error: insertError } = await supabaseAdmin
      .from('data_access_requests')
      .insert({
        user_id: user.id,
        request_type: 'data_access',
        status: 'pending',
        requested_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })

    if (insertError) {
      console.error('Data access request insert error:', insertError)
      return NextResponse.json({ error: 'Failed to submit data access request' }, { status: 500 })
    }

    // In a real implementation, you would:
    // 1. Send an email notification to the user
    // 2. Create a ticket in your support system
    // 3. Log the request for compliance tracking
    // 4. Set up automated data processing workflow

    console.log('Data access request submitted for user:', user.id)

    return NextResponse.json({
      success: true,
      message: 'Data access request submitted successfully. You will receive a response within 30 days.',
      requestId: `DAR-${Date.now()}` // Simple request ID for user reference
    })
  } catch (error) {
    console.error('Data access request method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== DATA ACCESS REQUEST API ROUTE END ===')
  }
}

export async function GET(request: NextRequest) {
  console.log('=== GET DATA ACCESS REQUESTS API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's data access requests
    const { data: requests, error: fetchError } = await supabaseAdmin
      .from('data_access_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('requested_at', { ascending: false })

    if (fetchError) {
      console.error('Data access requests fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch data access requests' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      requests: requests || []
    })
  } catch (error) {
    console.error('Get data access requests method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== GET DATA ACCESS REQUESTS API ROUTE END ===')
  }
}
