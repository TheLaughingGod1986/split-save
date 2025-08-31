import { z } from 'zod'

export const expenseSchema = z.object({
  description: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.string().min(1).max(50),
  date: z.string().optional(),
  message: z.string().optional(),
  is_recurring: z.boolean().optional(),
  recurring_frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  recurring_end_date: z.string().optional(),
  notes: z.string().optional()
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
  name: z.string().min(1).max(200),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).optional(),
  target_date: z.string().optional(),
  description: z.string().optional(),
  category: z.string().min(1).max(50).optional(),
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
