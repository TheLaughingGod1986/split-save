import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the partnership
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', params.id)
      .single()

    if (partnershipError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found' }, { status: 404 })
    }

    // Check if user is part of this partnership
    if (partnership.user1_id !== user.id && partnership.user2_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized for this partnership' }, { status: 403 })
    }

    // Get both partners' profiles
    const { data: user1Profile, error: user1Error } = await supabase
      .from('profiles')
      .select('id, name, email, income, currency, country_code')
      .eq('user_id', partnership.user1_id)
      .single()

    const { data: user2Profile, error: user2Error } = await supabase
      .from('profiles')
      .select('id, name, email, income, currency, country_code')
      .eq('user_id', partnership.user2_id)
      .single()

    if (user1Error || user2Error) {
      return NextResponse.json({ error: 'Failed to fetch partner profiles' }, { status: 500 })
    }

    return NextResponse.json({
      partnership,
      user1Profile,
      user2Profile
    })

  } catch (error) {
    console.error('Partnership profiles error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
