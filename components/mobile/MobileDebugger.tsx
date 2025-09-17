'use client'

import { useState } from 'react'

export function MobileDebugger() {
  const [clickCount, setClickCount] = useState(0)
  const [touchInfo, setTouchInfo] = useState('')

  const handleClick = () => {
    setClickCount(prev => prev + 1)
    console.log('✅ Button clicked successfully!', clickCount + 1)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchInfo(`Touch started: ${e.touches.length} touch(es)`)
    console.log('👆 Touch start:', e.touches.length)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchInfo(prev => prev + ` | Touch ended`)
    console.log('👆 Touch end')
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-[9999] bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-500 rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-2">
        🔧 Mobile Debug Panel
      </h3>
      
      <div className="space-y-2 text-xs text-yellow-700 dark:text-yellow-300">
        <p>Click count: <strong>{clickCount}</strong></p>
        <p>Touch info: <strong>{touchInfo || 'No touches yet'}</strong></p>
        <p>User agent: <strong>{typeof window !== 'undefined' ? window.navigator.userAgent.slice(0, 50) + '...' : 'SSR'}</strong></p>
      </div>

      <div className="mt-3 space-y-2">
        <button
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium active:bg-blue-700 transition-colors"
        >
          Test Button (Clicks: {clickCount})
        </button>
        
        <button
          onClick={() => {
            setClickCount(0)
            setTouchInfo('')
          }}
          className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg font-medium active:bg-gray-700 transition-colors text-sm"
        >
          Reset
        </button>
      </div>

      <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
        💡 If buttons don't work, check console for errors
      </div>
    </div>
  )
}
