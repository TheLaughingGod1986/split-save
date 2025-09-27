'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { serviceWorkerUtils } from '@/lib/service-worker'

const INSTALL_DISMISS_KEY = 'pwa-install-dismissed'

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export interface MobilePWAContextValue {
  isClient: boolean
  isMobile: boolean
  isStandalone: boolean
  isPWA: boolean
  isOnline: boolean
  canInstall: boolean
  showInstallPrompt: boolean
  requestInstall: () => Promise<boolean>
  dismissInstallPrompt: (options?: { persist?: boolean }) => void
  resetInstallPrompt: () => void
}

const MobilePWAContext = createContext<MobilePWAContextValue | null>(null)

const MOBILE_UA_REGEX = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i

export function isLikelyMobileDevice(
  userAgent: string,
  options: { maxTouchPoints?: number; screenWidth?: number } = {}
): boolean {
  const normalizedUA = userAgent.toLowerCase()

  if (MOBILE_UA_REGEX.test(normalizedUA)) {
    return true
  }

  const { maxTouchPoints, screenWidth } = options

  // Detect iPadOS which reports itself as Mac but has touch support
  if (normalizedUA.includes('macintosh') && typeof maxTouchPoints === 'number' && maxTouchPoints > 1) {
    return true
  }

  if (typeof screenWidth === 'number') {
    return screenWidth <= 768
  }

  return false
}

function getStoredDismissal(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return (
      window.localStorage.getItem(INSTALL_DISMISS_KEY) === 'true' ||
      window.sessionStorage.getItem(INSTALL_DISMISS_KEY) === 'true'
    )
  } catch (error) {
    console.warn('Unable to read install dismissal flag', error)
    return false
  }
}

function persistDismissal(persist: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(INSTALL_DISMISS_KEY, 'true')
    if (persist) {
      window.localStorage.setItem(INSTALL_DISMISS_KEY, 'true')
    }
  } catch (error) {
    console.warn('Unable to persist install dismissal flag', error)
  }
}

function clearDismissal() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(INSTALL_DISMISS_KEY)
    window.localStorage.removeItem(INSTALL_DISMISS_KEY)
  } catch (error) {
    console.warn('Unable to clear install dismissal flag', error)
  }
}

function ensureViewportMetaTag() {
  if (typeof document === 'undefined') return
  let viewport = document.querySelector('meta[name="viewport"]')
  if (!viewport) {
    viewport = document.createElement('meta')
    viewport.setAttribute('name', 'viewport')
    document.head.appendChild(viewport)
  }
  viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover')
}

function ensureMetaTag(name: string, content: string) {
  if (typeof document === 'undefined') return
  let meta = document.querySelector(`meta[name="${name}"]`)
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', name)
    document.head.appendChild(meta)
  }
  meta.setAttribute('content', content)
}

function applyMobileMetaTags() {
  ensureViewportMetaTag()

  const tags = [
    ['mobile-web-app-capable', 'yes'],
    ['apple-mobile-web-app-capable', 'yes'],
    ['apple-mobile-web-app-status-bar-style', 'default'],
    ['apple-mobile-web-app-title', 'SplitSave'],
    ['format-detection', 'telephone=no'],
    ['theme-color', '#7c3aed']
  ] as const

  for (const [name, content] of tags) {
    ensureMetaTag(name, content)
  }
}

function updateDocumentClasses(state: {
  isMobile: boolean
  isPWA: boolean
  isStandalone: boolean
}) {
  if (typeof document === 'undefined') return

  const { isMobile, isPWA, isStandalone } = state
  const root = document.documentElement
  const body = document.body

  const classMap: Array<[string, boolean]> = [
    ['is-mobile-device', isMobile],
    ['is-pwa-experience', isPWA],
    ['is-standalone-pwa', isStandalone]
  ]

  classMap.forEach(([className, shouldEnable]) => {
    root.classList.toggle(className, shouldEnable)
    body.classList.toggle(className, shouldEnable)
  })
}

