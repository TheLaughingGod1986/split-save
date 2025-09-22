import { structuredDataSchemas } from '@/lib/structuredDataSchemas'

const marketingSchemas = [
  structuredDataSchemas.website,
  structuredDataSchemas.organization,
  structuredDataSchemas.webapp,
  structuredDataSchemas.financialService
]

export function MarketingLandingFallback() {
  return (
    <>
      {marketingSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          suppressHydrationWarning
        />
      ))}

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
        <header className="relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">SplitSave</p>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
              Split expenses fairly.
              <br />
              Save for what matters together.
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built for couples who want their shared finances to feel transparent, balanced, and easy. Track everything from bills to savings goals without the spreadsheets.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:from-purple-700 hover:to-blue-700"
              >
                Explore SplitSave
              </a>
              <a
                href="mailto:hello@splitsave.app"
                className="inline-flex items-center justify-center rounded-lg border-2 border-purple-600 px-8 py-4 text-base font-semibold text-purple-600 transition hover:bg-purple-600 hover:text-white dark:border-purple-400 dark:text-purple-300"
              >
                Talk to us
              </a>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 text-sm text-gray-600 dark:text-gray-400 md:flex-row md:justify-center md:gap-8">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span>Instant web access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                <span>iOS &amp; Android apps coming soon</span>
              </div>
            </div>
          </div>
        </header>

        <main className="bg-white/80 dark:bg-gray-900/70 backdrop-blur">
          <section id="features" className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16 md:flex-row">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Everything you need to feel in sync</h2>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-300">
                SplitSave keeps both of you informed in real time—no more mystery charges or awkward reminders. It’s the shared money hub built to keep your relationship calm and collaborative.
              </p>
              <ul className="mt-6 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">1</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Income-aware expense splitting</h3>
                    <p>Automatically recommend fair contributions based on what each person earns.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">2</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Shared savings milestones</h3>
                    <p>See your progress towards holidays, weddings, or rainy-day funds—together.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">3</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Real-time transparency</h3>
                    <p>Stay aligned with instant updates, smart nudges, and digestible insights.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="flex-1 rounded-2xl border border-purple-100 bg-white p-6 shadow-xl dark:border-purple-500/20 dark:bg-gray-900/70 dark:shadow-none">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Split a £1,200 rent fairly</h3>
              <dl className="mt-6 space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-between">
                  <dt>Total rent</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">£1,200</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>You earn</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">£3,000 (37.5%)</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Your partner earns</dt>
                  <dd className="font-semibold text-gray-900 dark:text-white">£5,000 (62.5%)</dd>
                </div>
                <div className="border-t border-purple-100 pt-4 dark:border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <dt>Your share</dt>
                    <dd className="font-bold text-purple-600 dark:text-purple-300">£450</dd>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <dt>Partner share</dt>
                    <dd className="font-bold text-blue-600 dark:text-blue-300">£750</dd>
                  </div>
                </div>
              </dl>
              <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                Based on proportional income contributions. Customize categories, due dates, and auto-reminders when you sign up.
              </p>
            </div>
          </section>
        </main>

        <footer className="border-t border-purple-100 bg-white/70 py-10 text-center text-sm text-gray-500 dark:border-purple-500/20 dark:bg-gray-900/60 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} SplitSave. All rights reserved.</p>
          <p className="mt-2">
            Ready to simplify shared finances? Email <a className="text-purple-600 underline hover:text-purple-700 dark:text-purple-300" href="mailto:hello@splitsave.app">hello@splitsave.app</a>
          </p>
        </footer>
      </div>
    </>
  )
}
