'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  quality?: number
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '100vw',
  quality = 80,
  placeholder = 'empty',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!imageRef.current || priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1
      }
    )

    observer.observe(imageRef.current)

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  // Show loading skeleton while not in view
  if (!isInView && !priority) {
    return (
      <div
        ref={imageRef}
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse rounded ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px'
        }}
      />
    )
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded flex items-center justify-center ${className}`}
        style={{
          width: width || '100%',
          height: height || '200px'
        }}
      >
        <div className="text-center text-red-600 dark:text-red-400">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm">Failed to load image</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={imageRef} className={`relative ${className}`}>
      {/* Loading skeleton */}
      {!isLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
          style={{
            width: width || '100%',
            height: height || '200px'
          }}
        />
      )}

      {/* Optimized image */}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={placeholder}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          width: width || '100%',
          height: height || 'auto'
        }}
      />

      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
        </div>
      )}
    </div>
  )
}

// Responsive image component with automatic sizing
export function ResponsiveImage({
  src,
  alt,
  className = '',
  aspectRatio = 16 / 9,
  ...props
}: Omit<OptimizedImageProps, 'width' | 'height'> & {
  aspectRatio?: number
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className="relative w-full"
        style={{
          paddingBottom: `${(1 / aspectRatio) * 100}%`
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover rounded"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          {...props}
        />
      </div>
    </div>
  )
}

// Lazy loaded image with intersection observer
export function LazyImage(props: OptimizedImageProps) {
  return <OptimizedImage {...props} priority={false} />
}

// Priority image for above-the-fold content
export function PriorityImage(props: OptimizedImageProps) {
  return <OptimizedImage {...props} priority={true} />
}
