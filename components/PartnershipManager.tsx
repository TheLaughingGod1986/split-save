'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'

interface Partnership {
  id: string
  user1_id: string
  user2_id: string
  status: string
  created_at: string
  user1?: { name: string; email: string }
  user2?: { name: string; email: string }
}

interface Invitation {
  id: string
  from_user_id: string
  to_user_id?: string
  to_email: string
  status: string
  created_at: string
  expires_at: string
  from_user?: { name: string; email: string }
}

export function PartnershipManager() {
  const { user } = useAuth()
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)

  // Fetch partnerships and invitations
  const fetchData = async () => {
    try {
      const response = await apiClient.get('/invite')
      setPartnerships(response.data?.partnerships || [])
      setInvitations(response.data?.invitations || [])
    } catch (error) {
      console.error('Error fetching partnership data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Send invitation
  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setSendingInvite(true)
    try {
      const response = await apiClient.post('/invite', { toEmail: inviteEmail.trim() })
      toast.success(response.data?.message || 'Invitation sent successfully!')
      setInviteEmail('')
      setShowInviteForm(false)
      fetchData() // Refresh data
    } catch (error) {
      console.error('Send invitation error:', error)
      toast.error('Failed to send invitation')
    } finally {
      setSendingInvite(false)
    }
  }

  // Accept invitation
  const acceptInvitation = async (invitationId: string) => {
    try {
      const result = await apiClient.post('/invite/respond', { 
        invitationId, 
        action: 'accept' 
      })
      toast.success('Invitation accepted! Partnership established.')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Accept invitation error:', error)
      toast.error('Failed to accept invitation')
    }
  }

  // Decline invitation
  const declineInvitation = async (invitationId: string) => {
    try {
      const result = await apiClient.post('/invite/respond', { 
        invitationId, 
        action: 'decline' 
      })
      toast.success('Invitation declined.')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Decline invitation error:', error)
      toast.error('Failed to decline invitation')
    }
  }

  // Withdraw invitation (for sent invitations)
  const withdrawInvitation = async (invitationId: string) => {
    if (!confirm('Are you sure you want to withdraw this invitation?')) {
      return
    }

    try {
      await apiClient.delete(`/invite?id=${invitationId}`)
      toast.success('Invitation withdrawn successfully')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Withdraw invitation error:', error)
      toast.error('Failed to withdraw invitation')
    }
  }

  // Resend invitation
  const resendInvitation = async (invitationId: string, toEmail: string) => {
    try {
      const response = await apiClient.post('/invite/resend', { 
        invitationId,
        toEmail 
      })
      toast.success('Invitation resent successfully!')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Resend invitation error:', error)
      toast.error('Failed to resend invitation')
    }
  }

  // Generate joint link
  const generateJointLink = async (invitationId: string) => {
    try {
      const response = await apiClient.post('/invite/joint-link', { 
        invitationId 
      })
      const jointLink = response.data?.jointLink
      
      if (jointLink) {
        // Copy to clipboard
        await navigator.clipboard.writeText(jointLink)
        toast.success('Joint link copied to clipboard!')
      } else {
        toast.error('Failed to generate joint link')
      }
    } catch (error) {
      console.error('Generate joint link error:', error)
      toast.error('Failed to generate joint link')
    }
  }

  // Remove partnership
  const removePartnership = async (partnershipId: string) => {
    if (!confirm('Are you sure you want to remove this partnership? This action cannot be undone.')) {
      return
    }

    try {
      await apiClient.delete(`/partnerships?id=${partnershipId}`)
      toast.success('Partnership removed successfully')
      fetchData() // Refresh data
    } catch (error) {
      console.error('Remove partnership error:', error)
      toast.error('Failed to remove partnership')
    }
  }

  // Get partner name for current user
  const getPartnerName = (partnership: Partnership) => {
    if (partnership.user1_id === user?.id) {
      return partnership.user2?.name || partnership.user2?.email || 'Unknown Partner'
    } else {
      return partnership.user1?.name || partnership.user1?.email || 'Unknown Partner'
    }
  }

  // Get partner email for current user
  const getPartnerEmail = (partnership: Partnership) => {
    if (partnership.user1_id === user?.id) {
      return partnership.user2?.email || 'Unknown'
    } else {
      return partnership.user1?.email || 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Partnerships */}
      {partnerships.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Current Partnership{partnerships.length > 1 ? 's' : ''}
          </h3>
          <div className="space-y-4">
            {partnerships.map((partnership) => (
              <div key={partnership.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Partner: {getPartnerName(partnership)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {getPartnerEmail(partnership)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Connected since {new Date(partnership.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => removePartnership(partnership.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Invitations */}
      {invitations.filter(inv => inv.status === 'pending').length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Pending Invitations
          </h3>
          <div className="space-y-4">
            {invitations
              .filter(inv => inv.status === 'pending')
              .map((invitation) => (
                <div key={invitation.id} className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invitation.from_user_id === user?.id ? 'Sent to:' : 'From:'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {invitation.from_user_id === user?.id 
                          ? invitation.to_email 
                          : invitation.from_user?.name || invitation.from_user?.email || 'Unknown User'
                        }
                      </p>
                    </div>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  
                  {invitation.from_user_id !== user?.id ? (
                    // Received invitation - show Accept/Decline
                    <div className="flex space-x-2">
                      <button
                        onClick={() => acceptInvitation(invitation.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineInvitation(invitation.id)}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    // Sent invitation - show management options
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => resendInvitation(invitation.id, invitation.to_email)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Resend
                      </button>
                      <button
                        onClick={() => generateJointLink(invitation.id)}
                        className="px-3 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors"
                      >
                        Joint Link
                      </button>
                      <button
                        onClick={() => withdrawInvitation(invitation.id)}
                        className="px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                      >
                        Withdraw
                      </button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Send Invitation */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Invite a Partner
          </h3>
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            {showInviteForm ? 'Cancel' : 'Send Invitation'}
          </button>
        </div>
        
        {showInviteForm && (
          <form onSubmit={sendInvitation} className="space-y-4">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Partner&apos;s Email Address
              </label>
              <input
                type="email"
                id="inviteEmail"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={sendingInvite || !inviteEmail.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendingInvite ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>
        )}
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
          Invite your partner to join SplitSave and start managing your finances together.
        </p>
      </div>

      {/* No Partnerships Message */}
      {partnerships.length === 0 && invitations.filter(inv => inv.status === 'pending').length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-4xl mb-3">🤝</div>
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
            No Partnerships Yet
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Send an invitation to your partner to get started with shared expenses and savings goals.
          </p>
          <button
            onClick={() => setShowInviteForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Invite Partner
          </button>
        </div>
      )}
    </div>
  )
}
