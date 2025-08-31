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
    // This would fetch shared notes from a shared_notes table
    // For now, return empty array as feature is not fully implemented
    return NextResponse.json([])
  } catch (error) {
    console.error('Get shared notes error:', error)
    return NextResponse.json({ error: 'Failed to fetch shared notes' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
    }

    // This would save to a shared_notes table
    // For now, return success as feature is not fully implemented
    const note = {
      id: `note_${Date.now()}`,
      content: content.trim(),
      author_id: user.id,
      partnership_id: user.partnershipId,
      created_at: new Date().toISOString()
    }

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Create shared note error:', error)
    return NextResponse.json({ error: 'Failed to create shared note' }, { status: 500 })
  }
}
