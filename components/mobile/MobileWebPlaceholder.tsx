'use client'

interface MobileWebPlaceholderProps {
  onContinue?: () => void
}

export function MobileWebPlaceholder({ onContinue }: MobileWebPlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-900 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-purple-100/60 bg-white/80 p-8 text-center shadow-xl backdrop-blur-sm dark:border-purple-900/40 dark:bg-gray-900/80">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">SplitSave mobile</p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
          Mobile website preview
        </h1>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
          The mobile web experience is being rebuilt. You&apos;re currently viewing a lightweight preview to verify Safari support.
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Full budgeting features are still available on desktop. A refreshed mobile layout is coming soon.
        </p>

        {onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="mt-8 inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
          >
            Continue to the current app
          </button>
        )}
      </div>
    </div>
  )
}
