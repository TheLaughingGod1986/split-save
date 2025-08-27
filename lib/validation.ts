import { z } from 'zod'

export const expenseSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  message: z.string().optional()
})

export const goalSchema = z.object({
  name: z.string().min(1).max(200),
  targetAmount: z.number().positive(),
  description: z.string().optional(),
  priority: z.number().int().min(1).optional(),
  message: z.string().optional()
})

export const userProfileSchema = z.object({
  name: z.string().min(1).max(100),
  income: z.number().positive().nullable().optional(),
  payday: z.string().nullable().optional(),
  personal_allowance: z.number().min(0).nullable().optional(),
  currency: z.string().length(3).optional(),
  country_code: z.string().length(2).optional()
})

export const partnershipInviteSchema = z.object({
  partnerEmail: z.string().email()
})
