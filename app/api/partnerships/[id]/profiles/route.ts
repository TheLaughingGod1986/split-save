import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const partnershipId = params.id

  try {
    // First verify the user is part of this partnership
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')
      .single()

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found or unauthorized' }, { status: 404 })
    }

    // Get both users' profiles from the partnership
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        profile:user_profiles(*)
      `)
      .in('id', [partnership.user1_id, partnership.user2_id])

    if (profilesError) {
      console.error('Error fetching partnership profiles:', profilesError)
      return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
    }

    // Merge user and profile data for each user
    const mergedProfiles = profiles.map(profile => ({
      ...profile,
      ...profile.profile,
      profile: undefined // Remove the nested profile object
    }))

    return NextResponse.json(mergedProfiles)
  } catch (error) {
    console.error('Get partnership profiles error:', error)
    return NextResponse.json({ error: 'Failed to fetch partnership profiles' }, { status: 500 })
  }
}