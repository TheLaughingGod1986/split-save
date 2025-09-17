'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { serviceWorkerUtils } from '@/lib/service-worker'

export function PWAAuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const gatherDebugInfo = async () => {
      try {
        // PWA Detection
        const isPWA = serviceWorkerUtils.isPWA()
        const isStandalone = serviceWorkerUtils.isStandalone()
        
        // Storage Tests
        const canUseLocalStorage = (() => {
          try {
            localStorage.setItem('test', 'test')
            localStorage.removeItem('test')
            return true
          } catch {
            return false
          }
        })()
        
        const canUseSessionStorage = (() => {
          try {
            sessionStorage.setItem('test', 'test')
            sessionStorage.removeItem('test')
            return true
          } catch {
            return false
          }
        })()
        
        // Supabase Session Check
        let sessionInfo = null
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          sessionInfo = {
            hasSession: !!session,
            hasUser: !!session?.user,
            hasAccessToken: !!session?.access_token,
            error: error?.message
          }
        } catch (error) {
          sessionInfo = { error: error instanceof Error ? error.message : 'Unknown error' }
        }
        
        // Network Info
        const online = navigator.onLine
        const connection = (navigator as any).connection
        
        setDebugInfo({
          timestamp: new Date().toISOString(),
          pwa: {
            isPWA,
            isStandalone,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
            userAgent: navigator.userAgent.substring(0, 100)
          },
          storage: {
            localStorage: canUseLocalStorage,
            sessionStorage: canUseSessionStorage,
            indexedDB: 'indexedDB' in window,
            cookies: navigator.cookieEnabled
          },
          session: sessionInfo,
          network: {
            online,
            effectiveType: connection?.effectiveType,
            downlink: connection?.downlink
          },
          supabase: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          },
          location: {
            protocol: window.location.protocol,
            host: window.location.host,
            pathname: window.location.pathname
          }
        })
      } catch (error) {
        setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }

    gatherDebugInfo()
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-[9999] bg-blue-500 text-white px-2 py-1 rounded text-xs font-mono"
        style={{ pointerEvents: 'auto' }}
      >
        PWA DEBUG
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-75 flex items-center justify-center p-4" style={{ pointerEvents: 'auto' }}>
      <div className="bg-white rounded-lg p-4 max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">PWA Authentication Debug</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
        
        <div className="space-y-4 text-sm font-mono">
          {/* PWA Status */}
          <div>
            <strong className="text-blue-600">PWA Status:</strong>
            <div className="ml-2 p-2 bg-gray-100 rounded mt-1">
              <div>Is PWA: {debugInfo.pwa?.isPWA ? '✅ Yes' : '❌ No'}</div>
              <div>Is Standalone: {debugInfo.pwa?.isStandalone ? '✅ Yes' : '❌ No'}</div>
              <div>Display Mode: {debugInfo.pwa?.displayMode}</div>
            </div>
          </div>

          {/* Storage Status */}
          <div>
            <strong className="text-green-600">Storage:</strong>
            <div className="ml-2 p-2 bg-gray-100 rounded mt-1">
              <div>LocalStorage: {debugInfo.storage?.localStorage ? '✅ Available' : '❌ Blocked'}</div>
              <div>SessionStorage: {debugInfo.storage?.sessionStorage ? '✅ Available' : '❌ Blocked'}</div>
              <div>IndexedDB: {debugInfo.storage?.indexedDB ? '✅ Available' : '❌ Not available'}</div>
              <div>Cookies: {debugInfo.storage?.cookies ? '✅ Enabled' : '❌ Disabled'}</div>
            </div>
          </div>

          {/* Session Status */}
          <div>
            <strong className="text-purple-600">Authentication:</strong>
            <div className="ml-2 p-2 bg-gray-100 rounded mt-1">
              {debugInfo.session?.error ? (
                <div className="text-red-600">Error: {debugInfo.session.error}</div>
              ) : (
                <>
                  <div>Has Session: {debugInfo.session?.hasSession ? '✅ Yes' : '❌ No'}</div>
                  <div>Has User: {debugInfo.session?.hasUser ? '✅ Yes' : '❌ No'}</div>
                  <div>Has Token: {debugInfo.session?.hasAccessToken ? '✅ Yes' : '❌ No'}</div>
                </>
              )}
            </div>
          </div>

          {/* Network Status */}
          <div>
            <strong className="text-orange-600">Network:</strong>
            <div className="ml-2 p-2 bg-gray-100 rounded mt-1">
              <div>Online: {debugInfo.network?.online ? '✅ Yes' : '❌ No'}</div>
              <div>Connection: {debugInfo.network?.effectiveType || 'Unknown'}</div>
            </div>
          </div>

          {/* Supabase Config */}
          <div>
            <strong className="text-red-600">Supabase:</strong>
            <div className="ml-2 p-2 bg-gray-100 rounded mt-1">
              <div>URL: {debugInfo.supabase?.url || 'Not set'}</div>
              <div>Has Key: {debugInfo.supabase?.hasAnonKey ? '✅ Yes' : '❌ No'}</div>
            </div>
          </div>

          {/* Test Actions */}
          <div>
            <strong className="text-indigo-600">Test Actions:</strong>
            <div className="ml-2 mt-1 space-y-2">
              <button
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.auth.signUp({
                      email: 'test@example.com',
                      password: 'testpassword123'
                    })
                    alert(error ? `Error: ${error.message}` : 'Sign up test successful')
                  } catch (error) {
                    alert(`Test failed: ${error}`)
                  }
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-2"
              >
                Test Sign Up
              </button>
              <button
                onClick={async () => {
                  try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                      email: 'test@example.com',
                      password: 'testpassword123'
                    })
                    alert(error ? `Error: ${error.message}` : 'Sign in test successful')
                  } catch (error) {
                    alert(`Test failed: ${error}`)
                  }
                }}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs mr-2"
              >
                Test Sign In
              </button>
              <button
                onClick={() => {
                  localStorage.clear()
                  sessionStorage.clear()
                  alert('Storage cleared')
                }}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Clear Storage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
