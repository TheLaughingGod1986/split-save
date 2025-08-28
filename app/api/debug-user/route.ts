import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  console.log('=== DEBUG USER API START ===')
  const user = await authenticateRequest(request)
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('User authenticated:', user)
  
  return NextResponse.json({
    message: 'User authenticated successfully',
    user: {
      id: user.id,
      email: user.email
    }
  })
}
