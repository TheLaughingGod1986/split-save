'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LoginForm } from './auth/LoginForm'
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

              {/* App Availability */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Available now as Web App</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>iOS & Android apps coming soon</span>
                </div>
              </div>

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

      {/* What SplitSave Does Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What SplitSave Does
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              SplitSave is a comprehensive financial management platform designed specifically for couples. It goes beyond simple expense splitting to help you build a stronger financial future together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Smart Expense Splitting
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Income-Based Fairness</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Automatically calculates fair shares based on your actual income, not just 50/50 splits</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Real-Time Tracking</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">See who owes what instantly, with automatic calculations and payment reminders</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Approval Workflow</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Large expenses require partner approval, ensuring transparency and mutual agreement</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Example: Fair Rent Splitting</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Total Rent:</span>
                  <span className="font-semibold">£1,200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Your Income:</span>
                  <span className="font-semibold">£3,000 (37.5%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">Partner's Income:</span>
                  <span className="font-semibold">£5,000 (62.5%)</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">You Pay:</span>
                    <span className="font-bold text-green-600">£450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">Partner Pays:</span>
                    <span className="font-bold text-blue-600">£750</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Shared Savings Goals</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏖️</span>
                    <span className="text-sm">Holiday Fund</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">85%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">£4,250 / £5,000</div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Collaborative Goal Setting
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Joint Savings Goals</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Set and track savings goals together - holidays, house deposits, emergency funds</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Progress Tracking</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Visual progress bars, milestone celebrations, and achievement badges</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Smart Recommendations</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Get personalized suggestions to optimize your savings and reach goals faster</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-900 rounded-xl p-4 text-white">
                    {/* Dashboard Screenshot */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">SplitSave</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs">B</div>
                        <span className="text-sm">Ben</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="text-sm text-gray-400 mb-1">Total Saved</div>
                        <div className="text-2xl font-bold text-green-400">£12,450</div>
                        <div className="text-xs text-gray-500">+£1,200 this month</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-800 rounded-lg p-2">
                          <div className="text-xs text-gray-400">Shared Expenses</div>
                          <div className="text-sm font-semibold">£2,100</div>
                        </div>
                        <div className="bg-gray-800 rounded-lg p-2">
                          <div className="text-xs text-gray-400">Goals Progress</div>
                          <div className="text-sm font-semibold text-green-400">85%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative ml-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-900 rounded-xl p-4 text-white">
                    {/* Expense Tracking Screenshot */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Expenses</h3>
                      <div className="text-sm text-gray-400">This Month</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🏠</span>
                          <div>
                            <div className="text-sm font-medium">Rent</div>
                            <div className="text-xs text-gray-400">Dec 1</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">£1,200</div>
                          <div className="text-xs text-gray-400">You: £480</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">⚡</span>
                          <div>
                            <div className="text-sm font-medium">Utilities</div>
                            <div className="text-xs text-gray-400">Dec 5</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">£180</div>
                          <div className="text-xs text-gray-400">You: £72</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gray-800 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🛒</span>
                          <div>
                            <div className="text-sm font-medium">Groceries</div>
                            <div className="text-xs text-gray-400">Dec 8</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">£120</div>
                          <div className="text-xs text-gray-400">You: £48</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative ml-16"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <div className="bg-gray-900 rounded-xl p-4 text-white">
                    {/* Goals Screenshot */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Savings Goals</h3>
                      <div className="text-sm text-green-400">2 Active</div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏖️</span>
                            <span className="text-sm font-medium">Holiday Fund</span>
                          </div>
                          <span className="text-xs text-gray-400">85%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                        <div className="text-xs text-gray-400">£4,250 / £5,000</div>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏠</span>
                            <span className="text-sm font-medium">House Deposit</span>
                          </div>
                          <span className="text-xs text-gray-400">23%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '23%'}}></div>
                        </div>
                        <div className="text-xs text-gray-400">£11,500 / £50,000</div>
                      </div>
                    </div>
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
                      <p className="text-gray-600 dark:text-gray-300 mb-2">Invite your partner via email or link. They&apos;ll join your shared financial space instantly with secure, encrypted access.</p>
                      <div className="text-sm text-purple-600 dark:text-purple-400">✓ Takes less than 2 minutes</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Add Shared Expenses</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">Record rent, utilities, groceries, and more. SplitSave automatically calculates fair shares based on your actual income proportions.</p>
                      <div className="text-sm text-purple-600 dark:text-purple-400">✓ No more manual calculations</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Set Goals & Track Progress</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">Create savings goals together, track your progress with visual charts, and earn achievements as you reach milestones.</p>
                      <div className="text-sm text-purple-600 dark:text-purple-400">✓ Stay motivated together</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Build Financial Harmony</h4>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">Get insights into your spending patterns, receive smart recommendations, and build a stronger financial future together.</p>
                      <div className="text-sm text-purple-600 dark:text-purple-400">✓ Transparent & fair</div>
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

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Loved by couples everywhere
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              See what real couples are saying about SplitSave
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  S
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah & Mike</h4>
                  <div className="flex text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "SplitSave completely changed how we handle money. No more awkward conversations about who owes what. The income-based splitting is so fair!"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  A
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Alex & Jamie</h4>
                  <div className="flex text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "We saved £3,000 more this year thanks to SplitSave's goal tracking. The visual progress bars keep us motivated!"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  E
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Emma & Tom</h4>
                  <div className="flex text-yellow-500">★★★★★</div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 italic">
                "Finally, an app that understands couples' finances! The transparency features eliminated all our money arguments."
              </p>
            </motion.div>
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
            Join thousands of couples who&apos;ve found financial harmony with SplitSave
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={handleLearnMore}
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-200"
            >
              Learn More
            </button>
          </div>
          <p className="text-purple-200 text-sm">
            Completely free • Setup in under 5 minutes • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4">SplitSave</h3>
              <p className="text-gray-400 mb-4 max-w-md">
                The smart way for couples to manage shared expenses, track savings goals, and build financial harmony together.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Web App Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span>Mobile Apps Coming Soon</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={handleGetStarted} className="hover:text-white text-left">Try SplitSave Free</button></li>
                <li><button onClick={handleLearnMore} className="hover:text-white text-left">Learn More</button></li>
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SplitSave. All rights reserved. Built with ❤️ for couples everywhere.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
