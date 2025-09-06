import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('🤝 Setting up demo partnership for user:', user.id)

    // Check if user already has a partnership
    const { data: existingPartnership, error: checkError } = await supabaseAdmin
      .from('partnerships')
      .select('id, status')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single()

    if (existingPartnership && !checkError) {
      console.log('🤝 User already has partnership:', existingPartnership.id)
      return NextResponse.json({ 
        message: 'Partnership already exists',
        partnershipId: existingPartnership.id,
        status: existingPartnership.status
      })
    }

    // Create a demo partnership (user is both user1 and user2 for demo purposes)
    const { data: partnership, error } = await supabaseAdmin
      .from('partnerships')
      .insert({
        user1_id: user.id,
        user2_id: user.id, // Demo: same user for both sides
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, status, user1_id, user2_id')
      .single()

    if (error) {
      console.error('❌ Error creating demo partnership:', error)
      return NextResponse.json({ error: 'Failed to create partnership' }, { status: 500 })
    }

    console.log('✅ Created demo partnership:', partnership.id)

    return NextResponse.json({
      message: 'Demo partnership created successfully',
      partnershipId: partnership.id,
      status: partnership.status
    })
  } catch (error) {
    console.error('❌ Setup demo partnership error:', error)
    return NextResponse.json({ error: 'Failed to setup demo partnership' }, { status: 500 })
  }
}
