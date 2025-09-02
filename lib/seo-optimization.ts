'use client'

import React from 'react'

/**
 * SEO optimization utilities for SplitSave
 * Enhances search engine visibility and social media sharing
 */

export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  ogType?: string
  twitterCard?: string
  canonicalUrl?: string
  structuredData?: any
}

export class SEOOptimizer {
  private static instance: SEOOptimizer
  private defaultConfig: SEOConfig

  constructor() {
    this.defaultConfig = {
      title: 'SplitSave - Fair Financial Management for Couples',
      description: 'SplitSave helps couples fairly manage shared expenses and savings goals. Calculate proportional contributions, track progress, and achieve financial goals together.',
      keywords: [
        'couple finance',
        'shared expenses',
        'savings goals',
        'financial planning',
        'budgeting app',
        'proportional split',
        'money management',
        'relationship finance'
      ],
      ogType: 'website',
      twitterCard: 'summary_large_image'
    }
  }

  static getInstance(): SEOOptimizer {
    if (!SEOOptimizer.instance) {
      SEOOptimizer.instance = new SEOOptimizer()
    }
    return SEOOptimizer.instance
  }

  /**
   * Update page metadata
   */
  updatePageMetadata(config: Partial<SEOConfig>) {
    const fullConfig = { ...this.defaultConfig, ...config }
    
    // Update title
    if (typeof document !== 'undefined') {
      document.title = fullConfig.title
    }

    // Update meta tags
    this.updateMetaTag('description', fullConfig.description)
    this.updateMetaTag('keywords', fullConfig.keywords.join(', '))
    
    // Update Open Graph tags
    this.updateMetaTag('og:title', fullConfig.title, 'property')
    this.updateMetaTag('og:description', fullConfig.description, 'property')
    if (fullConfig.ogType) {
      this.updateMetaTag('og:type', fullConfig.ogType, 'property')
    }
    if (fullConfig.ogImage) {
      this.updateMetaTag('og:image', fullConfig.ogImage, 'property')
    }
    if (fullConfig.canonicalUrl) {
      this.updateMetaTag('og:url', fullConfig.canonicalUrl, 'property')
    }

    // Update Twitter Card tags
    if (fullConfig.twitterCard) {
      this.updateMetaTag('twitter:card', fullConfig.twitterCard)
    }
    this.updateMetaTag('twitter:title', fullConfig.title)
    this.updateMetaTag('twitter:description', fullConfig.description)
    if (fullConfig.ogImage) {
      this.updateMetaTag('twitter:image', fullConfig.ogImage)
    }

    // Update canonical URL
    if (fullConfig.canonicalUrl) {
      this.updateCanonicalUrl(fullConfig.canonicalUrl)
    }

    // Add structured data
    if (fullConfig.structuredData) {
      this.addStructuredData(fullConfig.structuredData)
    }
  }

  private updateMetaTag(name: string, content: string, attribute: string = 'name') {
    if (typeof document === 'undefined') return

    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
    
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attribute, name)
      document.head.appendChild(meta)
    }
    
    meta.setAttribute('content', content)
  }

  private updateCanonicalUrl(url: string) {
    if (typeof document === 'undefined') return

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    
    canonical.setAttribute('href', url)
  }

  private addStructuredData(data: any) {
    if (typeof document === 'undefined') return

    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]')
    if (existingScript) {
      existingScript.remove()
    }

    // Add new structured data
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  /**
   * Generate structured data for the app
   */
  generateAppStructuredData() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'SplitSave',
      description: 'Fair financial management app for couples',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      creator: {
        '@type': 'Person',
        name: 'Benjamin Oats'
      },
      featureList: [
        'Proportional expense splitting',
        'Shared savings goals',
        'Payday reminders',
        'Financial tracking',
        'Gamification',
        'Safety pot management'
      ]
    }
  }

  /**
   * Generate structured data for a specific page
   */
  generatePageStructuredData(pageType: string, data: any) {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      url: typeof window !== 'undefined' ? window.location.href : '',
      name: document.title,
      description: this.getMetaContent('description')
    }

    switch (pageType) {
      case 'dashboard':
        return {
          ...baseData,
          '@type': 'WebPage',
          mainEntity: {
            '@type': 'FinancialService',
            name: 'SplitSave Dashboard',
            description: 'Personal financial dashboard for couples'
          }
        }
      
      case 'goals':
        return {
          ...baseData,
          '@type': 'WebPage',
          mainEntity: {
            '@type': 'FinancialGoal',
            name: 'Savings Goals',
            description: 'Track and manage shared savings goals'
          }
        }
      
      default:
        return baseData
    }
  }

  private getMetaContent(name: string): string {
    if (typeof document === 'undefined') return ''
    
    const meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
    return meta?.content || ''
  }
}

// Create global instance
export const seoOptimizer = SEOOptimizer.getInstance()

// Utility functions
export const seoUtils = {
  /**
   * Generate page-specific SEO config
   */
  generatePageSEO(page: string, data?: any): Partial<SEOConfig> {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    
    switch (page) {
      case 'dashboard':
        return {
          title: 'Dashboard - SplitSave',
          description: 'Manage your shared expenses and savings goals with your partner.',
          canonicalUrl: `${baseUrl}/dashboard`,
          structuredData: seoOptimizer.generatePageStructuredData('dashboard', data)
        }
      
      case 'goals':
        return {
          title: 'Savings Goals - SplitSave',
          description: 'Track and achieve your shared savings goals together.',
          canonicalUrl: `${baseUrl}/goals`,
          structuredData: seoOptimizer.generatePageStructuredData('goals', data)
        }
      
      case 'analytics':
        return {
          title: 'Financial Analytics - SplitSave',
          description: 'Analyze your financial progress and get insights.',
          canonicalUrl: `${baseUrl}/analytics`,
          structuredData: seoOptimizer.generatePageStructuredData('analytics', data)
        }
      
      default:
        return {
          title: 'SplitSave - Fair Financial Management for Couples',
          description: 'SplitSave helps couples fairly manage shared expenses and savings goals.',
          canonicalUrl: baseUrl
        }
    }
  },

  /**
   * Generate social media sharing data
   */
  generateSocialShareData(page: string, data?: any) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    
    return {
      title: `SplitSave - ${page}`,
      description: `Track your shared financial goals with SplitSave`,
      url: `${baseUrl}/${page}`,
      image: `${baseUrl}/og-image.png`
    }
  },

  /**
   * Track page views for analytics
   */
  trackPageView(page: string, data?: any) {
    // This would integrate with your analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: page,
        page_location: window.location.href,
        custom_map: data
      })
    }
  }
}

// React hook for SEO
export function useSEO(page: string, data?: any) {
  React.useEffect(() => {
    const seoConfig = seoUtils.generatePageSEO(page, data)
    seoOptimizer.updatePageMetadata(seoConfig)
    
    // Track page view
    seoUtils.trackPageView(page, data)
  }, [page, data])

  return {
    updateSEO: (config: Partial<SEOConfig>) => {
      seoOptimizer.updatePageMetadata(config)
    },
    generateSocialShare: () => seoUtils.generateSocialShareData(page, data)
  }
}
