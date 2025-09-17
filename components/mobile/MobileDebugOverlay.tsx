'use client'

import React, { useState, useEffect } from 'react'

export function MobileDebugOverlay() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateDebugInfo = () => {
      const overlays = document.querySelectorAll('[class*="fixed"], [class*="z-"], [style*="position: fixed"]')
      const highZIndexElements = Array.from(overlays)
        .map(el => {
          const styles = window.getComputedStyle(el)
          const zIndex = styles.zIndex
          const pointerEvents = styles.pointerEvents
          const position = styles.position
          const rect = el.getBoundingClientRect()
          
          return {
            element: el.tagName + (el.className ? `.${el.className.split(' ').join('.')}` : ''),
            zIndex: zIndex !== 'auto' ? parseInt(zIndex) : 0,
            pointerEvents,
            position,
            visible: rect.width > 0 && rect.height > 0,
            area: rect.width * rect.height,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          }
        })
        .filter(info => info.zIndex > 30 || info.pointerEvents === 'none')
        .sort((a, b) => b.zIndex - a.zIndex)

      setDebugInfo({
        overlayCount: overlays.length,
        highZIndexElements: highZIndexElements.slice(0, 10), // Top 10
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        userAgent: navigator.userAgent
      })
    }

    updateDebugInfo()
    
    // Update on resize or touch
    window.addEventListener('resize', updateDebugInfo)
    window.addEventListener('touchstart', updateDebugInfo)
    
    return () => {
      window.removeEventListener('resize', updateDebugInfo)
      window.removeEventListener('touchstart', updateDebugInfo)
    }
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 left-4 z-[9999] bg-red-500 text-white px-2 py-1 rounded text-xs font-mono"
        style={{ pointerEvents: 'auto' }}
      >
        DEBUG
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center p-4" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-lg p-4 max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Mobile Overlay Debug</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
        
        <div className="space-y-4 text-sm font-mono">
          <div>
            <strong>Viewport:</strong> {debugInfo.viewport?.width}x{debugInfo.viewport?.height}
          </div>
          
          <div>
            <strong>Total Overlays:</strong> {debugInfo.overlayCount}
          </div>
          
          <div>
            <strong>High Z-Index Elements:</strong>
            {debugInfo.highZIndexElements?.map((el: any, i: number) => (
              <div key={i} className="ml-2 p-2 bg-gray-100 rounded mt-1">
                <div><strong>Element:</strong> {el.element}</div>
                <div><strong>Z-Index:</strong> {el.zIndex}</div>
                <div><strong>Pointer Events:</strong> {el.pointerEvents}</div>
                <div><strong>Position:</strong> {el.position}</div>
                <div><strong>Visible:</strong> {el.visible ? 'Yes' : 'No'}</div>
                <div><strong>Area:</strong> {el.area}px²</div>
                <div><strong>Rect:</strong> {el.rect.top},{el.rect.left} {el.rect.width}x{el.rect.height}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
