'use client'

import { useEffect, useRef } from 'react'
import { serviceWorkerManager } from '@/lib/service-worker'

function isChunkLoadError(error: unknown): boolean {
  if (!error) {
    return false
  }

  const name = (error as Error)?.name
  const message =
    typeof error === 'string'
      ? error
      : (error as Error)?.message || (error as { toString?: () => string })?.toString?.() || ''

  if (!message && !name) {
    return false
  }

  return (
    name === 'ChunkLoadError' ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /dynamic import\(\) loading failed/i.test(message) ||
    /Unexpected token '<'/i.test(message)
  )
}

async function clearServiceWorkerCaches() {
  try {
    await serviceWorkerManager.unregister()
  } catch (error) {
    console.warn('PWA runtime recovery: failed to unregister service worker', error)
  }

  try {
    await serviceWorkerManager.clearCaches()
  } catch (error) {
    console.warn('PWA runtime recovery: failed to clear caches via manager', error)
  }

  if (typeof caches !== 'undefined') {
    try {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)))
    } catch (error) {
      console.warn('PWA runtime recovery: failed to clear caches API directly', error)
    }
  }
}

export function RuntimeErrorRecovery() {
  const recoveryTriggered = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const attemptRecovery = async (reason: string, details: Record<string, unknown>) => {
      if (recoveryTriggered.current) {
        return
      }

      recoveryTriggered.current = true
      console.error('PWA runtime recovery triggered', { reason, details })

      await clearServiceWorkerCaches()

      setTimeout(() => {
        try {
          window.location.reload()
        } catch (error) {
          console.error('PWA runtime recovery: reload failed', error)
        }
      }, 250)
    }

    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event?.error || event?.message)) {
        event.preventDefault?.()
        void attemptRecovery('error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        })
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isChunkLoadError(event?.reason)) {
        event.preventDefault?.()
        void attemptRecovery('unhandledrejection', {
          reason: event.reason instanceof Error ? event.reason.message : event.reason,
        })
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
