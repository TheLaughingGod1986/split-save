import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { PWAProvider } from '@/components/pwa/PWAProvider'
import { SafariRuntimeRepair } from '@/components/pwa/SafariRuntimeRepair'
import { MobilePWA } from '@/components/pwa/MobilePWA'
// Debug components removed to prevent hydration issues
// import { MobileDebugOverlay } from '@/components/mobile/MobileDebugOverlay'
// import { PWAAuthDebug } from '@/components/debug/PWAAuthDebug'
import '@/lib/auth-cleanup'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: {
    default: 'SplitSave - Smart Financial Management & Savings Goals for Couples',
    template: '%s | SplitSave'
  },
  description: 'SplitSave helps couples manage shared expenses fairly, track savings goals together, and build financial harmony. Proportional splitting, real-time sync, and gamified progress tracking.',
  keywords: [
    'financial management',
    'expense splitting',
    'couple finance',
    'shared expenses',
    'savings goals',
    'budget planning',
    'proportional splitting',
    'money management app',
    'couple budgeting',
    'joint finances',
    'expense tracker',
    'savings tracker',
    'financial transparency',
    'relationship finance',
    'fair expense splitting',
    'income-based splitting',
    'financial harmony',
    'couple money app',
    'shared budgeting',
    'financial goals',
    'expense calculator',
    'savings calculator',
    'financial planning',
    'money management',
    'budget app',
    'expense app',
    'savings app',
    'couple app',
    'relationship app',
    'financial app'
  ].join(', '),
  authors: [{ name: 'SplitSave Team', url: 'https://splitsave.app' }],
  creator: 'SplitSave Team',
  publisher: 'SplitSave',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://splitsave.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'SplitSave - Smart Financial Management & Savings Goals for Couples',
    description: 'SplitSave helps couples manage shared expenses fairly, track savings goals together, and build financial harmony. Proportional splitting, real-time sync, and gamified progress tracking.',
    url: 'https://splitsave.app',
    siteName: 'SplitSave',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SplitSave - Financial Management App for Couples',
        type: 'image/png',
      },
      {
        url: '/og-image-mobile.png',
        width: 600,
        height: 315,
        alt: 'SplitSave - Financial Management App for Couples',
        type: 'image/png',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SplitSave - Smart Financial Management & Savings Goals for Couples',
    description: 'SplitSave helps couples manage shared expenses fairly, track savings goals together, and build financial harmony.',
    images: ['/og-image.png'],
    creator: '@splitsave',
    site: '@splitsave',
  },
    robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yahoo-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        {/* Viewport meta tag for mobile responsiveness */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        
        {/* Mobile-specific optimizations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SplitSave" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />


        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#7c3aed" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#7c3aed" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#7c3aed" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#1f2937" media="(prefers-color-scheme: dark)" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="author" content="SplitSave Team" />
        <meta name="copyright" content="SplitSave" />
        <meta name="language" content="English" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        
        {/* Social Media Meta Tags */}
        <meta property="og:site_name" content="SplitSave" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="en_GB" />
        <meta property="og:locale:alternate" content="en_CA" />
        <meta property="og:locale:alternate" content="en_AU" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@splitsave" />
        <meta name="twitter:creator" content="@splitsave" />
        <meta name="twitter:app:country" content="US" />
        <meta name="twitter:app:name:iphone" content="SplitSave" />
        <meta name="twitter:app:name:ipad" content="SplitSave" />
        <meta name="twitter:app:name:googleplay" content="SplitSave" />
        
        {/* Additional Performance Optimizations */}
        {/* Font preloading is handled automatically by Next.js */}
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "SplitSave",
              "url": "https://splitsave.app",
              "description": "Smart financial management app for couples to split expenses fairly and track savings goals together.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://splitsave.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        
        {/* COMPREHENSIVE MOBILE FIX - Prevent white screen without breaking dark mode */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --mobile-bg-light: #ffffff;
              --mobile-bg-dark: #111827;
            }

            /* Keep an initial background while React hydrates */
            html, body {
              background: var(--mobile-bg-light) !important;
              background-color: var(--mobile-bg-light) !important;
              margin: 0 !important;
              padding: 0 !important;
              min-height: 100vh !important;
              height: auto !important;
            }

            /* Respect dark theme class applied by next-themes */
            html.dark, html.dark body {
              background: var(--mobile-bg-dark) !important;
              background-color: var(--mobile-bg-dark) !important;
            }

            /* Force immediate background for mobile screens */
            @media screen and (max-width: 768px) {
              html, body, body > div, #__next {
                background: var(--mobile-bg-light) !important;
                background-color: var(--mobile-bg-light) !important;
                min-height: 100vh !important;
                height: auto !important;
              }

              html.dark, html.dark body, html.dark body > div, html.dark #__next {
                background: var(--mobile-bg-dark) !important;
                background-color: var(--mobile-bg-dark) !important;
              }

              * {
                box-sizing: border-box;
              }
            }

            /* Additional safety for very small screens */
            @media screen and (max-width: 480px) {
              html, body {
                min-height: 100dvh !important; /* Dynamic viewport height */
              }
            }
          `
        }} />
      </head>
      <body className="antialiased">
        {/* EMERGENCY TEST REMOVED - Using direct mobile bypass instead */}

        {/* iPhone Safari emergency fallback - shows if React fails to load */}
        <noscript>
          <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '20px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ maxWidth: '600px', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
                SplitSave
              </h1>
              <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
                Smart financial management for couples
              </p>
              <p style={{ color: '#ef4444' }}>
                JavaScript is required to use this application. Please enable JavaScript in your browser settings.
              </p>
            </div>
          </div>
        </noscript>
        
        {/* Mobile fallback completely removed to prevent white screen issues */}


        <PWAProvider>
          <AuthProvider>
            <ThemeProvider>
              <SafariRuntimeRepair />
              <MobilePWA>
                {children}
              </MobilePWA>
              <Analytics />
              <SpeedInsights />
            </ThemeProvider>
          </AuthProvider>
        </PWAProvider>
      </body>
    </html>
  )
}
