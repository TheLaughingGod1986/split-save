import { NextRequest } from 'next/server'
import { supabaseAdmin } from './supabase'

export interface AuthUser {
  id: string
  email: string
  partnershipId?: string
}

export async function authenticateRequest(req: NextRequest): Promise<AuthUser | null> {
  console.log('🔐 AUTH: Starting authentication for request')
  
  const authHeader = req.headers.get('authorization')
  console.log('🔐 AUTH: Authorization header:', authHeader ? 'Present' : 'Missing')
  
  if (!authHeader?.startsWith('Bearer ')) {
    console.log('🔐 AUTH: No Bearer token found')
    return null
  }

  const token = authHeader.substring(7)
  console.log('🔐 AUTH: Token length:', token.length)
  
  try {
    console.log('🔐 AUTH: Calling supabaseAdmin.auth.getUser...')
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error) {
      console.log('🔐 AUTH: Supabase auth error:', error)
      return null
    }
    
    if (!user) {
      console.log('🔐 AUTH: No user returned from Supabase')
      return null
    }
    
    console.log('🔐 AUTH: User authenticated successfully:', { id: user.id, email: user.email })

    // Get user's partnership (handle gracefully if there are database issues)
    try {
      console.log('🔐 AUTH: Querying partnerships for user:', user.id)
      const { data: partnerships, error: partnershipError } = await supabaseAdmin
        .from('partnerships')
        .select('id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'active')
        .single()

      if (partnershipError) {
        console.log('🔐 AUTH: Partnership query error (non-fatal):', partnershipError)
      } else {
        console.log('🔐 AUTH: Partnership found:', partnerships?.id)
      }

      return {
        id: user.id,
        email: user.email!,
        partnershipId: partnerships?.id
      }
    } catch (partnershipError) {
      // If partnership query fails, still return authenticated user
      console.log('🔐 AUTH: Partnership query failed, but user is authenticated:', partnershipError)
      return {
        id: user.id,
        email: user.email!,
        partnershipId: undefined
      }
    }
  } catch (error) {
    console.error('🔐 AUTH: Unexpected auth error:', error)
    return null
  }
}
