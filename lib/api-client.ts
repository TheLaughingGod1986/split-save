import { supabase } from './supabase'

class ApiClient {
  private requestCounts = new Map<string, number>()
  private lastRequestTime = new Map<string, number>()
  private readonly requestTimeoutMs = 8000

  private async request(endpoint: string, options: RequestInit, timeoutMs = this.requestTimeoutMs) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      return await fetch(`/api${endpoint}`, {
        ...options,
        signal: controller.signal
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error(`API ${options.method || 'GET'} ${endpoint} timed out after ${timeoutMs}ms`)
      }
      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }
  
  private async getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // Get the current session from Supabase
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      console.log('🔍 API Client - Session check:', { 
        hasSession: !!session, 
        hasAccessToken: !!session?.access_token,
        error: error?.message 
      })
      
      if (error) {
        console.warn('🔍 API Client - Session error:', error)
        // Try to refresh the session
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.warn('🔍 API Client - Failed to refresh session:', refreshError)
          // If refresh fails, clear the session and redirect to login
          if (refreshError.message?.includes('Invalid Refresh Token') || refreshError.message?.includes('Refresh Token Not Found')) {
            console.log('🔍 API Client - Invalid refresh token, clearing session')
            await supabase.auth.signOut()
            // Don't set authorization header for invalid tokens
            return headers
          }
        } else if (refreshedSession?.access_token) {
          headers['Authorization'] = `Bearer ${refreshedSession.access_token}`
          console.log('🔍 API Client - Using refreshed token')
        }
      } else if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
        console.log('🔍 API Client - Using existing token')
      } else {
        console.warn('🔍 API Client - No session or access token found')
      }
    } catch (error) {
      console.warn('🔍 API Client - Failed to get auth session:', error)
    }
    
    return headers
  }
  
  private shouldThrottle(endpoint: string): boolean {
    const now = Date.now()
    const lastTime = this.lastRequestTime.get(endpoint) || 0
    const count = this.requestCounts.get(endpoint) || 0
    
    // Reset count if more than 5 seconds have passed
    if (now - lastTime > 5000) {
      this.requestCounts.set(endpoint, 0)
      this.lastRequestTime.set(endpoint, now)
      return false
    }
    
    // Throttle if more than 3 requests in 5 seconds
    if (count >= 3) {
      return true
    }
    
    this.requestCounts.set(endpoint, count + 1)
    this.lastRequestTime.set(endpoint, now)
    return false
  }
  
  async get(endpoint: string) {
    // Check if we should throttle this request
    if (this.shouldThrottle(endpoint)) {
      console.warn(`API GET ${endpoint} throttled - too many requests`)
      return { data: [] }
    }
    
    try {
      const headers = await this.getAuthHeaders()
      console.log(`🔍 API GET ${endpoint} - Headers:`, { 
        hasAuth: !!headers.Authorization,
        contentType: headers['Content-Type']
      })
      
      const response = await this.request(endpoint, { headers })
      
      if (!response.ok) {
        console.warn(`🔍 API GET ${endpoint} failed with status: ${response.status}`)
        const errorText = await response.text()
        console.warn(`🔍 API GET ${endpoint} error response:`, errorText)
        
        // Special handling for 401 errors
        if (response.status === 401) {
          console.error(`🔍 API GET ${endpoint} - 401 Unauthorized. This usually means the user is not logged in or the session has expired.`)
        }
        
        throw new Error(`API GET ${endpoint} failed with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`🔍 API GET ${endpoint} - Success:`, { hasData: !!data })
      return { data }
    } catch (error) {
      console.warn(`🔍 API GET ${endpoint} failed:`, error)
      throw error
    }
  }
  
  async post(endpoint: string, data: any) {
    try {
      const headers = await this.getAuthHeaders()
      const response = await this.request(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        console.warn(`API POST ${endpoint} failed with status: ${response.status}`)
        const errorText = await response.text()
        console.warn(`API POST ${endpoint} error response:`, errorText)
        throw new Error(`API POST ${endpoint} failed with status: ${response.status}`)
      }

      const result = await response.json()
      return { data: result }
    } catch (error) {
      console.warn(`API POST ${endpoint} failed:`, error)
      throw error
    }
  }

  async put(endpoint: string, data: any): Promise<any> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await this.request(endpoint, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        console.warn(`API PUT ${endpoint} failed with status: ${response.status}`)
        const errorText = await response.text()
        console.warn(`API PUT ${endpoint} error response:`, errorText)
        throw new Error(`API PUT ${endpoint} failed with status: ${response.status}`)
      }

      const result = await response.json()
      return { data: result }
    } catch (error) {
      console.warn(`API PUT ${endpoint} failed:`, error)
      throw error
    }
  }

  async delete(endpoint: string): Promise<any> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await this.request(endpoint, {
        method: 'DELETE',
        headers
      })

      if (!response.ok) {
        console.warn(`API DELETE ${endpoint} failed with status: ${response.status}`)
        const errorText = await response.text()
        console.warn(`API DELETE ${endpoint} error response:`, errorText)
        throw new Error(`API DELETE ${endpoint} failed with status: ${response.status}`)
      }

      const result = await response.json()
      return { data: result }
    } catch (error) {
      console.warn(`API DELETE ${endpoint} failed:`, error)
      throw error
    }
  }

  async updateExpense(id: string, data: any): Promise<any> {
    return this.put(`/expenses/${id}`, data)
  }

  async deleteExpense(id: string): Promise<any> {
    return this.delete(`/expenses/${id}`)
  }

  // Partnership methods
  async getPartnerships(): Promise<PartnershipsResponse> {
    const response = await this.get('/invite')
    return response.data
  }

  async sendPartnershipInvitation(toEmail: string): Promise<any> {
    console.log('=== API CLIENT: sendPartnershipInvitation START ===')
    console.log('1. Called with toEmail:', toEmail)
    console.log('2. Making POST request to /invite')
    
    try {
      const response = await this.post('/invite', { toEmail })
      console.log('3. API response received:', response)
      return response
    } catch (error) {
      console.error('4. API client error:', error)
      throw error
    } finally {
      console.log('=== API CLIENT: sendPartnershipInvitation END ===')
    }
  }

  async respondToInvitation(invitationId: string, action: 'accept' | 'decline'): Promise<any> {
    const response = await this.post('/invite/respond', { invitationId, action })
    return response
  }

  async cancelInvitation(invitationId: string): Promise<any> {
    return this.delete(`/partnerships/invitations/${invitationId}`)
  }

  async removePartnership(partnershipId: string): Promise<any> {
    return this.delete(`/partnerships?id=${partnershipId}`)
  }
}

export const apiClient = new ApiClient()

// Type definitions for API responses
export interface Expense {
  id: string
  description: string
  amount: number
  category: string
  date: string
  added_by_user_id: string
  partnership_id: string
  created_at: string
  updated_at?: string
  is_recurring?: boolean
  recurring_frequency?: 'weekly' | 'monthly' | 'yearly' | null
  recurring_end_date?: string | null
  notes?: string
  status: 'active' | 'archived' | 'deleted'
  added_by_user?: {
    id: string
    name: string
  }
}

export interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  target_date?: string
  description?: string
  category?: string
  priority?: number
  added_by_user_id: string
  partnership_id: string
  created_at: string
  updated_at?: string
  
  // Prioritization fields
  recommended_amount?: number
  recommended_deadline?: string
  recommended_priority?: number
  allocation_percentage?: number
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
  last_recommendation_date?: string
  recommendation_reason?: string
  
  // Feasibility fields
  monthly_contribution_needed?: number
  days_to_deadline?: number
  is_feasible?: boolean
  feasibility_score?: number
  
  added_by_user?: {
    id: string
    name: string
  }
  contributions?: Array<{
    id: string
    amount: number
    message?: string
    month?: number
    year?: number
    expected_amount?: number
    over_under_amount?: number
    created_at: string
    user?: {
      id: string
      name: string
    }
  }>
}

export interface ApprovalRequest {
  id: string
  request_type: string
  request_data: any
  message?: string
  status: string
  created_at: string
  requested_by_user?: {
    id: string
    name: string
  }
}

export interface UserProfile {
  id: string
  email: string
  name: string
  avatar_url?: string
  country_code: string
  currency: string
  income?: number
  payday?: string
  personal_allowance?: number
  created_at: string
  updated_at: string
}

// Partnership types
export interface Partnership {
  id: string
  user1_id: string
  user2_id: string
  status: string
  created_at: string
  user1?: {
    id: string
    name: string
    email: string
  }
  user2?: {
    id: string
    name: string
    email: string
  }
}

export interface PartnershipInvitation {
  id: string
  from_user_id: string
  to_user_id?: string
  to_email: string
  status: string
  created_at: string
  expires_at: string
}

export interface PartnershipsResponse {
  partnerships: Partnership[]
  invitations: PartnershipInvitation[]
}

export interface MonthlyContribution {
  id: string
  partnership_id: string
  month: string // YYYY-MM format
  user1_amount: number
  user2_amount: number
  user1_paid: boolean
  user2_paid: boolean
  user1_paid_date?: string
  user2_paid_date?: string
  total_required: number
  created_at: string
  updated_at: string
}
