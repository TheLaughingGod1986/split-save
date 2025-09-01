'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from './LoginForm'
import { trackEvent } from '@/lib/analytics'

export function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)

  const handleGetStarted = () => {
    trackEvent('cta_clicked', { 
      location: 'hero_section', 
      cta_type: 'get_started',
      page: 'landing'
    })
    setShowLogin(true)
  }

  const handleLearnMore = () => {
    trackEvent('cta_clicked', { 
      location: 'hero_section', 
      cta_type: 'learn_more',
      page: 'landing'
    })
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Split Expenses
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  {" "}Fairly
                </span>
                <br />
                Save Together
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                The smart way for couples to manage shared expenses, track savings goals, and build financial harmony together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                </button>
                <button
                  onClick={handleLearnMore}
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 dark:text-purple-400 font-semibold rounded-lg hover:bg-purple-600 hover:text-white transition-all duration-200"
                >
                  Learn More
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 border-2 border-white dark:border-gray-800"></div>
                    ))}
                  </div>
                  <span>Join 10,000+ couples</span>
                </div>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★★★★★</span>
                  <span>4.9/5 rating</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 left-10 w-20 h-20 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20"
        />
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-40 right-20 w-16 h-16 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20"
        />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need for fair financial management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Built specifically for couples who want transparency and fairness in their finances
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "💰",
                title: "Proportional Splitting",
                description: "Split expenses based on income, not just 50/50. Fair for everyone.",
                benefit: "Save time on calculations"
              },
              {
                icon: "🎯",
                title: "Shared Goals",
                description: "Set and track savings goals together. Celebrate milestones as a team.",
                benefit: "Stay motivated together"
              },
              {
                icon: "🔒",
                title: "Secure & Private",
                description: "Bank-level security with end-to-end encryption. Your data stays private.",
                benefit: "Peace of mind"
              },
              {
                icon: "📱",
                title: "Mobile First",
                description: "Works perfectly on all devices. Install as a PWA for app-like experience.",
                benefit: "Use anywhere, anytime"
              },
              {
                icon: "⚡",
                title: "Real-time Sync",
                description: "See updates instantly. No more asking 'did you pay the rent?'",
                benefit: "Always in sync"
              },
              {
                icon: "🎮",
                title: "Gamified Progress",
                description: "Earn achievements and streaks. Make saving fun and rewarding.",
                benefit: "Stay engaged"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  {feature.description}
                </p>
                <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  {feature.benefit}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              See SplitSave in Action
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Watch how easy it is to manage your shared finances together
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: App Screenshots */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dashboard Overview</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">See your financial health at a glance</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative ml-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 text-center">
                    <div className="text-6xl mb-4">💰</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Expense Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Split bills fairly with smart calculations</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative ml-16"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-6 text-center">
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Savings Goals</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Track progress toward your dreams</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: Interactive Demo */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  How SplitSave Works
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Connect with Your Partner</h4>
                      <p className="text-gray-600 dark:text-gray-300">Invite your partner via email or link. They'll join your shared financial space instantly.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Add Shared Expenses</h4>
                      <p className="text-gray-600 dark:text-gray-300">Record rent, utilities, groceries, and more. SplitSave automatically calculates fair shares based on income.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Track & Celebrate Progress</h4>
                      <p className="text-gray-600 dark:text-gray-300">Watch your savings grow, earn achievements, and celebrate financial milestones together.</p>
                    </div>
                  </div>
                </div>

                {/* Interactive Demo Button */}
                <div className="mt-8">
                  <button
                    onClick={handleGetStarted}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                  >
                    Try It Yourself
                  </button>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    No setup required • Start exploring immediately
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to transform your financial relationship?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of couples who've found financial harmony with SplitSave
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Get Started Free
          </button>
          <p className="text-purple-200 mt-4 text-sm">
            Completely free • Setup in under 5 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SplitSave</h3>
              <p className="text-gray-400">
                Making financial management fair and transparent for couples.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SplitSave. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
