import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

export const metadata: Metadata = {
  title: 'SplitSave - Mobile',
  description: 'Smart financial management for couples - Mobile version',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#3b82f6',
}

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #f8fafc !important;
              background-color: #f8fafc !important;
              min-height: 100vh !important;
              height: auto !important;
              overflow-x: hidden !important;
              -webkit-text-size-adjust: 100%;
              -ms-text-size-adjust: 100%;
            }

            body {
              font-family: system-ui, -apple-system, sans-serif;
              line-height: 1.6;
            }

            /* Floating animation for mobile hero elements */
            @keyframes float {
              0%,
              100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-10px);
              }
            }
          `,
        }}
      />
      {children}
    </div>
  )
}
