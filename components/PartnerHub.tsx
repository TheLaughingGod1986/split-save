'use client'

import React, { useState, useEffect } from 'react'
import { toast } from '@/lib/toast'
import { apiClient } from '@/lib/api-client'
import { PartnershipManager } from './PartnershipManager'
import { PartnerActivityFeed } from './PartnerActivityFeed'

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
}

interface Approval {
  id: string
  type: 'expense' | 'goal'
  title: string
  amount: number
  description: string
  requester_name: string
  created_at: string
  status: 'pending' | 'approved' | 'declined'
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
  onUpdate
}: PartnerHubProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'activity' | 'collaboration'>('overview')
  const [sharedNotes, setSharedNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)

  const activePartnership = partnerships.find(p => p.status === 'active')
  const pendingApprovals = approvals?.filter(approval => approval.status === 'pending') || []
  const hasPartner = activePartnership && partnerProfile

  useEffect(() => {
    if (hasPartner) {
      loadSharedNotes()
    }
  }, [hasPartner])

  const loadSharedNotes = async () => {
    try {
      // Note: Shared notes feature requires additional API endpoint
      // For now, return empty array until /api/shared-notes is implemented
      setSharedNotes([])
      console.log('📝 Shared notes feature available - requires API implementation')
    } catch (error) {
      console.error('Failed to load shared notes:', error)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    try {
      // Note: This requires implementing /api/shared-notes endpoint
      const note = {
        id: Date.now().toString(),
        content: newNote.trim(),
        author: profile?.name || 'You',
        created_at: new Date().toISOString(),
        type: 'note'
      }

      // Add to local state for now - would be replaced with API call
      setSharedNotes(prev => [note, ...prev])
      setNewNote('')
      setShowAddNote(false)
      toast.success('Note added successfully!')
    } catch (error) {
      console.error('Failed to add note:', error)
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👥' },
    { id: 'approvals', label: 'Approvals', icon: '⏳', count: pendingApprovals.length },
    { id: 'activity', label: 'Activity', icon: '📱' },
    { id: 'collaboration', label: 'Collaboration', icon: '💬' }
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
              <div className="text-right">
                <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                <p className="text-xs text-green-700 dark:text-green-300">Online</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Partner's Income</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}{partnerProfile?.income?.toFixed(0) || '0'}
                  </p>
                </div>
                <div className="text-2xl">💼</div>
              </div>
            </div>
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
                <div className="text-lg font-bold text-gray-900 dark:text-white">{pendingApprovals.length}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Pending Approvals</div>
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
          {pendingApprovals.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Action Required ({pendingApprovals.length} pending)
                  </h4>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    You have approval requests that need your attention
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Review Now
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
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm px-2 py-1 rounded-full">
          {pendingApprovals.length} pending
        </span>
      </div>

      {pendingApprovals.length > 0 ? (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div key={approval.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getApprovalIcon(approval.type)}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{approval.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Requested by {approval.requester_name} • {formatDate(approval.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {currencySymbol}{approval.amount ? approval.amount.toFixed(2) : '0.00'}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                    Pending
                  </span>
                </div>
              </div>

              {approval.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {approval.description}
                </p>
              )}

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
            </div>
          ))}
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
      
      <PartnerActivityFeed />
    </div>
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
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
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
          {activeTab === 'collaboration' && renderCollaboration()}
        </div>
      </div>
    </div>
  )
}
