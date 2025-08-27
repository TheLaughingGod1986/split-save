import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const { data: approvals, error } = await supabaseAdmin
      .from('approval_requests')
      .select(`
        *,
        requested_by_user:users!approval_requests_requested_by_user_id_fkey(id, name)
      `)
      .eq('partnership_id', user.partnershipId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Approvals fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
    }

    return NextResponse.json(approvals)
  } catch (error) {
    console.error('Get approvals error:', error)
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 })
  }
}
