import { NextRequest, NextResponse } from 'next/server'
import { AuthCleanup } from '@/lib/auth-cleanup'

export async function POST(req: NextRequest) {
  try {
    console.log('🧹 Manual auth cleanup requested')
    
    await AuthCleanup.clearAllAuthData()
    
    return NextResponse.json({
      success: true,
      message: 'Authentication data cleared successfully'
    })
    
  } catch (error) {
    console.error('❌ Error clearing auth data:', error)
    return NextResponse.json({ 
      error: 'Failed to clear auth data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Checking session validity')
    
    const isValid = await AuthCleanup.isSessionValid()
    
    return NextResponse.json({
      success: true,
      sessionValid: isValid,
      message: isValid ? 'Session is valid' : 'Session is invalid'
    })
    
  } catch (error) {
    console.error('❌ Error checking session:', error)
    return NextResponse.json({ 
      error: 'Failed to check session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
