import { supabase } from './supabase'

class ApiClient {
  private async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('Not authenticated')
    }
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }
  
  async get(endpoint: string) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`/api${endpoint}`, { headers })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return response.json()
  }
  
  async post(endpoint: string, data: any) {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    return response.json()
  }

  async put(endpoint: string, data: any): Promise<any> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`/api${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async delete(endpoint: string): Promise<any> {
    const headers = await this.getAuthHeaders()
    const response = await fetch(`/api${endpoint}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Partnership methods
  async getPartnerships(): Promise<PartnershipsResponse> {
    return this.get('/partnerships')
  }

  async sendPartnershipInvitation(toEmail: string, message?: string): Promise<any> {
    return this.post('/partnerships', { toEmail, message })
  }

  async respondToInvitation(invitationId: string, action: 'accept' | 'decline'): Promise<any> {
    return this.put(`/partnerships/invitations/${invitationId}`, { action })
  }

  async cancelInvitation(invitationId: string): Promise<any> {
    return this.delete(`/partnerships/invitations/${invitationId}`)
  }
}

export const apiClient = new ApiClient()

// Type definitions for API responses
export interface Expense {
  id: string
  name: string
  amount: number
  category: string
  frequency: string
  added_by: string
  status: string
  created_at: string
  added_by_user?: {
    id: string
    name: string
  }
}

export interface Goal {
  id: string
  name: string
  target_amount: number
  saved_amount: number
  goal_type: string
  priority: number
  added_by: string
  status: string
  created_at: string
  added_by_user?: {
    id: string
    name: string
  }
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
  status: 'pending' | 'active' | 'declined' | 'ended'
  created_at: string
  updated_at: string
  user1?: { id: string; name: string; email: string }
  user2?: { id: string; name: string; email: string }
}

export interface PartnershipInvitation {
  id: string
  from_user_id: string
  to_user_id: string
  message?: string
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  created_at: string
  updated_at: string
  expires_at: string
  from_user?: { id: string; name: string; email: string }
  to_user?: { id: string; name: string; email: string }
}

export interface PartnershipsResponse {
  partnerships: Partnership[]
  sentInvitations: PartnershipInvitation[]
  receivedInvitations: PartnershipInvitation[]
}
