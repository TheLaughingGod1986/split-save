'use client'

import React from 'react'
import { useMobileOptimization } from '@/lib/mobile-optimization'

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
  mobileClassName?: string
  tabletClassName?: string
  desktopClassName?: string
  enableTouchOptimizations?: boolean
  enableHapticFeedback?: boolean
}

export function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
  enableTouchOptimizations = true,
  enableHapticFeedback = true
}: ResponsiveContainerProps) {
  const { isMobile, isTouch, vibrate } = useMobileOptimization()

  const handleTouchStart = () => {
    if (enableHapticFeedback && isTouch) {
      vibrate(10) // Light haptic feedback
    }
  }

  const getResponsiveClassName = () => {
    let responsiveClass = className

    if (isMobile) {
      responsiveClass += ` ${mobileClassName}`
    } else if (window.innerWidth <= 1024) {
      responsiveClass += ` ${tabletClassName}`
    } else {
      responsiveClass += ` ${desktopClassName}`
    }

    return responsiveClass.trim()
  }

  return (
    <div
      className={getResponsiveClassName()}
      onTouchStart={enableTouchOptimizations ? handleTouchStart : undefined}
    >
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: React.ReactNode
  mobileCols?: number
  tabletCols?: number
  desktopCols?: number
  gap?: string
  className?: string
}

export function ResponsiveGrid({
  children,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = '4',
  className = ''
}: ResponsiveGridProps) {
  const { isMobile } = useMobileOptimization()

  const getGridCols = () => {
    if (isMobile) return mobileCols
    if (window.innerWidth <= 1024) return tabletCols
    return desktopCols
  }

  return (
    <div
      className={`grid gap-${gap} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${getGridCols()}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  )
}

interface ResponsiveTextProps {
  children: React.ReactNode
  mobileSize?: string
  tabletSize?: string
  desktopSize?: string
  className?: string
}

export function ResponsiveText({
  children,
  mobileSize = 'text-sm',
  tabletSize = 'text-base',
  desktopSize = 'text-lg',
  className = ''
}: ResponsiveTextProps) {
  const { isMobile } = useMobileOptimization()

  const getTextSize = () => {
    if (isMobile) return mobileSize
    if (window.innerWidth <= 1024) return tabletSize
    return desktopSize
  }

  return (
    <span className={`${getTextSize()} ${className}`}>
      {children}
    </span>
  )
}

interface ResponsiveButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  mobileSize?: 'sm' | 'md' | 'lg'
  className?: string
  enableHapticFeedback?: boolean
}

export function ResponsiveButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  mobileSize,
  className = '',
  enableHapticFeedback = true
}: ResponsiveButtonProps) {
  const { isMobile, vibrate } = useMobileOptimization()

  const handleClick = () => {
    if (enableHapticFeedback && isMobile) {
      vibrate(20) // Medium haptic feedback
    }
    onClick?.()
  }

  const getSizeClasses = () => {
    const actualSize = mobileSize && isMobile ? mobileSize : size
    
    switch (actualSize) {
      case 'sm':
        return 'px-3 py-2 text-sm'
      case 'lg':
        return 'px-6 py-4 text-lg'
      default:
        return 'px-4 py-3 text-base'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
      case 'outline':
        return 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
      default:
        return 'bg-blue-500 text-white hover:bg-blue-600'
    }
  }

  const getTouchOptimizations = () => {
    if (isMobile) {
      return 'min-h-[44px] min-w-[44px] touch-manipulation'
    }
    return ''
  }

  return (
    <button
      onClick={handleClick}
      className={`
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${getTouchOptimizations()}
        rounded-lg font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        ${className}
      `}
    >
      {children}
    </button>
  )
}

interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  mobilePadding?: string
  tabletPadding?: string
  desktopPadding?: string
  enableTouchOptimizations?: boolean
}

export function ResponsiveCard({
  children,
  className = '',
  mobilePadding = 'p-4',
  tabletPadding = 'p-6',
  desktopPadding = 'p-8',
  enableTouchOptimizations = true
}: ResponsiveCardProps) {
  const { isMobile } = useMobileOptimization()

  const getPadding = () => {
    if (isMobile) return mobilePadding
    if (window.innerWidth <= 1024) return tabletPadding
    return desktopPadding
  }

  const getTouchOptimizations = () => {
    if (enableTouchOptimizations && isMobile) {
      return 'touch-manipulation'
    }
    return ''
  }

  return (
    <div
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl shadow-sm
        ${getPadding()}
        ${getTouchOptimizations()}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
