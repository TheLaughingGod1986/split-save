import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: partnerships, error } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'active')

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
    }

    return NextResponse.json(partnerships)
  } catch (error) {
    console.error('Get partnerships error:', error)
    return NextResponse.json({ error: 'Failed to fetch partnerships' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const partnershipId = searchParams.get('id')
    
    if (!partnershipId) {
      return NextResponse.json({ error: 'Partnership ID required' }, { status: 400 })
    }

    // Verify the user is part of this partnership
    const { data: partnership, error: fetchError } = await supabaseAdmin
      .from('partnerships')
      .select('*')
      .eq('id', partnershipId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single()

    if (fetchError || !partnership) {
      return NextResponse.json({ error: 'Partnership not found or access denied' }, { status: 404 })
    }

    // Soft delete by setting status to 'removed'
    const { error: deleteError } = await supabaseAdmin
      .from('partnerships')
      .update({ 
        status: 'removed',
        updated_at: new Date().toISOString()
      })
      .eq('id', partnershipId)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove partnership' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Partnership removed successfully' })
  } catch (error) {
    console.error('Remove partnership error:', error)
    return NextResponse.json({ error: 'Failed to remove partnership' }, { status: 500 })
  }
}
