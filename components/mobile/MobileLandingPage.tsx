'use client'

import { useEffect, useState } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { trackEvent } from '@/lib/analytics'
import { useMobileDetection } from '@/hooks/useMobileDetection'

const roadmapItems = [
  {
    label: 'Today',
    title: 'Mobile web',
    copy: 'Optimised for on-the-go check-ins, balance reviews, and quick adds.'
  },
  {
    label: 'Next up',
    title: 'Native apps',
    copy: 'Polished iOS and Android apps with widgets and notifications are already in beta.'
  },
  {
    label: 'Later',
    title: 'Bank sync',
    copy: 'Secure account connections so SplitSave updates itself while you live your life.'
  }
]

const sellingPoints = [
  {
    title: 'Fair by default',
    description: 'Income-based splits, smart repayments, and approvals for bigger spends.'
  },
  {
    title: 'Celebrate progress',
    description: 'Goal streaks, savings boosts, and gentle reminders keep momentum high.'
  },
  {
    title: 'Keep receipts tidy',
    description: 'Snap or forward receipts and let SplitSave log the details for both of you.'
  }
]

export function MobileLandingPage() {
  const [showLogin, setShowLogin] = useState(false)
  const [showSafariGuide, setShowSafariGuide] = useState(false)
  const { isMobileSafari } = useMobileDetection()

  useEffect(() => {
    if (!isMobileSafari && showSafariGuide) {
      setShowSafariGuide(false)
    }
  }, [isMobileSafari, showSafariGuide])

  const handlePrimaryCta = () => {
    trackEvent('cta_clicked', {
      location: 'mobile_landing',
      cta_type: 'log_in_mobile_web',
      page: 'mobile_landing',
      device: 'mobile_web'
    })

    setShowLogin(true)
  }

  const handleSecondaryCta = () => {
    trackEvent('cta_clicked', {
      location: 'mobile_landing',
      cta_type: 'see_how_it_works',
      page: 'mobile_landing',
      device: 'mobile_web'
    })

    const section = document.getElementById('mobile-how-it-works')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSafariInstallToggle = () => {
    setShowSafariGuide((prev) => {
      const next = !prev
      trackEvent('cta_clicked', {
        location: 'mobile_landing',
        cta_type: next ? 'open_safari_install_guide' : 'close_safari_install_guide',
        page: 'mobile_landing',
        device: 'mobile_web'
      })
      return next
    })
  }

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-white">
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-purple-600/30 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col">
        <header className="px-6 pt-16 pb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">SplitSave mobile</p>
          <h1 className="mt-6 text-3xl font-semibold leading-snug text-white">
            Everything you love in the SplitSave app—right in Safari
          </h1>
          <p className="mt-4 text-sm text-purple-100/80">
            The mobile web experience mirrors the PWA so you can check balances, track shared purchases, and fund goals without installing anything extra.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-purple-900 shadow-lg shadow-purple-900/30 transition hover:-translate-y-0.5 hover:bg-purple-50"
            >
              Log in to SplitSave
            </button>
            <button
              type="button"
              onClick={handleSecondaryCta}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-base font-semibold text-white/90 transition hover:border-white hover:text-white"
            >
              Explore the web app preview
            </button>
          </div>

          {isMobileSafari && (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 text-left shadow-xl backdrop-blur-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-purple-100/90">Add SplitSave to your Home Screen</p>
                  <p className="mt-1 text-xs text-purple-100/70">
                    Install the mobile web app for a true full-screen experience with offline support.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSafariInstallToggle}
                  className="inline-flex items-center justify-center rounded-full bg-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-expanded={showSafariGuide}
                >
                  {showSafariGuide ? 'Hide steps' : 'Install'}
                </button>
              </div>
              {showSafariGuide && (
                <ol className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-purple-100/80">
                  <li>Tap the <strong>Share</strong> icon in Safari.</li>
                  <li>Choose <strong>Add to Home Screen</strong>.</li>
                  <li>Confirm the name “SplitSave” and tap <strong>Add</strong>.</li>
                </ol>
              )}
            </div>
          )}
        </header>

        <main className="flex-1 space-y-14 px-6 pb-20">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30 backdrop-blur">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-100/70">Live preview</p>
            <h2 className="mt-3 text-2xl font-semibold text-white/95">This is what the SplitSave web app looks like</h2>
            <p className="mt-3 text-sm text-purple-100/80">
              Navigate the same cards, balances, and activity feed you see in the installed PWA—no more blank screens.
            </p>

            <AppShellPreview />
          </section>

          <section id="mobile-how-it-works" className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30 backdrop-blur">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-100/70">Why it matches the PWA</p>
            <h2 className="mt-3 text-2xl font-semibold text-white/95">Full fidelity budgeting on the go</h2>
            <div className="mt-6 space-y-5">
              {sellingPoints.map((point) => (
                <div key={point.title} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-sm font-semibold text-white/90">{point.title}</p>
                  <p className="mt-2 text-xs text-purple-100/70">{point.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg shadow-purple-900/30 backdrop-blur">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-100/70">Roadmap</p>
            <h2 className="mt-3 text-2xl font-semibold text-white/95">SplitSave keeps evolving</h2>
            <div className="mt-6 space-y-5">
              {roadmapItems.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-100/70">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white/90">{item.title}</p>
                  <p className="mt-1 text-xs text-purple-100/70">{item.copy}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="px-6 pb-12 text-center text-[0.7rem] text-purple-100/60">
          &copy; {new Date().getFullYear()} SplitSave. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

function AppShellPreview() {
  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-inner">
      <div className="rounded-xl bg-slate-950 p-4 text-left">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200/70">Shared balance</p>
            <p className="mt-1 text-2xl font-semibold text-white">$4,380.42</p>
          </div>
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[0.65rem] font-semibold text-emerald-300">On track</span>
        </div>

        <div className="mt-5 grid gap-3">
          <PreviewCard
            title="This week"
            amount="$612.20"
            description="Groceries, date nights, and shared subscriptions"
          />
          <PreviewCard
            title="Upcoming bills"
            amount="$940.00"
            description="Rent, utilities, and sinking funds for travel"
          />
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-black/30 p-3">
          <p className="text-xs font-semibold text-purple-100/80">Activity feed</p>
          <ul className="mt-3 space-y-3 text-xs text-purple-100/70">
            <li>
              <span className="font-semibold text-white/90">Jordan</span> added a grocery run • Split 60/40
            </li>
            <li>
              <span className="font-semibold text-white/90">Riley</span> funded the &ldquo;Weekend getaway&rdquo; goal
            </li>
            <li>Auto-transfer scheduled for Monday</li>
          </ul>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
          <button className="rounded-full bg-purple-600/90 px-3 py-2 font-semibold text-white transition hover:bg-purple-500">
            Add purchase
          </button>
          <button className="rounded-full border border-white/10 px-3 py-2 font-semibold text-white/90 transition hover:border-white/20">
            Add to goal
          </button>
        </div>
      </div>
    </div>
  )
}

function PreviewCard({
  title,
  amount,
  description
}: {
  title: string
  amount: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-100/70">{title}</p>
        <p className="text-sm font-semibold text-white/90">{amount}</p>
      </div>
      <p className="mt-2 text-[0.7rem] text-purple-100/70">{description}</p>
    </div>
  )
}
