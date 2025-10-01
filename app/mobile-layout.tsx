import type { Metadata } from 'next'
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

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
            }
            
            html, body {
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
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
