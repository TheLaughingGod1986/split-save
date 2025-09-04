'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface JoinInvitationPageProps {
  params: {
    token: string
  }
}

export default function JoinInvitationPage({ params }: JoinInvitationPageProps) {
  const { token } = params
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [invitation, setInvitation] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/invite/validate-token/${token}`)
      
      if (response.data?.invitation) {
        setInvitation(response.data.invitation)
        setError(null)
      } else {
        setError('Invalid or expired invitation link')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setError('Invalid or expired invitation link')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    if (!user) {
      toast.error('Please sign in to accept the invitation')
      router.push('/auth/signin')
      return
    }

    try {
      setValidating(true)
      const response = await apiClient.post('/invite/accept-joint-link', {
        token: token
      })

      if (response.data?.success) {
        toast.success('Partnership invitation accepted successfully!')
        router.push('/partnerships')
      } else {
        toast.error('Failed to accept invitation')
      }
    } catch (error) {
      console.error('Accept invitation error:', error)
      toast.error('Failed to accept invitation')
    } finally {
      setValidating(false)
    }
  }

  const handleDeclineInvitation = async () => {
    try {
      setValidating(true)
      const response = await apiClient.post('/invite/decline-joint-link', {
        token: token
      })

      if (response.data?.success) {
        toast.success('Invitation declined')
        router.push('/')
      } else {
        toast.error('Failed to decline invitation')
      }
    } catch (error) {
      console.error('Decline invitation error:', error)
      toast.error('Failed to decline invitation')
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🤔</div>
          <p className="text-gray-600 dark:text-gray-400">No invitation found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🤝</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Partnership Invitation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            You've been invited to join a financial partnership
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-xl">👤</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {invitation.from_user?.name || 'SplitSave User'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {invitation.from_user?.email || invitation.from_user_id}
              </p>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">
              <strong>Invited to:</strong> {invitation.to_email}
            </p>
            <p className="mb-2">
              <strong>Expires:</strong> {new Date(invitation.expires_at).toLocaleDateString()}
            </p>
            <p>
              <strong>Status:</strong> <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
            </p>
          </div>
        </div>

        {!user ? (
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Please sign in to accept this invitation
            </p>
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Sign In to Accept
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-400">
              Accept this partnership invitation to start managing your finances together
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleAcceptInvitation}
                disabled={validating}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? 'Accepting...' : 'Accept'}
              </button>
              <button
                onClick={handleDeclineInvitation}
                disabled={validating}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validating ? 'Declining...' : 'Decline'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
