'use client'
import { useState, useEffect } from 'react'
import { apiClient, type PartnershipsResponse, type Partnership, type PartnershipInvitation } from '@/lib/api-client'
import { useAuth } from './AuthProvider'

export function PartnershipManager() {
  const { user } = useAuth()
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [sentInvitations, setSentInvitations] = useState<PartnershipInvitation[]>([])
  const [receivedInvitations, setReceivedInvitations] = useState<PartnershipInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Invitation form state
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)

  useEffect(() => {
    loadPartnerships()
  }, [])

  const loadPartnerships = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getPartnerships()
      setPartnerships(data.partnerships)
      setSentInvitations(data.sentInvitations)
      setReceivedInvitations(data.receivedInvitations)
    } catch (err) {
      setError('Failed to load partnerships')
      console.error('Load partnerships error:', err)
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      setSendingInvite(true)
      setError('')
      await apiClient.sendPartnershipInvitation(inviteEmail.trim(), inviteMessage.trim() || undefined)
      
      setSuccess('Partnership invitation sent successfully!')
      setInviteEmail('')
      setInviteMessage('')
      setShowInviteForm(false)
      
      // Refresh partnerships
      await loadPartnerships()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setSendingInvite(false)
    }
  }

  const respondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      setError('')
      await apiClient.respondToInvitation(invitationId, action)
      
      setSuccess(`Invitation ${action}ed successfully!`)
      
      // Refresh partnerships
      await loadPartnerships()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || `Failed to ${action} invitation`)
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    try {
      setError('')
      await apiClient.cancelInvitation(invitationId)
      
      setSuccess('Invitation cancelled successfully!')
      
      // Refresh partnerships
      await loadPartnerships()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to cancel invitation')
    }
  }

  const getPartnerName = (partnership: Partnership, currentUserId: string) => {
    if (partnership.user1?.id === currentUserId) {
      return partnership.user2?.name || partnership.user2?.email || 'Unknown'
    } else {
      return partnership.user1?.name || partnership.user1?.email || 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Partnerships</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading partnerships...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Partnerships</h2>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
        >
          {showInviteForm ? 'Cancel' : 'Invite Partner'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
          <button onClick={() => setError('')} className="ml-2 text-red-500 hover:text-red-700">×</button>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Send Partnership Invitation</h3>
          <form onSubmit={sendInvitation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Partner's Email</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="partner@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Hi! I'd like to connect with you on SplitSave to manage our shared finances together."
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={sendingInvite}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {sendingInvite ? 'Sending...' : 'Send Invitation'}
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Partnerships */}
      {partnerships.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Partnerships</h3>
          <div className="space-y-3">
            {partnerships.map((partnership) => (
              <div key={partnership.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">
                    Partner: {getPartnerName(partnership, user?.id || '')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="capitalize">{partnership.status}</span>
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  Connected since {new Date(partnership.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Received Invitations */}
      {receivedInvitations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Received Invitations</h3>
          <div className="space-y-3">
            {receivedInvitations.map((invitation) => (
              <div key={invitation.id} className="p-4 border border-gray-200 rounded-md">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      From: {invitation.from_user?.name || invitation.from_user?.email || 'Unknown'}
                    </p>
                    {invitation.message && (
                      <p className="text-sm text-gray-600 mt-1">{invitation.message}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => respondToInvitation(invitation.id, 'accept')}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToInvitation(invitation.id, 'decline')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sent Invitations */}
      {sentInvitations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sent Invitations</h3>
          <div className="space-y-3">
            {sentInvitations.map((invitation) => (
              <div key={invitation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">
                    To: {invitation.to_user?.name || invitation.to_user?.email || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: <span className="capitalize">{invitation.status}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </span>
                  {invitation.status === 'pending' && (
                    <button
                      onClick={() => cancelInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Partnerships State */}
      {partnerships.length === 0 && sentInvitations.length === 0 && receivedInvitations.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg border border-blue-200 text-center">
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-medium text-blue-900 mb-2">No Partnerships Yet</h3>
          <p className="text-blue-700 mb-4">
            Connect with your partner to start managing shared finances together.
          </p>
          <button
            onClick={() => setShowInviteForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Invite Your Partner
          </button>
        </div>
      )}
    </div>
  )
}
