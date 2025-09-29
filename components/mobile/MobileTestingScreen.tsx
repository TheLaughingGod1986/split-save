'use client'

import { useMemo, useState } from 'react'

interface MobileTestingDebugInfo {
  flags: {
    envMobileTestingFlag: boolean
    forceMobileTesting: boolean
    mobileDebug: boolean
  }
  device: {
    isMobile: boolean
    isSmallScreen: boolean
    isClient: boolean
    isStandalonePWA: boolean
  }
  auth: {
    hasAuthToken: boolean | null
    loading: boolean
    hasUser: boolean
    userEmail: string | null
  }
}

interface MobileTestingScreenProps {
  variant?: 'default' | 'loading'
  debugInfo?: MobileTestingDebugInfo
  showDebugPanel?: boolean
}

export function MobileTestingScreen({
  variant = 'default',
  debugInfo,
  showDebugPanel = false
}: MobileTestingScreenProps) {
  const headline =
    variant === 'loading'
      ? 'Mobile experience under maintenance'
      : 'Mobile web experience under maintenance'

  const description =
    variant === 'loading'
      ? 'We’re currently diagnosing mobile loading issues. Please check back soon or use SplitSave on desktop.'
      : 'The mobile website is temporarily disabled while we debug loading issues. SplitSave is still available on desktop.'

  const [isDebugExpanded, setIsDebugExpanded] = useState(showDebugPanel)
  const shouldShowDebugPanel = Boolean(debugInfo && (showDebugPanel || debugInfo.flags.mobileDebug))

  const debugItems = useMemo(() => {
    if (!debugInfo) return []

    return [
      {
        title: 'Feature flags',
        entries: [
          ['Env mobile testing flag', debugInfo.flags.envMobileTestingFlag ? 'enabled' : 'disabled'],
          ['forceMobileTesting query', debugInfo.flags.forceMobileTesting ? 'enabled' : 'disabled'],
          ['mobileDebug query', debugInfo.flags.mobileDebug ? 'enabled' : 'disabled']
        ]
      },
      {
        title: 'Device detection',
        entries: [
          ['Detected mobile', debugInfo.device.isMobile ? 'yes' : 'no'],
          ['Small screen', debugInfo.device.isSmallScreen ? 'yes' : 'no'],
          ['Client side', debugInfo.device.isClient ? 'yes' : 'no'],
          ['Standalone PWA', debugInfo.device.isStandalonePWA ? 'yes' : 'no']
        ]
      },
      {
        title: 'Auth status',
        entries: [
          ['Auth loading', debugInfo.auth.loading ? 'yes' : 'no'],
          [
            'Stored auth token',
            debugInfo.auth.hasAuthToken === null
              ? 'unknown'
              : debugInfo.auth.hasAuthToken
              ? 'present'
              : 'missing'
          ],
          ['Has user', debugInfo.auth.hasUser ? 'yes' : 'no'],
          ['User email', debugInfo.auth.userEmail ?? 'n/a']
        ]
      }
    ]
  }, [debugInfo])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-purple-100/60 bg-white/85 p-10 text-center shadow-xl backdrop-blur dark:border-purple-900/40 dark:bg-gray-900/80">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">SplitSave mobile</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{headline}</h1>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-300">{description}</p>
        <div className="mt-6 rounded-2xl bg-purple-50/80 px-4 py-3 text-sm text-purple-900 dark:bg-purple-950/40 dark:text-purple-100">
          <p className="font-medium">Why am I seeing this?</p>
          <p className="mt-1 text-xs text-purple-800/90 dark:text-purple-100/80">
            The production mobile site was failing to load in Safari and Chrome on iOS. We&apos;ve disabled the mobile
            experience while we run tests and fixes. Please continue on desktop for now.
          </p>
        </div>
        <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          Need access urgently? Email <a className="font-semibold text-purple-600 hover:text-purple-500" href="mailto:team@splitsave.community">team@splitsave.community</a> and we&apos;ll help you out.
        </p>
        {shouldShowDebugPanel && debugItems.length > 0 && (
          <div className="mt-8 text-left text-xs text-gray-600 dark:text-gray-300">
            <button
              type="button"
              onClick={() => setIsDebugExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-purple-200/60 bg-purple-50/60 px-4 py-2 font-semibold text-purple-700 transition hover:bg-purple-100 dark:border-purple-800/60 dark:bg-purple-950/30 dark:text-purple-200 dark:hover:bg-purple-900/40"
            >
              <span>Debug details</span>
              <span>{isDebugExpanded ? '−' : '+'}</span>
            </button>
            {isDebugExpanded && (
              <div className="mt-3 space-y-4 rounded-lg border border-purple-100/60 bg-white/70 p-4 text-gray-700 shadow-sm dark:border-purple-900/50 dark:bg-gray-900/70 dark:text-gray-200">
                {debugItems.map((section) => (
                  <div key={section.title}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                      {section.title}
                    </p>
                    <dl className="mt-2 space-y-1">
                      {section.entries.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4">
                          <dt className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            {label}
                          </dt>
                          <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
                <p className="mt-3 text-[11px] text-gray-500 dark:text-gray-400">
                  Tip: append <code className="rounded bg-gray-100 px-1 py-0.5 text-[10px] dark:bg-gray-800">?forceMobileTesting=true&amp;mobileDebug=true</code> to the URL to enable this panel on any device.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
