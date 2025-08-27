import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata = {
  title: 'SplitSave - Collaborative Finance App',
  description: 'Manage shared expenses and savings goals with your partner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
