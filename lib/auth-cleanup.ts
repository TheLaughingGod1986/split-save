/**
 * Authentication cleanup utilities
 * Handles clearing invalid tokens and session data
 */

import { supabase } from './supabase'

export class AuthCleanup {
  /**
   * Clear all authentication data from storage
   */
  static async clearAllAuthData(): Promise<void> {
    try {
      console.log('🧹 Clearing all authentication data...')
      
      // Sign out from Supabase (this clears the session)
      await supabase.auth.signOut()
      
      // Clear any additional storage keys that might contain auth data
      if (typeof window !== 'undefined') {
        // Clear localStorage
        const keysToRemove = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (
            key.includes('supabase') || 
            key.includes('auth') || 
            key.includes('token') ||
            key.includes('session')
          )) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          console.log('🧹 Removed localStorage key:', key)
        })
        
        // Clear sessionStorage
        const sessionKeysToRemove = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (
            key.includes('supabase') || 
            key.includes('auth') || 
            key.includes('token') ||
            key.includes('session')
          )) {
            sessionKeysToRemove.push(key)
          }
        }
        
        sessionKeysToRemove.forEach(key => {
          sessionStorage.removeItem(key)
          console.log('🧹 Removed sessionStorage key:', key)
        })
      }
      
      console.log('✅ Authentication data cleared successfully')
    } catch (error) {
      console.error('❌ Error clearing authentication data:', error)
    }
  }
  
  /**
   * Check if current session is valid
   */
  static async isSessionValid(): Promise<boolean> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.warn('🔍 Session check error:', error)
        return false
      }
      
      if (!session) {
        console.log('🔍 No session found')
        return false
      }
      
      // Check if token is expired
      if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
        console.log('🔍 Session expired')
        return false
      }
      
      console.log('✅ Session is valid')
      return true
    } catch (error) {
      console.error('❌ Error checking session validity:', error)
      return false
    }
  }
  
  /**
   * Handle invalid refresh token error
   */
  static async handleInvalidRefreshToken(): Promise<void> {
    console.log('🔧 Handling invalid refresh token...')
    
    try {
      // Clear all auth data
      await this.clearAllAuthData()
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('❌ Error handling invalid refresh token:', error)
    }
  }
  
  /**
   * Clean up on page load
   */
  static async cleanupOnLoad(): Promise<void> {
    try {
      const isValid = await this.isSessionValid()
      
      if (!isValid) {
        console.log('🧹 Invalid session detected, cleaning up...')
        await this.clearAllAuthData()
      }
    } catch (error) {
      console.error('❌ Error during cleanup on load:', error)
    }
  }
}

// Auto-cleanup on module load
if (typeof window !== 'undefined') {
  // Run cleanup after a short delay to allow other modules to load
  setTimeout(() => {
    AuthCleanup.cleanupOnLoad()
  }, 1000)
}
