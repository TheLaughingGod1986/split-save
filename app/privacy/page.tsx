'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                <strong>Last updated:</strong> {new Date().toLocaleDateString()}
              </p>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  1. Introduction
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  At SplitSave, we are committed to protecting your privacy and ensuring the security of your financial information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our financial management application.
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We understand that financial data is highly sensitive, and we have implemented industry-standard security measures to protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  2. Information We Collect
                </h2>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  2.1 Personal Information
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Name and email address for account creation</li>
                  <li>Profile information (income, payday schedules, financial goals)</li>
                  <li>Expense data and categorization</li>
                  <li>Savings goals and contribution records</li>
                  <li>Partner collaboration preferences</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  2.2 Financial Data
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We collect and store your financial information to provide our services:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Income and salary information</li>
                  <li>Expense transactions and categories</li>
                  <li>Savings contributions and progress</li>
                  <li>Financial goals and targets</li>
                  <li>Budget allocations and spending patterns</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  2.3 Technical Information
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We automatically collect certain technical information:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Device information and operating system</li>
                  <li>Browser type and version</li>
                  <li>IP address and general location</li>
                  <li>Usage patterns and app interactions</li>
                  <li>Error logs and performance data</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  3. How We Use Your Information
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Provide and maintain our financial management services</li>
                  <li>Process transactions and track expenses</li>
                  <li>Generate insights and financial reports</li>
                  <li>Enable partner collaboration and sharing</li>
                  <li>Send notifications and reminders</li>
                  <li>Improve our application and user experience</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  4. Information Sharing and Disclosure
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  4.1 Partner Collaboration
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  When you invite a partner to collaborate, we share relevant financial data with them as authorized by you. You control what information is shared and can revoke access at any time.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  4.2 Service Providers
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We may share information with trusted third-party service providers who assist us in operating our application, such as:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Cloud hosting and data storage providers</li>
                  <li>Email and notification services</li>
                  <li>Analytics and performance monitoring tools</li>
                  <li>Security and fraud prevention services</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  4.3 Legal Requirements
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We may disclose your information if required by law or to protect our rights, property, or safety, or that of our users.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  5. Data Security
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We implement comprehensive security measures to protect your financial information:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols</li>
                  <li><strong>Access Controls:</strong> Strict access controls and authentication mechanisms</li>
                  <li><strong>Regular Audits:</strong> Regular security audits and vulnerability assessments</li>
                  <li><strong>Secure Infrastructure:</strong> Hosted on secure, compliant cloud infrastructure</li>
                  <li><strong>Data Backup:</strong> Regular backups with encryption and secure storage</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  6. Data Retention
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We retain your information for as long as necessary to provide our services and comply with legal obligations:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Account information is retained while your account is active</li>
                  <li>Financial data is retained for the duration of your account plus 7 years for tax and legal compliance</li>
                  <li>Technical logs are retained for up to 2 years for security and debugging purposes</li>
                  <li>You can request deletion of your data at any time</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  7. Your Rights and Choices
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  To exercise these rights, please contact us at the information provided below.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  8. Cookies and Tracking
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2">
                  <li>Maintain your login session</li>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze usage patterns and improve our service</li>
                  <li>Provide personalized experiences</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You can control cookie settings through your browser, but disabling cookies may affect functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  9. International Data Transfers
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  10. Children&apos;s Privacy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  SplitSave is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  11. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  12. Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Email:</strong> privacy@splitsave.app<br />
                    <strong>Website:</strong> <Link href="/" className="text-purple-600 dark:text-purple-400 hover:underline">splitsave.app</Link><br />
                    <strong>Support:</strong> support@splitsave.app
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
