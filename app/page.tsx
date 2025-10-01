import { DesktopApp } from '@/components/DesktopApp'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get user agent from headers to detect mobile devices
  const headersList = headers()
  const userAgent = headersList.get('user-agent') || ''
  
  // Simple mobile detection
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  // Check if user explicitly wants desktop version
  const forceDesktop = searchParams.desktop === 'true'

  if (isMobile && !forceDesktop) {
    // Redirect mobile users to the mobile-specific page
    redirect('/mobile')
  }

  // Desktop version
  return <DesktopApp />
}