'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from '@/components/auth/LoginForm'
import { trackEvent } from '@/lib/analytics'

const featureCards = [
  {
    icon: '🤝',
    title: 'Made for partners',
    description:
      'Split every bill proportionally, log shared purchases in seconds, and see who owes what at a glance.'
  },
  {
    icon: '🎯',
    title: 'Shared goals that stick',
    description:
      'Turn big plans into funded milestones with collaborative goals, nudges, and automatic celebrations.'
  },
  {
    icon: '📊',
    title: 'Clarity without spreadsheets',
    description:
      'Real-time dashboards replace awkward money chats with always-on transparency and receipts.'
  }
]

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

  const handlePrimaryCta = () => {
    trackEvent('cta_clicked', {
      location: 'mobile_landing',
      cta_type: 'get_started',
      device: 'mobile_web'
    })

    setShowLogin(true)
  }

  const handleSecondaryCta = () => {
    trackEvent('cta_clicked', {
      location: 'mobile_landing',
      cta_type: 'see_how_it_works',
      device: 'mobile_web'
    })

    const section = document.getElementById('mobile-how-it-works')
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-indigo-900 to-gray-950 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-purple-500/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col">
        <header className="px-6 pt-16 pb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">SplitSave mobile</p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-6 text-4xl font-bold leading-tight"
          >
            The easiest way to stay synced on money together
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-base text-purple-100/90"
          >
            Track shared spending, see progress towards your goals, and celebrate wins in a layout crafted just for phones.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-col gap-3"
          >
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-purple-900 shadow-xl shadow-purple-900/30 transition hover:translate-y-0.5 hover:bg-purple-50"
            >
              Start free with your partner
            </button>
            <button
              type="button"
              onClick={handleSecondaryCta}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              See how SplitSave feels
            </button>
          </motion.div>

          <div className="mt-10 flex items-center justify-center gap-3 text-xs text-purple-100/80">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-300 to-blue-300 ring-2 ring-purple-900/60" />
              ))}
            </div>
            <span>4.9★ from the couples who helped us build it</span>
          </div>
        </header>

        <main className="flex-1 space-y-16 px-6 pb-32">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-6 flex items-center gap-3 text-sm uppercase tracking-widest text-purple-200/80">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-lg">⚡</span>
              Real-time balance for both of you
            </div>
            <div className="grid gap-4 text-left text-sm text-purple-100/90">
              <div className="rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between text-xs text-purple-200/80">
                  <span>This week</span>
                  <span>Shared wallet</span>
                </div>
                <div className="mt-4 text-3xl font-semibold text-white">£482.20</div>
                <div className="mt-1 text-xs text-purple-200/70">You are ahead by £24.18</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-purple-200/80">Upcoming</p>
                  <p className="mt-3 text-base font-semibold text-white">Rent payout · £1,200</p>
                  <p className="mt-2 text-purple-200/70">Split 40% / 60%</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-purple-200/80">Goal streak</p>
                  <p className="mt-3 text-3xl font-semibold text-green-200">18 days</p>
                  <p className="mt-2 text-purple-200/70">Holiday fund 72% complete</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Why couples stick with SplitSave</h2>
            <div className="space-y-4">
              {featureCards.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-xl">{feature.icon}</span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-purple-200/80">{feature.title}</p>
                      <p className="mt-2 text-sm text-purple-100/90">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="mobile-how-it-works" className="space-y-6">
            <h2 className="text-2xl font-semibold">How it works</h2>
            <ol className="space-y-4 text-sm text-purple-100/90">
              <li className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-200/70">Step 1</p>
                <p className="mt-2 text-base font-semibold text-white">Invite your partner and connect shared expenses</p>
                <p className="mt-2 text-sm">SplitSave auto-suggests fair splits and who should press pay.</p>
              </li>
              <li className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-200/70">Step 2</p>
                <p className="mt-2 text-base font-semibold text-white">Set savings missions that feel exciting</p>
                <p className="mt-2 text-sm">Pick a goal, choose how much each contributes, and track progress together.</p>
              </li>
              <li className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-widest text-purple-200/70">Step 3</p>
                <p className="mt-2 text-base font-semibold text-white">Celebrate, adjust, and stay in sync</p>
                <p className="mt-2 text-sm">Automatic reminders and shared updates keep both of you aligned without awkward chats.</p>
              </li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Built for what&apos;s next</h2>
            <div className="grid gap-4">
              {roadmapItems.map((item) => (
                <div key={item.title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/70">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm text-purple-100/90">{item.copy}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">Everything couples asked for</h2>
            <div className="space-y-3 text-sm text-purple-100/90">
              {sellingPoints.map((point) => (
                <div key={point.title} className="flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <span className="mt-1 text-lg text-green-200">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{point.title}</p>
                    <p className="mt-1 text-sm">{point.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <div className="sticky bottom-0 border-t border-white/10 bg-gradient-to-t from-purple-950/95 to-purple-900/60 px-6 py-6 backdrop-blur">
          <div className="flex flex-col gap-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-purple-200/80">Ready to sync up?</p>
            <button
              type="button"
              onClick={handlePrimaryCta}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-purple-900 shadow-xl shadow-purple-900/30 transition hover:bg-purple-50"
            >
              Create your shared space now
            </button>
            <p className="text-[11px] text-purple-100/70">
              No credit card required · Works great on desktop too
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
