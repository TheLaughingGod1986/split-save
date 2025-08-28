'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'

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
      toast.success('Partnership invitation sent successfully!')
      setToEmail('')
      await loadPartnershipData() // Refresh the data
    } catch (error: any) {
      setError(error.message || 'Failed to send invitation')
      toast.error('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const respondToInvitation = async (invitationId: string, action: 'accept' | 'decline') => {
    try {
      await apiClient.respondToInvitation(invitationId, action)
      setSuccess(`Invitation ${action}ed successfully!`)
      toast.success(`Invitation ${action}ed successfully!`)
      await loadPartnershipData() // Refresh the data
    } catch (error: any) {
      setError(error.message || `Failed to ${action} invitation`)
      toast.error(`Failed to ${action} invitation`)
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
        // Fallback to email if available, otherwise truncated ID
        const partnerId = partnership.user1_id === currentUserId ? partnership.user2_id : partnership.user1_id
        // Try to find the partner's email from invitations or partnerships
        const partnerInvitation = invitations.find(inv => 
          inv.to_user_id === partnerId || 
          (inv.from_user_id === partnerId && inv.status === 'accepted')
        )
        if (partnerInvitation?.to_email) {
          return partnerInvitation.to_email
        }
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
      toast.success('Partnership removed successfully!')
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
      toast.error('Failed to remove partnership')
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
      toast.success('Invitation link copied to clipboard!')
    } catch (error) {
      setError('Failed to copy link')
      toast.error('Failed to copy link')
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Partnerships</h2>
        </div>
        <div className="form-section">
          <div className="text-center py-8">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading partnerships...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Partnerships</h2>
        {/* Removed unnecessary refresh buttons - app is working properly now */}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      {/* Removed unnecessary partnership status info message */}

      {/* Send Partnership Invitation */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Send Partnership Invitation</h3>
          <p className="form-section-subtitle">Invite someone to become your financial partner</p>
        </div>
        
        <div className="space-y-4">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Partner's Email
            </label>
            <input
              type="email"
              id="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="Enter partner's email address"
              className="form-input"
            />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={sendInvitation}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
            <button
              onClick={() => setToEmail('')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Active Partnerships */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Active Partnerships</h3>
          <p className="form-section-subtitle">Your current financial partnerships</p>
        </div>
        
        {partnerships.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🤝</div>
            <p className="text-gray-500 dark:text-gray-400">No active partnerships yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Send an invitation to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partnerships.map((partnership) => (
              <div key={partnership.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Partner: {getPartnerName(partnership)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(partnership.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemovePartnership(partnership.id)}
                  className="btn btn-danger px-3 py-1 text-sm"
                  title="Remove partnership"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Debug Section - Always Show */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Debug Info</h3>
          <p className="form-section-subtitle">Current state for troubleshooting</p>
        </div>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">Debug Information:</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">User ID: {user?.id || 'undefined'}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">User Email: {user?.email || 'undefined'}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Total Invitations: {invitations.length}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Total Partnerships: {partnerships.length}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Loading State: {loading ? 'true' : 'false'}</p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">Error State: {error || 'none'}</p>
        </div>
      </div>

      {/* Sent Invitations */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Sent Invitations</h3>
          <p className="form-section-subtitle">Invitations you've sent to potential partners</p>
          <button
            onClick={loadPartnershipData}
            disabled={loading}
            className="btn btn-secondary text-sm px-3 py-1"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        
        {(() => {
          try {
            // Only show pending invitations that you sent
            const sentInvitations = invitations.filter(inv => 
              inv.from_user_id === user?.id && 
              inv.status === 'pending'
            )
            console.log('🔍 DEBUG - Sent Invitations Filter:', {
              totalInvitations: invitations.length,
              userID: user?.id,
              userEmail: user?.email,
              allInvitations: invitations,
              sentInvitations: sentInvitations,
              filterResults: invitations.map(inv => ({
                id: inv.id,
                from_user_id: inv.from_user_id,
                to_user_id: inv.to_user_id,
                to_email: inv.to_email,
                status: inv.status,
                user_id: user?.id,
                matchesFromUser: inv.from_user_id === user?.id,
                isPending: inv.status === 'pending',
                shouldShow: inv.from_user_id === user?.id && inv.status === 'pending'
              }))
            })
            return sentInvitations.length === 0
          } catch (error) {
            console.error('Error in sent invitations filter:', error)
            return true // Show "no invitations" message if there's an error
          }
        })() ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📤</div>
            <p className="text-gray-500 dark:text-gray-400">No pending invitations sent.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Send an invitation to start a partnership!</p>
            
            {/* Debug Info */}
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-left">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Debug Info:</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Total Invitations: {invitations.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Frontend User ID: {user?.id}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">User Email: {user?.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Sent Invitations: {JSON.stringify(invitations.filter(inv => inv.from_user_id === user?.id && inv.status === 'pending'), null, 2)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">All Invitations: {JSON.stringify(invitations, null, 2)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Filter Results: {JSON.stringify(invitations.map(inv => ({
                id: inv.id,
                from_user_id: inv.from_user_id,
                to_user_id: inv.to_user_id,
                to_email: inv.to_email,
                status: inv.status,
                user_id: user?.id,
                matchesFromUser: inv.from_user_id === user?.id,
                isPending: inv.status === 'pending',
                shouldShow: inv.from_user_id === user?.id && inv.status === 'pending'
              })), null, 2)}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {(() => {
              try {
                // Only show pending invitations that you sent
                const sentInvitations = invitations.filter(inv => 
                  inv.from_user_id === user?.id && 
                  inv.status === 'pending'
                )
                console.log('🔍 DEBUG - Rendering Sent Invitations:', sentInvitations)
                return sentInvitations
              } catch (error) {
                console.error('Error in sent invitations rendering:', error)
                return []
              }
            })().map((invitation) => (
                <div key={invitation.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        To: {invitation.to_email}
                      </span>
                      {invitation.to_user_id && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">(existing user)</span>
                      )}
                      {!invitation.to_user_id && (
                        <span className="text-sm text-blue-600 dark:text-blue-400 ml-2">(new user)</span>
                      )}
                    </div>
                    <span className={`text-sm px-3 py-1 rounded-full font-medium ${
                      invitation.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                      invitation.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                      'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    }`}>
                      {invitation.status}
                    </span>
                  </div>
                  
                  {invitation.status === 'pending' && !invitation.to_user_id && (
                    <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Send this link to your partner to create their account and accept the invitation:
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={getInvitationLink(invitation) || ''}
                          readOnly
                          className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                        />
                        <button
                          onClick={() => getInvitationLink(invitation) && copyInvitationLink(getInvitationLink(invitation)!)}
                          className="btn btn-primary px-3 py-2 text-sm"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Expires: {formatExpiryDate(invitation.expires_at)}
                      </p>
                    </div>
                  )}
                  
                  {isInvitationExpired(invitation) && (
                    <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">This invitation has expired</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* All Invitations Status */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">All Invitations Status</h3>
          <p className="form-section-subtitle">Overview of all invitations you've sent and received</p>
        </div>
        
        {invitations.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No invitations found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invitations.map((invitation) => {
              const isFromYou = invitation.from_user_id === user?.id
              const isToYou = invitation.to_user_id === user?.id || invitation.to_email === user?.email
              const isPending = invitation.status === 'pending'
              const isAccepted = invitation.status === 'accepted'
              const isDeclined = invitation.status === 'declined'
              const isExpired = invitation.status === 'expired'
              
              return (
                <div key={invitation.id} className={`p-3 rounded-lg border text-sm ${
                  isPending ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                  isAccepted ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                  isDeclined ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                  'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {isFromYou ? `To: ${invitation.to_email}` : `From: ${invitation.from_user_id === user?.id ? 'You' : 'Unknown'}`}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        isPending ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                        isAccepted ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        isDeclined ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                        'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
                      }`}>
                        {invitation.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {isPending && isToYou && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => respondToInvitation(invitation.id, 'accept')}
                        className="btn btn-primary text-xs px-3 py-1"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respondToInvitation(invitation.id, 'decline')}
                        className="btn btn-secondary text-xs px-3 py-1"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Received Invitations */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Received Invitations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Only pending invitations you can respond to</p>
        </div>
        
        {invitations.filter(inv => 
          (inv.to_user_id === user?.id || inv.to_email === user?.email) && 
          inv.status === 'pending'
        ).length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📥</div>
            <p className="text-gray-500 dark:text-gray-400">No pending invitations received.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">You'll see partnership requests here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations
              .filter(inv => 
                (inv.to_user_id === user?.id || inv.to_email === user?.email) && 
                inv.status === 'pending'
              )
              .map((invitation) => (
                <div key={invitation.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      From: {invitation.from_user_id}
                    </span>
                    <span className="text-sm text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full font-medium">
                      Pending
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'accept')}
                      className="btn btn-success px-3 py-2 text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToInvitation(invitation.id, 'decline')}
                      className="btn btn-danger px-3 py-2 text-sm"
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
