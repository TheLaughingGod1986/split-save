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
      author_id: note.author_id,
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
      author_id: note.author_id,
      created_at: note.created_at,
      updated_at: note.updated_at
    }

    return NextResponse.json(transformedNote, { status: 201 })
  } catch (error) {
    console.error('❌ Create shared note error:', error)
    return NextResponse.json({ error: 'Failed to create shared note' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const { id, content } = await req.json()

    if (!id || !content || !content.trim()) {
      return NextResponse.json({ error: 'Note ID and content are required' }, { status: 400 })
    }

    console.log('📝 Updating shared note:', id, 'for user:', user.id)

    // First, verify the note exists and user is the author
    const { data: existingNote, error: fetchError } = await supabaseAdmin
      .from('shared_notes')
      .select('id, author_id, partnership_id')
      .eq('id', id)
      .eq('partnership_id', user.partnershipId)
      .single()

    if (fetchError || !existingNote) {
      console.error('❌ Note not found or access denied:', fetchError)
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 })
    }

    if (existingNote.author_id !== user.id) {
      console.error('❌ User is not the author of this note')
      return NextResponse.json({ error: 'You can only edit your own notes' }, { status: 403 })
    }

    // Update the note
    const { data: note, error } = await supabaseAdmin
      .from('shared_notes')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      console.error('❌ Error updating shared note:', error)
      return NextResponse.json({ error: 'Failed to update shared note' }, { status: 500 })
    }

    console.log('✅ Updated shared note:', note.id)
    
    // Transform the data to include author name
    const transformedNote = {
      id: note.id,
      content: note.content,
      author: (note.users as any)?.name || (note.users as any)?.email || 'Unknown',
      author_id: note.author_id,
      created_at: note.created_at,
      updated_at: note.updated_at
    }

    return NextResponse.json(transformedNote)
  } catch (error) {
    console.error('❌ Update shared note error:', error)
    return NextResponse.json({ error: 'Failed to update shared note' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await authenticateRequest(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.partnershipId) {
    return NextResponse.json({ error: 'No active partnership' }, { status: 400 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    console.log('🗑️ Deleting shared note:', id, 'for user:', user.id)

    // First, verify the note exists and user is the author
    const { data: existingNote, error: fetchError } = await supabaseAdmin
      .from('shared_notes')
      .select('id, author_id, partnership_id')
      .eq('id', id)
      .eq('partnership_id', user.partnershipId)
      .single()

    if (fetchError || !existingNote) {
      console.error('❌ Note not found or access denied:', fetchError)
      return NextResponse.json({ error: 'Note not found or access denied' }, { status: 404 })
    }

    if (existingNote.author_id !== user.id) {
      console.error('❌ User is not the author of this note')
      return NextResponse.json({ error: 'You can only delete your own notes' }, { status: 403 })
    }

    // Delete the note
    const { error } = await supabaseAdmin
      .from('shared_notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting shared note:', error)
      return NextResponse.json({ error: 'Failed to delete shared note' }, { status: 500 })
    }

    console.log('✅ Deleted shared note:', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Delete shared note error:', error)
    return NextResponse.json({ error: 'Failed to delete shared note' }, { status: 500 })
  }
}
