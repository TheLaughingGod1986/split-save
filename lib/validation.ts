import { z } from 'zod'

// Enhanced email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Input sanitization utilities
export const sanitizeInput = {
  /**
   * Sanitize text input by trimming whitespace and removing potentially dangerous characters
   */
  text: (input: string, maxLength = 500): string => {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>\"'&]/g, '') // Remove HTML/JS injection characters
      .replace(/\0/g, '') // Remove null bytes
  },

  /**
   * Sanitize email input with comprehensive validation
   */
  email: (input: string): string => {
    return input
      .trim()
      .toLowerCase()
      .slice(0, 254) // RFC 5321 limit
      .replace(/[<>\"'&\0]/g, '')
  },

  /**
   * Sanitize numeric input
   */
  number: (input: string): string => {
    return input
      .trim()
      .replace(/[^0-9.-]/g, '') // Only allow numbers, dots, and minus
      .slice(0, 20) // Reasonable length limit
  },

  /**
   * Sanitize description/note fields
   */
  description: (input: string): string => {
    return input
      .trim()
      .slice(0, 1000)
      .replace(/[<>\"'&\0]/g, '')
      .replace(/\s+/g, ' ') // Normalize whitespace
  },

  /**
   * Sanitize name fields
   */
  name: (input: string): string => {
    return input
      .trim()
      .slice(0, 100)
      .replace(/[<>\"'&\0]/g, '')
      .replace(/[^a-zA-Z0-9\s\-'.]/g, '') // Only allow letters, numbers, spaces, hyphens, dots, apostrophes
      .replace(/\s+/g, ' ') // Normalize whitespace
  }
}

// Enhanced validation functions
export const validationRules = {
  /**
   * Validate email with enhanced regex and security checks
   */
  email: (email: string): { isValid: boolean; error?: string } => {
    if (!email) {
      return { isValid: false, error: 'Email is required' }
    }

    const sanitized = sanitizeInput.email(email)
    
    if (sanitized.length < 5) {
      return { isValid: false, error: 'Email must be at least 5 characters long' }
    }

    if (!EMAIL_REGEX.test(sanitized)) {
      return { isValid: false, error: 'Please enter a valid email address' }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^[.-]/,           // Starting with dot or dash
      /[.-]$/,           // Ending with dot or dash
      /[.-]{2,}/,        // Consecutive dots or dashes
      /@[.-]/,           // @ followed by dot or dash
      /[.-]@/,           // dot or dash followed by @
    ]

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        return { isValid: false, error: 'Please enter a valid email format' }
      }
    }

    return { isValid: true }
  },

  /**
   * Validate password strength
   */
  password: (password: string): { isValid: boolean; error?: string; strength?: string } => {
    if (!password) {
      return { isValid: false, error: 'Password is required' }
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters long', strength: 'weak' }
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password must be less than 128 characters', strength: 'weak' }
    }

    // Check for at least one lowercase, uppercase, number, and special character
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

    const strengthScore = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

    if (strengthScore < 3) {
      return { 
        isValid: false, 
        error: 'Password must contain at least 3 of: lowercase letter, uppercase letter, number, special character',
        strength: 'weak'
      }
    }

    const strength = strengthScore === 4 ? 'strong' : 'medium'
    return { isValid: true, strength }
  },

  /**
   * Validate monetary amounts
   */
  amount: (amount: string | number): { isValid: boolean; error?: string } => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Please enter a valid amount' }
    }

    if (numAmount < 0) {
      return { isValid: false, error: 'Amount cannot be negative' }
    }

    if (numAmount > 10000000) { // 10 million limit
      return { isValid: false, error: 'Amount cannot exceed £10,000,000' }
    }

    // Check for reasonable decimal places (max 2)
    const decimalPlaces = (amount.toString().split('.')[1] || '').length
    if (decimalPlaces > 2) {
      return { isValid: false, error: 'Amount cannot have more than 2 decimal places' }
    }

    return { isValid: true }
  },

  /**
   * Validate text fields with XSS protection
   */
  text: (text: string, minLength = 1, maxLength = 500): { isValid: boolean; error?: string } => {
    if (!text || text.trim().length === 0) {
      return { isValid: false, error: 'This field is required' }
    }

    const sanitized = sanitizeInput.text(text, maxLength)

    if (sanitized.length < minLength) {
      return { isValid: false, error: `Must be at least ${minLength} character${minLength === 1 ? '' : 's'} long` }
    }

    if (sanitized.length > maxLength) {
      return { isValid: false, error: `Must be less than ${maxLength} characters` }
    }

    // Check for potentially malicious content
    const dangerousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
    ]

    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        return { isValid: false, error: 'Invalid characters detected' }
      }
    }

    return { isValid: true }
  }
}

// Enhanced Zod schemas with custom validation
export const expenseSchema = z.object({
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description must be less than 200 characters')
    .transform(val => sanitizeInput.description(val))
    .refine(val => validationRules.text(val, 1, 200).isValid, {
      message: 'Description contains invalid characters'
    }),
  amount: z.number()
    .positive('Amount must be positive')
    .max(10000000, 'Amount cannot exceed £10,000,000')
    .refine(val => {
      const validation = validationRules.amount(val)
      return validation.isValid
    }, { message: 'Invalid amount format' }),
  category: z.string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters')
    .transform(val => sanitizeInput.text(val, 50))
    .refine(val => validationRules.text(val, 1, 50).isValid, {
      message: 'Category contains invalid characters'
    }),
  date: z.string().optional(),
  message: z.string()
    .optional()
    .transform(val => val ? sanitizeInput.description(val) : val),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  recurring_end_date: z.string().optional(),
  notes: z.string()
    .optional()
    .transform(val => val ? sanitizeInput.description(val) : val)
})

export const expenseUpdateSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.string().optional(),
  message: z.string().optional(),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  recurring_end_date: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional()
})

