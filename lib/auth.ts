import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabase'

export interface AuthUser {
  id: string
  email: string
  partnershipId?: string
}

export async function authenticateRequest(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }

    // Get user's partnership (handle gracefully if there are database issues)
    try {
      const { data: partnerships } = await supabaseAdmin
        .from('partnerships')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active')
        .single()

      return {
        id: user.id,
        email: user.email!,
        partnershipId: partnerships?.id
      }
    } catch (partnershipError) {
      // If partnership query fails, still return authenticated user
      console.log('Partnership query failed, but user is authenticated:', partnershipError)
      return {
        id: user.id,
        email: user.email!,
        partnershipId: undefined
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}
