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
    console.log('=== API CLIENT: post method START ===')
    console.log('1. POST endpoint:', endpoint)
    console.log('2. POST data:', data)
    console.log('3. Full URL:', `/api${endpoint}`)
    
    const headers = await this.getAuthHeaders()
    console.log('4. Auth headers:', headers)
    
    try {
      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
      })
      
      console.log('5. Response status:', response.status)
      console.log('6. Response ok:', response.ok)
      console.log('7. Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.error('8. Response not ok - throwing error')
        throw new Error(`API error: ${response.status}`)
      }

      const responseData = await response.json()
      console.log('9. Response data:', responseData)
      return responseData
    } catch (error) {
      console.error('10. POST method error:', error)
      throw error
    } finally {
      console.log('=== API CLIENT: post method END ===')
    }
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
    const response = await this.get('/invite')
    return response
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
  name: string
  amount: number
  category: string
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
