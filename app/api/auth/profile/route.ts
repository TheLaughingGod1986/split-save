import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { userProfileSchema } from '@/lib/validation'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user data and profile data with a join
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        profile:user_profiles(*)
      `)
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Merge user and profile data
    const mergedProfile = {
      ...profile,
      ...profile.profile,
      profile: undefined // Remove the nested profile object
    }

    console.log('Backend GET profile:', mergedProfile)
    return NextResponse.json(mergedProfile)
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('Backend received body:', body)
    
    const updates = userProfileSchema.parse(body)
    console.log('Backend parsed updates:', updates)

    // Separate user updates from profile updates
    const userUpdates: any = {}
    const profileUpdates: any = {}

    // User table fields
    if (updates.name !== undefined) userUpdates.name = updates.name

    // Profile table fields
    if (updates.country_code !== undefined) profileUpdates.country_code = updates.country_code
    if (updates.currency !== undefined) profileUpdates.currency = updates.currency
    if (updates.income !== undefined) profileUpdates.income = updates.income
    if (updates.payday !== undefined) profileUpdates.payday = updates.payday
    if (updates.personal_allowance !== undefined) profileUpdates.personal_allowance = updates.personal_allowance

    // Update user table if needed
    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updated_at = new Date().toISOString()
      const { error: userError } = await supabaseAdmin
        .from('users')
        .update(userUpdates)
        .eq('id', user.id)

      if (userError) {
        console.error('User update error:', userError)
        return NextResponse.json({ error: 'Failed to update user data' }, { status: 400 })
      }
    }

    // Update profile table if needed
    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString()
      
      // Check if profile exists, if not create it
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .update(profileUpdates)
          .eq('user_id', user.id)

        if (profileError) {
          console.error('Profile update error:', profileError)
          return NextResponse.json({ error: 'Failed to update profile data' }, { status: 400 })
        }
      } else {
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert({
            user_id: user.id,
            ...profileUpdates
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          return NextResponse.json({ error: 'Failed to create profile data' }, { status: 400 })
        }
      }
    }

    // Get the updated profile
    const { data: updatedProfile, error: fetchError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        profile:user_profiles(*)
      `)
      .eq('id', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch updated profile' }, { status: 500 })
    }

    // Merge user and profile data
    const mergedProfile = {
      ...updatedProfile,
      ...updatedProfile.profile,
      profile: undefined
    }

    console.log('Backend updated profile:', mergedProfile)
    return NextResponse.json(mergedProfile)
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  }
}
