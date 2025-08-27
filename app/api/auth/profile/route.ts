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
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('Backend GET profile:', profile)
    return NextResponse.json(profile)
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

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Backend update error:', error)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 400 })
    }

    console.log('Backend updated profile:', profile)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Invalid input data' }, { status: 400 })
  }
}
