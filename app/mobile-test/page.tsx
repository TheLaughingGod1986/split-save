'use client'

import { useEffect, useState } from 'react'

export default function MobileTest() {
  const [mounted, setMounted] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)
  const [userAgent, setUserAgent] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    setScreenWidth(window.innerWidth)
    setUserAgent(navigator.userAgent)
    setIsMobile(/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent))
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-red-500 p-4">
        <div className="bg-white rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Mobile Test Page - Loading...
          </h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-500 p-4">
      <div className="bg-white rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Mobile Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this on mobile, the basic routing is working.
        </p>
        <div className="space-y-2">
          <p className="text-sm">Screen width: <span className="font-mono">{screenWidth}</span></p>
          <p className="text-sm">User agent: <span className="font-mono text-xs break-all">{userAgent}</span></p>
          <p className="text-sm">Is mobile: <span className="font-mono">{isMobile ? 'Yes' : 'No'}</span></p>
        </div>
        <div className="mt-4 p-4 bg-blue-100 rounded">
          <p className="text-sm text-blue-800">
            This is a test page to debug mobile issues. 
            If you can see this, the mobile site is working.
          </p>
        </div>
      </div>
    </div>
  )
}
