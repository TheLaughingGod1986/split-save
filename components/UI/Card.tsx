import React from 'react'
import { DESIGN_SYSTEM, getCardClasses } from '../DesignSystem'

interface CardProps {
  children: React.ReactNode
  className?: string
  interactive?: boolean
  onClick?: () => void
  'aria-label'?: string
  role?: string
}

export function Card({ 
  children, 
  className = '', 
  interactive = false, 
  onClick,
  'aria-label': ariaLabel,
  role
}: CardProps) {
  const baseClasses = getCardClasses(interactive)
  
  const Component = onClick ? 'button' : 'div'
  
  return (
    <Component
      className={`${baseClasses} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      role={role}
      {...(interactive && { tabIndex: 0 })}
    >
      {children}
    </Component>
  )
}
