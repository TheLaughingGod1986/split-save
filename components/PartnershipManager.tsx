'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { apiClient } from '@/lib/api-client'

interface Partnership {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
  partnerUser?: {
    id: string
    email: string
    name?: string
  }
}

interface PartnershipInvitation {
  id: string
  from_user_id: string
  to_user_id?: string
  to_email: string
  status: string
  created_at: string
  expires_at?: string
}

export default function PartnershipManager({ 
  onPartnershipsUpdate 
}: { 
  onPartnershipsUpdate: (partnerships: Partnership[]) => void 
}) {
  const { user } = useAuth()
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [invitations, setInvitations] = useState<PartnershipInvitation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Track if we've already loaded data to prevent multiple loads
  const [hasLoaded, setHasLoaded] = useState(false)

  // Load data only once when component mounts
  useEffect(() => {
    if (!hasLoaded && user) {
      console.log('🚀 PartnershipManager: Initial load')
      setHasLoaded(true)
      loadData()
    }
  }, [user, hasLoaded])

  const loadData = async () => {
    if (loading || !user) return
    
    // Prevent multiple simultaneous calls
    const now = Date.now()
    if (now - (window as any).lastLoadTime < 1000) {
      console.log('🚫 PartnershipManager: Load blocked - too soon')
      return
    }
    ;(window as any).lastLoadTime = now
    
    console.log('📡 PartnershipManager: Loading data...')
    setLoading(true)
    setError(null)
    
    try {
      // Load partnerships and invitations
      const partnershipsResponse = await apiClient.getPartnerships()
      setPartnerships(partnershipsResponse.partnerships)
      setInvitations(partnershipsResponse.invitations)
      
      // Only update parent if partnerships actually changed
      if (JSON.stringify(partnerships) !== JSON.stringify(partnershipsResponse.partnerships)) {
        onPartnershipsUpdate(partnershipsResponse.partnerships)
      }
      
      console.log('✅ PartnershipManager: Data loaded successfully')
    } catch (err) {
      console.error('❌ PartnershipManager: Error loading data:', err)
      setError('Failed to load partnership data')
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async () => {
    if (!email.trim() || !user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      await apiClient.sendPartnershipInvitation(email.trim())
      setSuccess('Invitation sent successfully!')
      setEmail('')
      
      // Reload data after sending invitation
      setTimeout(() => {
        loadData()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation')
    } finally {
      setIsLoading(false)
    }
  }

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    if (!user) return
    
    setLoading(true)
    setError(null)
    
    try {
      if (accept) {
        await apiClient.respondToInvitation(invitationId, 'accept')
        setSuccess('Invitation accepted! Partnership created.')
      } else {
        await apiClient.respondToInvitation(invitationId, 'decline')
        setSuccess('Invitation declined.')
      }
      
      // Reload data after responding
      setTimeout(() => {
        loadData()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to respond to invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleRemovePartnership = async (partnershipId: string) => {
    if (!user) return
    
    if (!confirm('Are you sure you want to remove this partnership? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await apiClient.removePartnership(partnershipId)
      setSuccess('Partnership removed successfully!')
      
      // Reload data after removing partnership
      setTimeout(() => {
        loadData()
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to remove partnership')
    } finally {
      setLoading(false)
    }
  }

  const getPartnerName = (partnership: Partnership) => {
    if (partnership.partnerUser?.name) {
      return partnership.partnerUser.name
    }
    if (partnership.partnerUser?.email) {
      return partnership.partnerUser.email
    }
    return 'Unknown Partner'
  }

  if (!user) {
    return <div className="text-center py-8">Please sign in to manage partnerships.</div>
  }

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Debug Info</h4>
        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
          <div>User ID: {user.id}</div>
          <div>Partnerships: {partnerships.length}</div>
          <div>Invitations: {invitations.length}</div>
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Has Loaded: {hasLoaded ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* Send Partnership Invitation */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Send Partnership Invitation</h3>
          <p className="form-section-subtitle">Invite someone to become your financial partner</p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="form-label">Partner's Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter partner's email address"
              className="form-input"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={sendInvitation}
              disabled={!email.trim() || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
            <button
              onClick={() => setEmail('')}
              disabled={isLoading}
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
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No active partnerships yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {partnerships.map((partnership) => (
              <div key={partnership.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Partner: {getPartnerName(partnership)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    Created: {new Date(partnership.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleRemovePartnership(partnership.id)}
                  className="btn btn-danger text-sm px-3 py-1"
                  disabled={loading}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Invitations You've Sent */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">All Invitations You've Sent</h3>
          <p className="form-section-subtitle">Complete history of invitations you've sent</p>
        </div>
        
        {invitations.filter(inv => inv.from_user_id === user.id).length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No invitations sent yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invitations
              .filter(inv => inv.from_user_id === user.id)
              .map((invitation) => (
                <div key={invitation.id} className={`p-3 rounded-lg border text-sm ${
                  invitation.status === 'pending' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                  invitation.status === 'accepted' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
                  invitation.status === 'declined' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                  'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        To: {invitation.to_email}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        invitation.status === 'pending' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                        invitation.status === 'accepted' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                        invitation.status === 'declined' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                        'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
                      }`}>
                        {invitation.status}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {invitation.status === 'accepted' && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✅ This invitation was accepted and is now an active partnership
                    </p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Received Invitations */}
      <div className="form-section">
        <div className="form-section-header">
          <h3 className="form-section-title">Received Invitations</h3>
          <p className="form-section-subtitle">Partnership requests sent to you</p>
        </div>
        
        {invitations.filter(inv => inv.to_user_id === user.id && inv.status === 'pending').length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No pending invitations received. You'll see partnership requests here!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations
              .filter(inv => inv.to_user_id === user.id && inv.status === 'pending')
              .map((invitation) => (
                <div key={invitation.id} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      From: {invitation.to_email}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(invitation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => respondToInvitation(invitation.id, true)}
                      className="btn btn-success text-sm px-3 py-1"
                      disabled={loading}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respondToInvitation(invitation.id, false)}
                      className="btn btn-danger text-sm px-3 py-1"
                      disabled={loading}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
        </div>
      )}
    </div>
  )
}
