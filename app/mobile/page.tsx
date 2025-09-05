'use client'

import { LandingPage } from '@/components/LandingPage'
import { StructuredData, structuredDataSchemas } from '@/components/ui/StructuredData'

export default function MobilePage() {
  console.log('🚨 MOBILE PAGE: Direct mobile page loaded')
  
  return (
    <>
      <StructuredData type="website" data={structuredDataSchemas.website} />
      <StructuredData type="organization" data={structuredDataSchemas.organization} />
      <StructuredData type="webapp" data={structuredDataSchemas.webapp} />
      <StructuredData type="financialService" data={structuredDataSchemas.financialService} />
      <LandingPage />
      {/* Debug overlay for mobile */}
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-50">
        <div>MOBILE PAGE: ACTIVE</div>
        <div>User Agent: {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) : 'N/A'}</div>
        <div>Screen: {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</div>
        <div>Time: {new Date().toLocaleTimeString()}</div>
      </div>
    </>
  )
}
