import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MobilePWA, useMobilePWA, isLikelyMobileDevice, BeforeInstallPromptEvent } from '@/components/pwa/MobilePWA'

const mockIsStandalone = jest.fn(() => false)
const mockIsPWA = jest.fn(() => false)

jest.mock('@/lib/service-worker', () => ({
  serviceWorkerUtils: {
    isStandalone: () => mockIsStandalone(),
    isPWA: () => mockIsPWA()
  }
}))

describe('MobilePWA provider', () => {
  let localStore: Map<string, string>
  let sessionStore: Map<string, string>

  beforeEach(() => {
    mockIsStandalone.mockReturnValue(false)
    mockIsPWA.mockReturnValue(false)

    localStore = new Map<string, string>()
    sessionStore = new Map<string, string>()

    const createStorage = (store: Map<string, string>) => ({
      getItem: jest.fn((key: string) => (store.has(key) ? store.get(key) ?? null : null)),
      setItem: jest.fn((key: string, value: string) => {
        store.set(key, value)
      }),
      removeItem: jest.fn((key: string) => {
        store.delete(key)
      }),
      clear: jest.fn(() => {
        store.clear()
      })
    })

    Object.defineProperty(window, 'localStorage', {
      value: createStorage(localStore),
      configurable: true,
      writable: true
    })

    Object.defineProperty(window, 'sessionStorage', {
      value: createStorage(sessionStore),
      configurable: true,
      writable: true
    })

    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      configurable: true
    })
    Object.defineProperty(window.navigator, 'maxTouchPoints', {
      value: 5,
      configurable: true
    })
    Object.defineProperty(window.navigator, 'onLine', {
      value: true,
      configurable: true
    })
    Object.defineProperty(window, 'innerWidth', {
      value: 375,
      configurable: true
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('detects likely mobile devices from user agent', () => {
    expect(isLikelyMobileDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe(true)
    expect(isLikelyMobileDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', { maxTouchPoints: 4 })).toBe(true)
    expect(isLikelyMobileDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', { screenWidth: 500 })).toBe(true)
    expect(isLikelyMobileDevice('Mozilla/5.0 (Windows NT 10.0; Win64; x64)', { screenWidth: 1440 })).toBe(false)
  })

  it('provides mobile detection and responds to install prompt events', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MobilePWA>{children}</MobilePWA>
    )

    const { result } = renderHook(() => useMobilePWA(), { wrapper })

    await waitFor(() => expect(result.current.isClient).toBe(true))
    expect(result.current.isMobile).toBe(true)
    expect(result.current.canInstall).toBe(false)

    await act(async () => {
      const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent & {
        prompt: jest.Mock
      }
      event.prompt = jest.fn().mockResolvedValue(undefined)
      event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
      ;(event as any).platforms = ['web']
      window.dispatchEvent(event)
    })

    await waitFor(() => expect(result.current.canInstall).toBe(true))
    expect(result.current.showInstallPrompt).toBe(true)

    await act(async () => {
      await result.current.requestInstall()
    })

    await waitFor(() => expect(result.current.showInstallPrompt).toBe(false))
    expect(localStore.get('pwa-install-dismissed')).toBe('true')
    expect(sessionStore.get('pwa-install-dismissed')).toBe('true')
  })

  it('updates online state in response to browser events', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MobilePWA>{children}</MobilePWA>
    )

    const { result } = renderHook(() => useMobilePWA(), { wrapper })

    await waitFor(() => expect(result.current.isClient).toBe(true))
    expect(result.current.isOnline).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    await waitFor(() => expect(result.current.isOnline).toBe(false))

    act(() => {
      window.dispatchEvent(new Event('online'))
    })

    await waitFor(() => expect(result.current.isOnline).toBe(true))
  })

  it('allows users to dismiss the install prompt permanently', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MobilePWA>{children}</MobilePWA>
    )

    const { result } = renderHook(() => useMobilePWA(), { wrapper })

    await waitFor(() => expect(result.current.isClient).toBe(true))

    act(() => {
      const event = new Event('beforeinstallprompt') as BeforeInstallPromptEvent & {
        prompt: jest.Mock
      }
      event.prompt = jest.fn().mockResolvedValue(undefined)
      event.userChoice = Promise.resolve({ outcome: 'dismissed', platform: 'web' })
      ;(event as any).platforms = ['web']
      window.dispatchEvent(event)
    })

    await waitFor(() => expect(result.current.canInstall).toBe(true))

    act(() => {
      result.current.dismissInstallPrompt({ persist: true })
    })

    expect(localStore.get('pwa-install-dismissed')).toBe('true')
    expect(result.current.showInstallPrompt).toBe(false)
  })
})

