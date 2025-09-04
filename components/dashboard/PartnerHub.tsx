'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { PartnershipManager } from '../forms/PartnershipManager'
import { PartnerActivityFeed } from './PartnerActivityFeed'
import { DashboardContributionSummary } from './DashboardContributionSummary'
import { TransparencyDashboard } from './TransparencyDashboard'

interface PartnerHubProps {
  partnerships: any[]
  approvals: any[]
  profile: any
  partnerProfile: any
  user: any
  goals: any[]
  currencySymbol: string
  onApprove: (approvalId: string) => void
  onDecline: (approvalId: string) => void
  onUpdate: () => void
  initialTab?: 'overview' | 'approvals' | 'activity' | 'collaboration' | 'transparency'
}

interface Approval {
  id: string
  type: 'expense' | 'goal'
  title: string
  amount: number
  description: string
  requester_name: string
  requester_id: string
  created_at: string
  status: 'pending' | 'approved' | 'declined'
  category?: string
  target_date?: string
  request_data?: any
}

export function PartnerHub({
  partnerships,
  approvals,
  profile,
  partnerProfile,
  user,
  goals,
  currencySymbol,
  onApprove,
  onDecline,
  onUpdate,
  initialTab = 'overview'
}: PartnerHubProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'activity' | 'collaboration' | 'transparency'>(initialTab)
  const [sharedNotes, setSharedNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)

  const activePartnership = partnerships.find(p => p.status === 'active')
  const pendingApprovals = approvals?.filter(approval => approval.status === 'pending') || []
  const hasPartner = activePartnership && partnerProfile

  // Calculate approval counts
  const actionRequiredCount = pendingApprovals.filter(approval => approval.requester_id !== user.id).length
  const pendingMyRequestsCount = pendingApprovals.filter(approval => approval.requester_id === user.id).length

  useEffect(() => {
    if (hasPartner) {
      loadSharedNotes()
    }
  }, [hasPartner])

  const loadSharedNotes = async () => {
    try {
      console.log('📝 Loading shared notes...')
      const response = await apiClient.get('/shared-notes')
      const notes = response.data || []
      console.log('✅ Loaded shared notes:', notes.length)
      setSharedNotes(notes)
    } catch (error) {
      console.error('❌ Failed to load shared notes:', error)
      // Keep empty array if loading fails
      setSharedNotes([])
    }
  }

  const handleRemovePartnership = async (partnershipId: string) => {
    if (!confirm('Are you sure you want to remove this partnership? This action cannot be undone and will affect all shared goals and expenses.')) {
      return
    }

    try {
      await apiClient.delete(`/partnerships?id=${partnershipId}`)
      toast.success('Partnership removed successfully')
      onUpdate() // Refresh data
    } catch (error) {
      console.error('Remove partnership error:', error)
      toast.error('Failed to remove partnership')
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    try {
      console.log('📝 Adding shared note...')
      const response = await apiClient.post('/shared-notes', {
        content: newNote.trim()
      })
      
      const newNoteData = response.data
      console.log('✅ Note added successfully:', newNoteData.id)
      
      // Add to local state for immediate UI update
      setSharedNotes(prev => [newNoteData, ...prev])
      setNewNote('')
      setShowAddNote(false)
      toast.success('Note added successfully!')
    } catch (error) {
      console.error('❌ Failed to add note:', error)
      toast.error('Failed to add note')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getApprovalIcon = (type: string) => {
    switch (type) {
      case 'expense': return '💰'
      case 'goal': return '🎯'
      default: return '📝'
    }
  }

  const getApprovalTypeLabel = (type: string) => {
    switch (type) {
      case 'expense': return 'Expense Request'
      case 'goal': return 'Savings Goal'
      default: return 'Request'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', shortLabel: 'Overview', icon: '👥' },
    { id: 'approvals', label: 'Approvals', shortLabel: 'Approvals', icon: '⏳', count: actionRequiredCount },
    { id: 'activity', label: 'Activity', shortLabel: 'Activity', icon: '📱' },
    { id: 'transparency', label: 'Transparency', shortLabel: 'Transparency', icon: '🔍' },
    { id: 'collaboration', label: 'Collaboration', shortLabel: 'Collaboration', icon: '💬' }
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {hasPartner ? (
        <>
          {/* Partnership Status */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    Connected with {partnerProfile.name}
                  </h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Partnership active since {formatDate(activePartnership.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                  <p className="text-xs text-green-700 dark:text-green-300">Online</p>
                </div>
                <button
                  onClick={() => handleRemovePartnership(activePartnership.id)}
                  className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="Remove Partnership"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Partner Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your Income</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}{profile?.income?.toFixed(0) || '0'}
                  </p>
                </div>
                <div className="text-2xl">💼</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Partner&apos;s Income</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}{partnerProfile?.income?.toFixed(0) || '0'}
                  </p>
                </div>
                <div className="text-2xl">💼</div>
              </div>
            </div>
          </div>

          {/* Contribution Breakdown */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
              <span className="mr-2">💰</span>
              Who Pays What
            </h4>
            <DashboardContributionSummary
              partnerships={partnerships}
              profile={profile}
              partnerProfile={partnerProfile}
              user={user}
              currencySymbol={currencySymbol}
              expenses={[]}
              goals={goals}
            />
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="font-semibold mb-4 text-gray-900 dark:text-white">Partnership Summary</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{goals?.length || 0}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Shared Goals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">⏳</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{actionRequiredCount}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Action Required</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">💬</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{sharedNotes.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Shared Notes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">📊</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  {Math.round(((profile?.income || 0) / ((profile?.income || 0) + (partnerProfile?.income || 0))) * 100)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Your Contribution</div>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          {actionRequiredCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Action Required ({actionRequiredCount} approval{actionRequiredCount !== 1 ? 's' : ''})
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Your partner is waiting for your decision on these requests
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Review Now
                </button>
              </div>
            </div>
          )}

          {/* Your Pending Requests */}
          {pendingMyRequestsCount > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Your Requests ({pendingMyRequestsCount} pending)
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Waiting for your partner to review your requests
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  View Status
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* No Partner Connected */
        <PartnershipManager />
      )}
    </div>
  )

  const renderApprovals = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Approvals</h3>
        <div className="flex items-center space-x-2">
          {actionRequiredCount > 0 && (
            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded-full">
              {actionRequiredCount} action required
            </span>
          )}
          {pendingMyRequestsCount > 0 && (
            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm px-2 py-1 rounded-full">
              {pendingMyRequestsCount} your requests
            </span>
          )}
        </div>
      </div>

      {pendingApprovals.length > 0 ? (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => {
            const isRequester = approval.requester_id === user.id
            const needsMyApproval = !isRequester
            const approvalStatus = needsMyApproval ? 'Awaiting your approval' : 'Awaiting partner approval'
            
            // Ensure we have valid data with fallbacks
            const title = approval.title || 'Untitled Request'
            const amount = approval.amount || 0
            const description = approval.description || 'No description provided'
            const requesterName = approval.requester_name || 'Unknown User'
            const category = approval.category || null
            const targetDate = approval.target_date || null
            
            return (
              <div key={approval.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                {/* Header with approval status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getApprovalIcon(approval.type)}</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {isRequester ? 'You requested' : `${requesterName} requested`}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(approval.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {currencySymbol}{amount.toFixed(2)}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      needsMyApproval 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' 
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {needsMyApproval ? 'Action Required' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Approval Status Banner */}
                <div className={`mb-4 p-3 rounded-lg ${
                  needsMyApproval 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' 
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg ${needsMyApproval ? 'text-blue-600 dark:text-blue-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {needsMyApproval ? '⏳' : '👀'}
                    </span>
                    <div>
                      <p className={`text-sm font-medium ${needsMyApproval ? 'text-blue-800 dark:text-blue-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
                        {approvalStatus}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {needsMyApproval 
                          ? 'Your partner is waiting for your decision' 
                          : 'Your partner will review this request'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div className="mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                                         <div>
                       <span className="text-gray-500 dark:text-gray-400">Type:</span>
                       <span className="ml-2 font-medium text-gray-900 dark:text-white">
                         {getApprovalTypeLabel(approval.type)}
                       </span>
                     </div>
                    {category && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                          {category}
                        </span>
                      </div>
                    )}
                    {targetDate && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Target Date:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {new Date(targetDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Requested by:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {requesterName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {description && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span> {description}
                    </p>
                  </div>
                )}

                {/* Action Buttons - Only show if user needs to approve */}
                {needsMyApproval && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onApprove(approval.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>✓</span>
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => onDecline(approval.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>✗</span>
                      <span>Decline</span>
                    </button>
                  </div>
                )}

                {/* View Only - If user is the requester */}
                {!needsMyApproval && (
                  <div className="text-center py-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Waiting for {partnerProfile?.name || 'your partner'} to review this request
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">All caught up!</h3>
          <p className="text-sm">No pending approvals at the moment</p>
        </div>
      )}
    </div>
  )

  const renderActivity = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Partner Activity Feed</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            See what you and your partner have been up to with your shared financial goals
          </p>
        </div>
      </div>
      
      <PartnerActivityFeed user={user} partnerships={partnerships} />
    </div>
  )

  const renderTransparency = () => (
    <TransparencyDashboard
      partnerships={partnerships}
      profile={profile}
      partnerProfile={partnerProfile}
      currencySymbol={currencySymbol}
      expenses={[]}
      goals={goals}
      monthlyProgress={[]}
    />
  )

  const renderCollaboration = () => (
    <div className="space-y-6">
      {/* Add Note Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900 dark:text-white">Shared Notes</h4>
          <button
            onClick={() => setShowAddNote(!showAddNote)}
            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            + Add Note
          </button>
        </div>

        {showAddNote && (
          <form onSubmit={handleAddNote} className="mb-4">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Share a thought, idea, or reminder with your partner..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2 dark:bg-gray-700 dark:text-white"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Add Note
              </button>
              <button
                type="button"
                onClick={() => setShowAddNote(false)}
                className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Shared Notes List */}
      <div className="space-y-3">
        {sharedNotes.length > 0 ? (
          sharedNotes.map((note) => (
            <div key={note.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm text-gray-900 dark:text-white">{note.author}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(note.created_at)}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{note.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">No shared notes yet</h3>
            <p className="text-sm mb-4">Start collaborating by adding your first note</p>
            <button
              onClick={() => setShowAddNote(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Note
            </button>
          </div>
        )}
      </div>

      {/* Collaboration Tips */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Collaboration Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Use notes to discuss financial goals and priorities</li>
          <li>• Share thoughts about upcoming expenses or savings plans</li>
          <li>• Celebrate achievements and milestones together</li>
          <li>• Communicate openly about financial challenges</li>
        </ul>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6 shadow-lg">
        <h1 className="text-heading-2 space-small">Partner Hub</h1>
        <p className="text-body text-blue-100">
          {hasPartner 
            ? `Collaborate with ${partnerProfile.name} on your financial journey`
            : 'Connect with your partner to start sharing financial goals'
          }
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="card overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto px-2 sm:px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 sm:px-4 border-b-2 font-medium text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span className="text-sm sm:text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'approvals' && renderApprovals()}
          {activeTab === 'activity' && renderActivity()}
          {activeTab === 'transparency' && renderTransparency()}
          {activeTab === 'collaboration' && renderCollaboration()}
        </div>
      </div>
    </div>
  )
}
