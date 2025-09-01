'use client'

import { useAuth } from '@/components/AuthProvider'
import { LoginForm } from '@/components/LoginForm'
import { SplitsaveApp } from '@/components/SplitsaveApp'
import { ClientOnly } from '@/components/ClientOnly'

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <ClientOnly>
      <SplitsaveApp />
    </ClientOnly>
  )
}
