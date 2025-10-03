import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    // Clear the current session
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error clearing session:', error)
      return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Session cleared successfully' })
  } catch (error) {
    console.error('Clear session error:', error)
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 })
  }
}
