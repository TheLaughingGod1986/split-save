import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { ThemeProvider } from '@/components/ThemeProvider'

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
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#7c3aed" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileImage" content="/mstile-144x144.png" />
        
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
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
