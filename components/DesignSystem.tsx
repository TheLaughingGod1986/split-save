// Design System Constants for Consistent UI
export const DESIGN_SYSTEM = {
  // Color System
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    purple: {
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9'
    },
    success: {
      50: '#f0fdf4',
      500: '#22c55e',
      600: '#16a34a'
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706'
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626'
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },

  // Typography Scale
  typography: {
    display: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg md:text-xl font-semibold',
    h4: 'text-base md:text-lg font-semibold',
    body: 'text-sm md:text-base',
    bodyLarge: 'text-base md:text-lg',
    caption: 'text-xs md:text-sm',
    overline: 'text-xs uppercase tracking-wide font-medium'
  },

  // Spacing System
  spacing: {
    mobile: {
      xs: 'p-2',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8'
    },
    desktop: {
      xs: 'p-3',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      xl: 'p-12'
    }
  },

  // Component Sizes
  components: {
    button: {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-base min-h-[44px]',
      lg: 'px-6 py-4 text-lg min-h-[52px]'
    },
    input: {
      sm: 'px-3 py-2 text-sm min-h-[36px]',
      md: 'px-4 py-3 text-base min-h-[44px]',
      lg: 'px-6 py-4 text-lg min-h-[52px]'
    },
    card: {
      padding: 'p-4 md:p-6',
      border: 'border border-gray-200 dark:border-gray-700',
      radius: 'rounded-xl',
      shadow: 'shadow-sm hover:shadow-md transition-shadow duration-200'
    }
  },

  // Animation System
  animations: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out',
    spring: 'transition-all duration-200 cubic-bezier(0.34, 1.56, 0.64, 1)',
    hover: 'transform hover:scale-105 active:scale-95',
    fadeIn: 'animate-fade-in-up',
    slideUp: 'animate-slide-up'
  },

  // Responsive Breakpoints
  breakpoints: {
    mobile: 'max-width: 640px',
    tablet: 'min-width: 641px and max-width: 1024px',
    desktop: 'min-width: 1025px'
  }
}

// Component Classes Generator
export const getButtonClasses = (variant: 'primary' | 'secondary' | 'outline' | 'ghost', size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseClasses = `font-medium rounded-lg ${DESIGN_SYSTEM.animations.normal} ${DESIGN_SYSTEM.animations.hover} ${DESIGN_SYSTEM.components.button[size]} focus:outline-none focus:ring-2 focus:ring-offset-2`
  
  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl focus:ring-purple-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-lg hover:shadow-xl focus:ring-gray-500',
    outline: 'border-2 border-purple-500 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:ring-purple-500',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 focus:ring-gray-500'
  }
  
  return `${baseClasses} ${variants[variant]}`
}

export const getCardClasses = (interactive: boolean = false) => {
  const baseClasses = `bg-white dark:bg-gray-800 ${DESIGN_SYSTEM.components.card.border} ${DESIGN_SYSTEM.components.card.radius} ${DESIGN_SYSTEM.components.card.padding} ${DESIGN_SYSTEM.components.card.shadow}`
  
  if (interactive) {
    return `${baseClasses} cursor-pointer ${DESIGN_SYSTEM.animations.normal} hover:shadow-lg transform hover:-translate-y-1`
  }
  
  return baseClasses
}

export const getInputClasses = (size: 'sm' | 'md' | 'lg' = 'md', hasError: boolean = false) => {
  const baseClasses = `w-full border rounded-lg ${DESIGN_SYSTEM.animations.normal} dark:bg-gray-700 dark:text-white ${DESIGN_SYSTEM.components.input[size]} focus:outline-none focus:ring-2 focus:ring-offset-0`
  
  const borderClasses = hasError 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:ring-purple-500'
  
  return `${baseClasses} ${borderClasses}`
}
