// Basic type definitions for SplitSave application

export interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
  user_id: string
  partnership_id?: string
}

export interface Goal {
  id: string
  title: string
  description: string
  target_amount: number
  current_amount: number
  category: string
  deadline?: string
  user_id: string
  partnership_id?: string
}

export interface Partnership {
  id: string
  user1_id: string
  user2_id: string
  status: string
  created_at: string
  user1?: { name: string; email: string }
  user2?: { name: string; email: string }
}

export interface Profile {
  id: string
  user_id: string
  name: string
  email: string
  country_code: string
  currency: string
  income?: number
  payday?: number
  personal_allowance?: number
  created_at: string
  updated_at: string
}

export interface Approval {
  id: string
  type: 'expense' | 'goal' | 'partnership'
  status: 'pending' | 'approved' | 'rejected'
  data: any
  user_id: string
  partnership_id?: string
  created_at: string
}