export const goalSchema = z.object({
  name: z.string()
    .min(1, 'Goal name is required')
    .max(200, 'Goal name must be less than 200 characters')
    .transform(val => sanitizeInput.name(val))
    .refine(val => validationRules.text(val, 1, 200).isValid, {
      message: 'Goal name contains invalid characters'
    }),
  target_amount: z.number()
    .positive('Target amount must be positive')
    .max(10000000, 'Target amount cannot exceed £10,000,000')
    .refine(val => {
      const validation = validationRules.amount(val)
      return validation.isValid
    }, { message: 'Invalid target amount format' }),
  current_amount: z.number()
    .min(0, 'Current amount cannot be negative')
    .max(10000000, 'Current amount cannot exceed £10,000,000')
    .optional()
    .refine(val => val === undefined || validationRules.amount(val).isValid, {
      message: 'Invalid current amount format'
    }),
  target_date: z.string().optional(),
  description: z.string()
    .optional()
    .transform(val => val ? sanitizeInput.description(val) : val)
    .transform(val => val ? sanitizeInput.text(val, 50) : val),
  message: z.string()
    .optional()
    .transform(val => val ? sanitizeInput.description(val) : val),
  priority: z.number()
    .int('Priority must be an integer')
    .min(1, 'Priority must be at least 1')
    .max(5, 'Priority must be at most 5')
    .optional()
})

export const userProfileSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform(val => sanitizeInput.name(val))
    .refine(val => validationRules.text(val, 1, 100).isValid, {
      message: 'Name contains invalid characters'
    }),
  income: z.number()
    .positive('Income must be positive')
    .max(10000000, 'Income cannot exceed £10,000,000')
    .nullable()
    .optional()
    .refine(val => val === null || val === undefined || validationRules.amount(val).isValid, {
      message: 'Invalid income format'
    }),
  payday: z.string().nullable().optional(),
  personal_allowance: z.number()
    .min(0, 'Personal allowance cannot be negative')
    .max(10000000, 'Personal allowance cannot exceed £10,000,000')
    .nullable()
    .optional()
    .refine(val => val === null || val === undefined || validationRules.amount(val).isValid, {
      message: 'Invalid personal allowance format'
    }),
  currency: z.string()
    .length(3, 'Currency code must be exactly 3 characters')
    .optional()
    .transform(val => val?.toUpperCase()),
  country_code: z.string()
    .length(2, 'Country code must be exactly 2 characters')
    .optional()
    .transform(val => val?.toUpperCase())
})

export const partnershipInviteSchema = z.object({
  partnerEmail: z.string()
    .min(1, 'Email is required')
    .transform(val => sanitizeInput.email(val))
    .refine(val => validationRules.email(val).isValid, {
      message: 'Please enter a valid email address'
    })
})

// Additional validation schemas for enhanced security
export const authenticationSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .transform(val => sanitizeInput.email(val))
    .refine(val => validationRules.email(val).isValid, {
      message: 'Please enter a valid email address'
    }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .refine(val => validationRules.password(val).isValid, {
      message: 'Password must contain at least 3 of: lowercase letter, uppercase letter, number, special character'
    })
})

export const registrationSchema = authenticationSchema.extend({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .transform(val => sanitizeInput.name(val))
    .refine(val => validationRules.text(val, 1, 100).isValid, {
      message: 'Name contains invalid characters'
    }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})
