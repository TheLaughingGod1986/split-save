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
    console.log('📝 Fetching shared notes for partnership:', user.partnershipId)
    
    const { data: notes, error } = await supabaseAdmin
      .from('shared_notes')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        author_id,
        users (
          name,
          email
        )
      `)
      .eq('partnership_id', user.partnershipId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching shared notes:', error)
      return NextResponse.json({ error: 'Failed to fetch shared notes' }, { status: 500 })
    }

    console.log('✅ Fetched shared notes:', notes?.length || 0)
    
    // Transform the data to include author name
    const transformedNotes = notes?.map(note => ({
      id: note.id,
      content: note.content,
      author: (note.users as any)?.name || (note.users as any)?.email || 'Unknown',
      created_at: note.created_at,
      updated_at: note.updated_at
    })) || []

    return NextResponse.json(transformedNotes)
  } catch (error) {
    console.error('❌ Get shared notes error:', error)
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

    console.log('📝 Creating shared note for partnership:', user.partnershipId)

    const { data: note, error } = await supabaseAdmin
      .from('shared_notes')
      .insert({
        partnership_id: user.partnershipId,
        author_id: user.id,
        content: content.trim()
      })
      .select(`
        id,
        content,
        created_at,
        updated_at,
        author_id,
        users (
          name,
          email
        )
      `)
      .single()

    if (error) {
      console.error('❌ Error creating shared note:', error)
      return NextResponse.json({ error: 'Failed to create shared note' }, { status: 500 })
    }

    console.log('✅ Created shared note:', note.id)
    
    // Transform the data to include author name
    const transformedNote = {
      id: note.id,
      content: note.content,
      author: (note.users as any)?.name || (note.users as any)?.email || 'Unknown',
      created_at: note.created_at,
      updated_at: note.updated_at
    }

    return NextResponse.json(transformedNote, { status: 201 })
  } catch (error) {
    console.error('❌ Create shared note error:', error)
    return NextResponse.json({ error: 'Failed to create shared note' }, { status: 500 })
  }
}
