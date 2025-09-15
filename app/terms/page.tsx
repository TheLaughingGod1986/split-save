'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function TermsOfService() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check for dark mode preference
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark)
    setIsDarkMode(shouldUseDark)
  }, [])

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <Link 
                href="/" 
                className="text-2xl font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                SplitSave
              </Link>
              <Link 
                href="/" 
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                ← Back to App
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  By accessing and using SplitSave (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Description of Service
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  SplitSave is a financial management application designed to help couples and partners track shared expenses, manage savings goals, and collaborate on financial planning. The service includes:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Shared expense tracking and categorization</li>
                  <li>Collaborative savings goals and progress monitoring</li>
                  <li>Financial insights and reporting</li>
                  <li>Partner notifications and communication features</li>
                  <li>Data synchronization across devices</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. User Accounts and Responsibilities
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  To use SplitSave, you must create an account and provide accurate, complete information. You are responsible for:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Ensuring your financial data is accurate and up-to-date</li>
                  <li>Complying with all applicable laws and regulations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Financial Data and Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We understand the sensitive nature of financial information. Your data is:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Encrypted in transit and at rest</li>
                  <li>Stored securely using industry-standard practices</li>
                  <li>Never sold to third parties</li>
                  <li>Only accessible to you and your designated partner(s)</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  For complete details, please review our <Link href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</Link>.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Partner Collaboration
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  SplitSave enables collaboration between partners. By inviting someone to join your financial space, you acknowledge that:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>You have permission to share financial information with your partner</li>
                  <li>Your partner will have access to shared financial data</li>
                  <li>You can revoke partner access at any time</li>
                  <li>Both parties are responsible for maintaining data accuracy</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Prohibited Uses
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You may not use SplitSave for:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Any unlawful purpose or to solicit others to perform unlawful acts</li>
                  <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                  <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</li>
                  <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
                  <li>Submitting false or misleading information</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Service Availability
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. We reserve the right to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Perform scheduled maintenance and updates</li>
                  <li>Modify or discontinue features with reasonable notice</li>
                  <li>Suspend service for security or technical reasons</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Limitation of Liability
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  SplitSave is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. Changes to Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the application. Continued use of the service after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Contact Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Email:</strong> support@splitsave.app<br />
                    <strong>Website:</strong> <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline">splitsave.app</Link>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