function detectMobileFromEnvironment(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  return isLikelyMobileDevice(navigator.userAgent || '', {
    maxTouchPoints: (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints,
    screenWidth: window.innerWidth
  })
}

const initialContextState: MobilePWAContextValue = {
  isClient: false,
  isMobile: false,
  isStandalone: false,
  isPWA: false,
  isOnline: true,
  canInstall: false,
  showInstallPrompt: false,
  requestInstall: async () => false,
  dismissInstallPrompt: () => {},
  resetInstallPrompt: () => {}
}

export function MobilePWA({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialContextState)
  const installPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  const requestInstall = useCallback(async () => {
    const promptEvent = installPromptRef.current
    if (!promptEvent) {
      return false
    }

    try {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      const accepted = choice?.outcome === 'accepted'

      setState(prev => ({
        ...prev,
        canInstall: accepted ? false : prev.canInstall,
        showInstallPrompt: false
      }))

      persistDismissal(accepted)
      installPromptRef.current = null
      return accepted
    } catch (error) {
      console.error('PWA install prompt failed', error)
      setState(prev => ({
        ...prev,
        showInstallPrompt: false
      }))
      installPromptRef.current = null
      return false
    }
  }, [])

  const dismissInstallPrompt = useCallback((options: { persist?: boolean } = {}) => {
    const shouldPersist = options.persist ?? false
    persistDismissal(shouldPersist)
    setState(prev => ({
      ...prev,
      showInstallPrompt: false,
      canInstall: shouldPersist ? false : prev.canInstall
    }))
  }, [])

  const resetInstallPrompt = useCallback(() => {
    clearDismissal()
    setState(prev => ({
      ...prev,
      canInstall: !!installPromptRef.current,
      showInstallPrompt: !!installPromptRef.current && prev.isMobile
    }))
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    let mounted = true

    const evaluateEnvironment = () => {
      if (!mounted) return
      const isStandalone = serviceWorkerUtils.isStandalone()
      const isPWA = serviceWorkerUtils.isPWA()
      const isMobile = detectMobileFromEnvironment()

      setState(prev => ({
        ...prev,
        isClient: true,
        isStandalone,
        isPWA,
        isMobile,
        isOnline: navigator.onLine
      }))

      updateDocumentClasses({ isMobile, isPWA, isStandalone })
      if (isMobile) {
        applyMobileMetaTags()
      }
    }

    evaluateEnvironment()

    const handleResize = () => {
      const detectedMobile = detectMobileFromEnvironment()
      setState(prev => {
        const nextState = {
          ...prev,
          isMobile: detectedMobile
        }
        updateDocumentClasses({
          isMobile: detectedMobile,
          isPWA: nextState.isPWA,
          isStandalone: nextState.isStandalone
        })
        return nextState
      })
    }

    const displayModeMedia = typeof window.matchMedia === 'function'
      ? window.matchMedia('(display-mode: standalone)')
      : null

    const handleDisplayModeChange = () => evaluateEnvironment()
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        evaluateEnvironment()
      }
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      const promptEvent = event as BeforeInstallPromptEvent
      installPromptRef.current = promptEvent

      setState(prev => ({
        ...prev,
        canInstall: true,
        showInstallPrompt: !getStoredDismissal() && prev.isMobile
      }))
    }

    const handleAppInstalled = () => {
      installPromptRef.current = null
      persistDismissal(true)
      evaluateEnvironment()
      setState(prev => ({
        ...prev,
        canInstall: false,
        showInstallPrompt: false,
        isStandalone: true,
        isPWA: true
      }))
    }

    const handleOnline = () => {
      setState(prev => ({
        ...prev,
        isOnline: true
      }))
    }

    const handleOffline = () => {
      setState(prev => ({
        ...prev,
        isOnline: false
      }))
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    displayModeMedia?.addEventListener?.('change', handleDisplayModeChange)

    return () => {
      mounted = false
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      displayModeMedia?.removeEventListener?.('change', handleDisplayModeChange)
    }
  }, [])

  const contextValue = useMemo<MobilePWAContextValue>(() => ({
    ...state,
    requestInstall,
    dismissInstallPrompt,
    resetInstallPrompt
  }), [dismissInstallPrompt, requestInstall, resetInstallPrompt, state])

  return (
    <MobilePWAContext.Provider value={contextValue}>
      {children}
    </MobilePWAContext.Provider>
  )
}

export function useMobilePWA(): MobilePWAContextValue {
  const context = useContext(MobilePWAContext)
  if (!context) {
    throw new Error('useMobilePWA must be used within a MobilePWA provider')
  }
  return context
}

