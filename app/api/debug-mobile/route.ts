import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent') || ''
    
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
    const isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase())
    const isAndroid = /android/i.test(userAgent.toLowerCase())
    const isSafari = /safari/i.test(userAgent.toLowerCase()) && !/chrome/i.test(userAgent.toLowerCase())
    
    return NextResponse.json({
      success: true,
      mobile: {
        isMobile,
        isIOS,
        isAndroid,
        isSafari,
        userAgent: userAgent.substring(0, 100) + '...' // Truncate for privacy
      },
      recommendations: {
        scrolling: isMobile ? 'Should be enabled with touch scrolling' : 'Standard scrolling',
        loading: isMobile ? 'Should timeout after 1-2 seconds' : 'Standard loading',
        pwa: isMobile ? 'PWA features should be active' : 'Desktop mode'
      }
    })
    
  } catch (error) {
    console.error('❌ Debug mobile error:', error)
    return NextResponse.json({ 
      error: 'Failed to debug mobile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
