'use client'

import { AuthProvider } from './AuthProvider'

export function SmartAuthProvider({ children }: { children: React.ReactNode }) {
  // EXTREME FIX: Always use regular AuthProvider, no browser detection
  console.log('🌐 SmartAuthProvider: Using regular AuthProvider (Safari support completely removed)')
  return <AuthProvider>{children}</AuthProvider>
}

// Re-export useAuth from AuthProvider
export { useAuth } from './AuthProvider'