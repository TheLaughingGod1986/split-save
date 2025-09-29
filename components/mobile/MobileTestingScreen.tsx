'use client'

interface MobileTestingScreenProps {
  variant?: 'default' | 'loading'
}

export function MobileTestingScreen({ variant = 'default' }: MobileTestingScreenProps) {
  const headline =
    variant === 'loading'
      ? 'Mobile experience under maintenance'
      : 'Mobile web experience under maintenance'

  const description =
    variant === 'loading'
      ? 'We’re currently diagnosing mobile loading issues. Please check back soon or use SplitSave on desktop.'
      : 'The mobile website is temporarily disabled while we debug loading issues. SplitSave is still available on desktop.'

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
      </div>
    </div>
  )
}
