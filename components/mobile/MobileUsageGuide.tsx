'use client'

import React, { useMemo, useState } from 'react'

interface MobileUsageGuideProps {
  isMobile: boolean
  isPWA: boolean
  isStandalone: boolean
  onDismiss?: () => void
  className?: string
}

const platformLabels: Record<'ios' | 'android', string> = {
  ios: 'iOS & iPadOS (Safari)',
  android: 'Android (Chrome)'
}

export function MobileUsageGuide({
  isMobile,
  isPWA,
  isStandalone,
  onDismiss,
  className = ''
}: MobileUsageGuideProps) {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('ios')

  const status = useMemo(() => {
    if (isStandalone) {
      return { label: 'Running as installed app', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' }
    }

    if (isPWA) {
      return { label: 'Ready for offline use', tone: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' }
    }

    if (isMobile) {
      return { label: 'Mobile browser detected', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' }
    }

    return { label: 'Viewing on desktop', tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200' }
  }, [isMobile, isPWA, isStandalone])

  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden ${className}`}
    >
      <div className="px-6 py-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Use SplitSave on mobile</h2>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${status.tone}`}>
              {status.label}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Follow the quick steps below to access SplitSave from your phone browser or install it as a Progressive Web App (PWA).
          </p>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Dismiss
          </button>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 grid gap-6 lg:grid-cols-2">
        <section className="px-6 py-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Use in your browser</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            SplitSave works fully in modern mobile browsers. Keep these tips in mind for the best experience:
          </p>
          <ul className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-lg">📱</span>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Stay signed in</span>
                <p>Use the standard login flow and keep the tab open in the background. SplitSave automatically keeps your session active.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-lg">⬇️</span>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Add a shortcut</span>
                <p>Bookmark the dashboard or add it to your home screen using the share menu for one-tap access without installing the full PWA.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-lg">🔁</span>
              <div>
                <span className="font-medium text-gray-900 dark:text-white">Refresh if things look stuck</span>
                <p>Mobile networks occasionally pause background tabs. A quick pull-to-refresh ensures you are synced with your partner.</p>
              </div>
            </li>
          </ul>
        </section>

        <section className="px-6 py-5 bg-gray-50 dark:bg-gray-800/60 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">Install the PWA</h3>
            <div className="flex items-center gap-1 bg-white/70 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-full p-1 text-xs">
              {(['ios', 'android'] as const).map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setActivePlatform(platform)}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    activePlatform === platform
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {platformLabels[platform]}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            Installing the app gives you full-screen access, push notifications, and offline caching of your most recent data.
          </p>

          {activePlatform === 'ios' ? (
            <ol className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside">
              <li>Open SplitSave in Safari on your iPhone or iPad.</li>
              <li>Tap the <strong>Share</strong> icon, then choose <strong>Add to Home Screen</strong>.</li>
              <li>Name the shortcut “SplitSave” and tap <strong>Add</strong>. Launch it from your home screen for the full PWA experience.</li>
              <li>When prompted, allow notifications so you never miss partner approvals.</li>
            </ol>
          ) : (
            <ol className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300 list-decimal list-inside">
              <li>Open SplitSave in Chrome on your Android device.</li>
              <li>Tap the <strong>⋮</strong> menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Confirm the installation. SplitSave will appear in your app drawer and support offline access.</li>
              <li>Enable notifications when requested to receive contribution reminders instantly.</li>
            </ol>
          )}

          <div className="mt-5 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 px-4 py-3 text-sm text-purple-800 dark:text-purple-100">
            <p className="font-medium">Tip for couples on the go</p>
            <p className="mt-1">Both partners can install the PWA. Any updates you make sync in real time once either device reconnects to the internet.</p>
          </div>
        </section>
      </div>

      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/70 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-300">
        Need extra help? Visit the Account &gt; Support section to find troubleshooting guides and contact options.
      </div>
    </div>
  )
}
