'use client'

import { useEffect } from 'react'

export function SafariRuntimeRepair() {
  useEffect(() => {
    try {
      const head = document.head
      if (!head) {
        return
      }

      const cssScripts = head.querySelectorAll('script[src$=".css"]')
      cssScripts.forEach(node => {
        node.parentNode?.removeChild(node)
      })

      const preload = head.querySelector('link[rel="preload"][as="script"][href*="/_next/static/chunks/webpack"]') as HTMLLinkElement | null
      if (!preload) {
        return
      }

      const runtimeSrc = preload.getAttribute('href') || preload.href
      if (!runtimeSrc) {
        return
      }

      if (!head.querySelector(`script[src="${runtimeSrc}"]`)) {
        const runtimeScript = document.createElement('script')
        runtimeScript.src = runtimeSrc
        runtimeScript.async = false

        const crossOrigin = preload.getAttribute('crossorigin')
        if (crossOrigin) {
          runtimeScript.setAttribute('crossorigin', crossOrigin)
        }

        const firstScript = head.querySelector('script[src^="/_next/static/chunks/"]')
        if (firstScript?.parentNode) {
          firstScript.parentNode.insertBefore(runtimeScript, firstScript)
        } else {
          head.appendChild(runtimeScript)
        }
      }
    } catch (error) {
      console.error('⚠️ Failed to repair Next.js runtime bootstrap', error)
    }
  }, [])

  return null
}
