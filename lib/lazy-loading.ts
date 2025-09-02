'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

// Lazy load heavy components for better performance
const LoadingSpinner = () => React.createElement('div', {
  className: 'flex items-center justify-center p-8'
}, React.createElement('div', {
  className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'
}))

export const LazyAdvancedAnalytics = dynamic(
  () => import('@/components/AdvancedAnalyticsDashboard').then(mod => ({ default: mod.AdvancedAnalyticsDashboard })),
  { 
    loading: LoadingSpinner,
    ssr: false 
  }
)

export const LazyAdvancedForecasting = dynamic(
  () => import('@/components/AdvancedFinancialForecasting'),
  { 
    loading: LoadingSpinner,
    ssr: false 
  }
)

export const LazyDataVisualization = dynamic(
  () => import('@/components/DataVisualization').then(mod => ({ default: mod.DataVisualization })),
  { 
    loading: LoadingSpinner,
    ssr: false 
  }
)

export const LazyPerformanceMonitor = dynamic(
  () => import('@/components/PerformanceMonitor').then(mod => ({ default: mod.PerformanceMonitor })),
  { 
    loading: LoadingSpinner,
    ssr: false 
  }
)

export const LazyMLInsights = dynamic(
  () => import('@/components/MLInsightsPanel').then(mod => ({ default: mod.MLInsightsPanel })),
  { 
    loading: LoadingSpinner,
    ssr: false 
  }
)

// Utility for creating lazy components with consistent loading states
export function createLazyComponent<T = {}>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: React.ReactElement
) {
  return dynamic(importFunc, {
    loading: () => fallback || LoadingSpinner(),
    ssr: false
  })
}

// Preload critical components
export function preloadComponents() {
  if (typeof window !== 'undefined') {
    // Preload components that are likely to be used
    import('@/components/GoalsHub')
    import('@/components/MoneyHub')
    import('@/components/PartnerHub')
  }
}
