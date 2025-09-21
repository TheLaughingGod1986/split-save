'use client'

import { useEffect } from 'react'
import { structuredDataSchemas, StructuredDataSchemaKey } from '@/lib/structuredDataSchemas'

interface StructuredDataProps {
  type: Extract<StructuredDataSchemaKey, 'website' | 'organization' | 'webapp' | 'article' | 'faq' | 'financialService' | 'mobileApp'>
  data: any
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
    existingScripts.forEach(script => script.remove())

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(data)
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [data])

  return null
}

export { structuredDataSchemas } from '@/lib/structuredDataSchemas'

// Hook for easy structured data usage
export function useStructuredData() {
  const addStructuredData = (type: StructuredDataSchemaKey, customData?: any) => {
    const schema = customData || structuredDataSchemas[type]

    // Remove existing structured data
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
    existingScripts.forEach(script => script.remove())

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(schema)
    document.head.appendChild(script)
  }

  return { addStructuredData }
}
