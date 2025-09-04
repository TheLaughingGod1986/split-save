import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  console.log('=== PRIVACY PREFERENCES API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { dataSharing, analytics, marketing, partnerVisibility, dataRetention } = body

    // Validate the preferences
    const validPreferences = {
      dataSharing: typeof dataSharing === 'boolean' ? dataSharing : true,
      analytics: typeof analytics === 'boolean' ? analytics : true,
      marketing: typeof marketing === 'boolean' ? marketing : false,
      partnerVisibility: ['full', 'limited', 'minimal'].includes(partnerVisibility) ? partnerVisibility : 'full',
      dataRetention: ['30days', '90days', '1year', 'indefinite'].includes(dataRetention) ? dataRetention : '1year'
    }

    // Store preferences in user_profiles table
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        privacy_preferences: validPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Privacy preferences update error:', updateError)
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
    }

    console.log('Privacy preferences saved successfully for user:', user.id)

    return NextResponse.json({
      success: true,
      message: 'Privacy preferences saved successfully',
      preferences: validPreferences
    })
  } catch (error) {
    console.error('Privacy preferences method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== PRIVACY PREFERENCES API ROUTE END ===')
  }
}

export async function GET(request: NextRequest) {
  console.log('=== GET PRIVACY PREFERENCES API ROUTE START ===')
  
  try {
    const user = await authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current privacy preferences
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('privacy_preferences')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      console.error('Privacy preferences fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
    }

    const preferences = profile?.privacy_preferences || {
      dataSharing: true,
      analytics: true,
      marketing: false,
      partnerVisibility: 'full',
      dataRetention: '1year'
    }

    return NextResponse.json({
      success: true,
      preferences: preferences
    })
  } catch (error) {
    console.error('Get privacy preferences method error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    console.log('=== GET PRIVACY PREFERENCES API ROUTE END ===')
  }
}
