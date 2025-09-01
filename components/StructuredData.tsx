'use client'

import { useEffect } from 'react'

interface StructuredDataProps {
  type: 'website' | 'organization' | 'webapp' | 'article' | 'faq'
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

// Predefined structured data schemas
export const structuredDataSchemas = {
  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SplitSave',
    url: 'https://splitsave.app',
    description: 'Smart financial management app for couples to split expenses fairly and track savings goals together.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://splitsave.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: 'SplitSave',
      logo: {
        '@type': 'ImageObject',
        url: 'https://splitsave.app/logo.png'
      }
    }
  },

  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SplitSave',
    url: 'https://splitsave.app',
    logo: 'https://splitsave.app/logo.png',
    description: 'Making financial management fair and transparent for couples.',
    sameAs: [
      'https://twitter.com/splitsave',
      'https://linkedin.com/company/splitsave',
      'https://facebook.com/splitsave'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-0123',
      contactType: 'customer service',
      email: 'support@splitsave.app'
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
      addressLocality: 'San Francisco',
      addressRegion: 'CA'
    }
  },

  webapp: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SplitSave',
    url: 'https://splitsave.app',
    description: 'Smart financial management app for couples to split expenses fairly and track savings goals together.',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    softwareVersion: '1.0.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free to start with premium features available'
    },
    featureList: [
      'Proportional expense splitting',
      'Shared savings goals',
      'Real-time synchronization',
      'Mobile-first design',
      'Bank-level security',
      'Gamified progress tracking'
    ],
    screenshot: 'https://splitsave.app/screenshot.png',
    author: {
      '@type': 'Organization',
      name: 'SplitSave Team'
    }
  },

  article: (articleData: {
    title: string
    description: string
    author: string
    datePublished: string
    dateModified: string
    image: string
    url: string
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: articleData.title,
    description: articleData.description,
    image: articleData.image,
    author: {
      '@type': 'Person',
      name: articleData.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'SplitSave',
      logo: {
        '@type': 'ImageObject',
        url: 'https://splitsave.app/logo.png'
      }
    },
    datePublished: articleData.datePublished,
    dateModified: articleData.dateModified,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleData.url
    }
  }),

  faq: (faqData: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  }),

  // Financial service specific schema
  financialService: {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: 'SplitSave',
    description: 'Smart financial management and expense splitting service for couples',
    url: 'https://splitsave.app',
    areaServed: {
      '@type': 'Country',
      name: 'Worldwide'
    },
    serviceType: [
      'Expense Management',
      'Budget Planning',
      'Savings Tracking',
      'Financial Transparency'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'SplitSave Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Free Plan',
            description: 'Basic expense splitting and goal tracking'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Premium Plan',
            description: 'Advanced analytics, unlimited goals, and priority support'
          }
        }
      ]
    }
  },

  // Mobile app schema
  mobileApp: {
    '@context': 'https://schema.org',
    '@type': 'MobileApplication',
    name: 'SplitSave',
    description: 'Smart financial management app for couples',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web Browser (PWA)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1'
    },
    author: {
      '@type': 'Organization',
      name: 'SplitSave Team'
    }
  }
}

// Hook for easy structured data usage
export function useStructuredData() {
  const addStructuredData = (type: keyof typeof structuredDataSchemas, customData?: any) => {
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
