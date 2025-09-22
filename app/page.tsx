import dynamic from 'next/dynamic'
import { MarketingLandingFallback } from '@/components/marketing/MarketingLandingFallback'

const HomeClient = dynamic(() => import('./home-client'), {
  loading: () => <MarketingLandingFallback />
})

export default function Page() {
  return <HomeClient />
}
