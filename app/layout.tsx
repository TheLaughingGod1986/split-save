import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'SplitSave - Collaborative Finance App for Couples & Partners',
    template: '%s | SplitSave'
  },
  description: 'SplitSave helps couples and partners manage shared expenses, track savings goals, and build financial harmony together. Free collaborative finance app with real-time expense tracking.',
  keywords: [
    'shared expenses',
    'couple finance',
    'partner finance',
    'split bills',
    'shared savings',
    'financial planning',
    'expense tracker',
    'budget app',
    'relationship money',
    'joint finances'
  ],
  authors: [{ name: 'SplitSave Team' }],
  creator: 'SplitSave',
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
    type: 'website',
    locale: 'en_US',
    url: 'https://splitsave.app',
    title: 'SplitSave - Collaborative Finance App for Couples & Partners',
    description: 'SplitSave helps couples and partners manage shared expenses, track savings goals, and build financial harmony together.',
    siteName: 'SplitSave',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SplitSave - Collaborative Finance App',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SplitSave - Collaborative Finance App for Couples & Partners',
    description: 'SplitSave helps couples and partners manage shared expenses, track savings goals, and build financial harmony together.',
    images: ['/og-image.png'],
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
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SplitSave" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#7c3aed" />
        
        {/* Structured Data for Rich Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "SplitSave",
              "description": "Collaborative finance app for couples and partners to manage shared expenses and savings goals",
              "url": "https://splitsave.app",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "SplitSave"
              },
              "featureList": [
                "Shared expense tracking",
                "Collaborative savings goals",
                "Real-time expense sharing",
                "Partner approval system",
                "Financial planning tools"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900">
        <AuthProvider>
          {children}
        </AuthProvider>
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                          const newWorker = registration.installing;
                          newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              // New content is available, refresh the page
                              if (confirm('New version available! Reload to update?')) {
                                window.location.reload();
                              }
                            }
                          });
                        });
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              } catch (error) {
                console.log('Service worker registration error:', error);
              }
            `
          }}
        />
      </body>
    </html>
  )
}
