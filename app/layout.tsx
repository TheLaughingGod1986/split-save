import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import SEO from '../components/SEO'
import { usePerformance } from '../lib/usePerformance'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: 'SplitSave - Smart Financial Management & Savings Goals',
  description: 'SplitSave helps you manage shared expenses, track savings goals, and build financial security with AI-powered insights and gamified progress tracking.',
  keywords: 'financial management, savings goals, expense tracking, budget planning, AI insights, financial security, money management app',
  authors: [{ name: 'SplitSave Team' }],
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
    title: 'SplitSave - Smart Financial Management & Savings Goals',
    description: 'SplitSave helps you manage shared expenses, track savings goals, and build financial security with AI-powered insights and gamified progress tracking.',
    url: 'https://splitsave.app',
    siteName: 'SplitSave',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SplitSave - Financial Management App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SplitSave - Smart Financial Management & Savings Goals',
    description: 'SplitSave helps you manage shared expenses, track savings goals, and build financial security with AI-powered insights and gamified progress tracking.',
    images: ['/og-image.png'],
    creator: '@splitsave',
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
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Essential mobile meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SplitSave" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/api/health" as="fetch" crossOrigin="anonymous" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//api.splitsave.app" />
        
        {/* Resource hints */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.splitsave.app" />
        
        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for above-the-fold content */
            body { margin: 0; font-family: ${inter.style.fontFamily}, system-ui, sans-serif; }
            .loading { display: flex; justify-content: center; align-items: center; min-height: 200px; }
          `
        }} />
      </head>
      <body className="antialiased">
        {/* Performance monitoring script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Performance monitoring
              if ('PerformanceObserver' in window) {
                try {
                  // Core Web Vitals
                  new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                      }
                    }
                  }).observe({ entryTypes: ['largest-contentful-paint'] });
                  
                  // First Input Delay
                  new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                      }
                    }
                  }).observe({ entryTypes: ['first-input'] });
                  
                  // Cumulative Layout Shift
                  let cls = 0;
                  new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                      if (!entry.hadRecentInput) {
                        cls += entry.value;
                        console.log('CLS:', cls);
                      }
                    }
                  }).observe({ entryTypes: ['layout-shift'] });
                } catch (e) {
                  console.warn('Performance monitoring failed:', e);
                }
              }
            `
          }}
        />
        
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
        
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `
          }}
        />
      </body>
    </html>
  )
}
