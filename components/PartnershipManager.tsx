'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { apiClient } from '@/lib/api-client'

interface Partnership {
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

interface PartnershipInvitation {
  id: string
  from_user_id: string
  to_user_id?: string
  to_email: string
  status: string
  created_at: string
  expires_at: string
}

interface PartnershipsResponse {
  partnerships: Partnership[]
  invitations: PartnershipInvitation[]
}

interface PartnershipManagerProps {
  onPartnershipsUpdate?: (partnerships: Partnership[]) => void
}

export default function PartnershipManager({ onPartnershipsUpdate }: PartnershipManagerProps) {
  const { user } = useAuth()
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [invitations, setInvitations] = useState<PartnershipInvitation[]>([])
  const [toEmail, setToEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadPartnershipData = useCallback(async () => {
    try {
      console.log('🔍 Loading partnership data...')
      const response = await apiClient.getPartnerships()
      console.log('📡 API Response:', response)
      console.log('🤝 Partnerships:', response.partnerships || [])
      console.log('📧 Invitations:', response.invitations || [])
      const partnershipsData = response.partnerships || []
      setPartnerships(partnershipsData)
      setInvitations(response.invitations || [])
      
      // Notify parent component of partnerships update
      if (onPartnershipsUpdate) {
        onPartnershipsUpdate(partnershipsData)
      }
    } catch (error) {
      console.error('❌ Failed to load partnerships:', error)
      setError('Failed to load partnerships')
    }
  }, [onPartnershipsUpdate])

  useEffect(() => {
    loadPartnershipData()
  }, [loadPartnershipData])

  const sendInvitation = async () => {
    if (!toEmail.trim()) {
      setError('Please enter an email address')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await apiClient.sendPartnershipInvitation(toEmail.trim())
      setSuccess(response.message || 'Invitation sent successfully!')
      setToEmail('')
      await loadPartnershipData() // Refresh the data
    } catch (error: any) {
      setError(error.message || 'Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const respondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      await apiClient.respondToInvitation(invitationId, action)
      setSuccess(`Invitation ${action}ed successfully!`)
      await loadPartnershipData() // Refresh the data
    } catch (error: any) {
      setError(error.message || `Failed to ${action} invitation`)
    }
  }

  const getPartnerName = (partnership: Partnership) => {
    try {
      const currentUserId = user?.id
      if (!currentUserId) return 'Unknown Partner'
      
      // Determine which user is the partner (not the current user)
      let partnerUser
      if (partnership.user1_id === currentUserId) {
        partnerUser = partnership.user2
      } else {
        partnerUser = partnership.user1
      }
      
      // Return partner's name if available, otherwise email, otherwise fallback
      if (partnerUser?.name && partnerUser.name !== 'User') {
        return partnerUser.name
      } else if (partnerUser?.email) {
        return partnerUser.email
      } else {
        // Fallback to truncated ID if no user details available
        const partnerId = partnership.user1_id === currentUserId ? partnership.user2_id : partnership.user1_id
        return `Partner (${partnerId.slice(0, 8)}...)`
      }
    } catch (error) {
      return 'Unknown Partner'
    }
  }

  const handleRemovePartnership = async (partnershipId: string) => {
    if (!confirm('Are you sure you want to remove this partnership? This action cannot be undone.')) {
      return
    }
    
    try {
      setLoading(true)
      // Call API to remove partnership
      await apiClient.removePartnership(partnershipId)
      setSuccess('Partnership removed successfully!')
      await loadPartnershipData() // Refresh the data
      
              // Notify parent component of partnerships update
        if (onPartnershipsUpdate) {
          const updatedPartnerships = partnerships.filter(p => p.id !== partnershipId)
          onPartnershipsUpdate(updatedPartnerships)
        }
        
        // Force a page refresh to update auth middleware
        window.location.reload()
    } catch (error: any) {
      setError(error.message || 'Failed to remove partnership')
    } finally {
      setLoading(false)
    }
  }

  const getInvitationType = (invitation: PartnershipInvitation) => {
    if (invitation.to_user_id) {
      return 'existing-user'
    }
    return 'new-user'
  }

  const getInvitationLink = (invitation: PartnershipInvitation) => {
    if (invitation.to_user_id) {
      return null // Existing user, no special link needed
    }
    // For non-users, create a link to accept the invitation
    return `${window.location.origin}/api/invite/accept/${invitation.id}`
  }

  const copyInvitationLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      setSuccess('Invitation link copied to clipboard!')
    } catch (error) {
      setError('Failed to copy link')
    }
  }

  const isInvitationExpired = (invitation: PartnershipInvitation) => {
    if (!invitation.expires_at) return false
    return new Date(invitation.expires_at) < new Date()
  }

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Add loading state to prevent flashing
  if (loading && partnerships.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Partnerships</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading partnerships...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Partnerships</h2>
        {/* Removed unnecessary refresh buttons - app is working properly now */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Removed unnecessary partnership status info message */}

      {/* Send Partnership Invitation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Partnership Invitation</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Partner's Email
            </label>
            <input
              type="email"
              id="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="Enter partner's email address"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={sendInvitation}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
            <button
              onClick={() => setToEmail('')}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Active Partnerships */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Partnerships</h3>
        {partnerships.length === 0 ? (
          <p className="text-gray-500">No active partnerships yet.</p>
        ) : (
          <div className="space-y-3">
            {partnerships.map((partnership) => (
              <div key={partnership.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 font-medium">
                      Partner: {getPartnerName(partnership)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Created: {new Date(partnership.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePartnership(partnership.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                  title="Remove partnership"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Invitations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sent Invitations</h3>
        {invitations.filter(inv => inv.from_user_id === user?.id && inv.status === 'pending').length === 0 ? (
          <p className="text-gray-500">No pending invitations sent.</p>
        ) : (
          <div className="space-y-3">
            {invitations
              .filter(inv => inv.from_user_id === user?.id && inv.status === 'pending')
              .map((invitation) => (
                <div key={invitation.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">
                      To: {invitation.to_email}
                      {invitation.to_user_id && <span className="text-sm text-gray-500"> (existing user)</span>}
                      {!invitation.to_user_id && <span className="text-sm text-blue-600"> (new user)</span>}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {invitation.status}
                    </span>
                  </div>
                  
                  {invitation.status === 'pending' && !invitation.to_user_id && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Send this link to your partner to create their account and accept the invitation:
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={getInvitationLink(invitation) || ''}
                          readOnly
                          className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 bg-gray-100"
                        />
                        <button
                          onClick={() => getInvitationLink(invitation) && copyInvitationLink(getInvitationLink(invitation)!)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {formatExpiryDate(invitation.expires_at)}
                      </p>
                    </div>
                  )}
                  
                  {isInvitationExpired(invitation) && (
                    <p className="text-sm text-red-600 mt-1">This invitation has expired</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Received Invitations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Received Invitations</h3>
        {invitations.filter(inv => 
          (inv.to_user_id === user?.id || inv.to_email === user?.email) && 
          inv.status === 'pending'
        ).length === 0 ? (
          <p className="text-gray-500">No pending invitations received.</p>
        ) : (
          <div className="space-y-3">
            {invitations
              .filter(inv => 
                (inv.to_user_id === user?.id || inv.to_email === user?.email) && 
                inv.status === 'pending'
              )
              .map((invitation) => (
                <div key={invitation.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">
                      From: {invitation.from_user_id}
                    </span>
                    <span className="text-sm text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
                      Pending
                    </span>
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
        )}
      </div>
    </div>
  )
}
