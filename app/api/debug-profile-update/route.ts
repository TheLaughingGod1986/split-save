import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('🔍 Debug profile update - received body:', body)
    
    // Get user from session
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      console.error('❌ Debug profile update - user error:', userError)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    
    console.log('🔍 Debug profile update - user:', user.id, user.email)
    
    // Check current profile
    const { data: currentProfile, error: currentError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        profile:user_profiles(*)
      `)
      .eq('id', user.id)
      .single()
    
    if (currentError) {
      console.error('❌ Debug profile update - current profile error:', currentError)
      return NextResponse.json({ error: 'Failed to fetch current profile' }, { status: 500 })
    }
    
    console.log('🔍 Debug profile update - current profile:', currentProfile)
    
    // Try to update profile
    const updates = {
      name: body.name || 'Test User',
      income: body.income || 4000,
      payday: body.payday || 'last_friday',
      personal_allowance: body.personal_allowance || 0,
      currency: body.currency || 'GBP',
      country_code: body.country_code || 'GB'
    }
    
    console.log('🔍 Debug profile update - updates:', updates)
    
    // Update user table
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({
        name: updates.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (userUpdateError) {
      console.error('❌ Debug profile update - user update error:', userUpdateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
    
    // Update or create profile
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    if (existingProfile) {
      const { error: profileUpdateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      if (profileUpdateError) {
        console.error('❌ Debug profile update - profile update error:', profileUpdateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }
    } else {
      const { error: profileCreateError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: user.id,
          ...updates
        })
      
      if (profileCreateError) {
        console.error('❌ Debug profile update - profile create error:', profileCreateError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
    }
    
    // Fetch updated profile
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        profile:user_profiles(*)
      `)
      .eq('id', user.id)
      .single()
    
    if (fetchError) {
      console.error('❌ Debug profile update - fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch updated profile' }, { status: 500 })
    }
    
    // Merge user and profile data
    const mergedProfile = {
      ...updatedProfile,
      ...updatedProfile.profile,
      profile: undefined
    }
    
    console.log('✅ Debug profile update - success:', mergedProfile)
    
    return NextResponse.json({
      success: true,
      profile: mergedProfile,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    console.error('❌ Debug profile update - error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
