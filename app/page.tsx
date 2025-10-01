import { DesktopApp } from '@/components/DesktopApp'
import { MobileRedirect } from '@/components/MobileRedirect'

export default function Home() {
  return (
    <>
      <MobileRedirect />
      <DesktopApp />
    </>
  )
}