import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface PartnerCollaborationViewProps {
  partnerships: any[]
  profile: any
  partnerProfile: any
  goals: any[]
  user: any
  currencySymbol: string
}

interface CollaborationSession {
  id: string
  type: 'goal-planning' | 'monthly-review' | 'financial-discussion'
  title: string
  description: string
  scheduledDate: Date
  status: 'scheduled' | 'in-progress' | 'completed'
  participants: string[]
  notes: string[]
}

interface SharedNote {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

interface TeamAchievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: Date
  category: 'collaboration' | 'financial' | 'milestone'
}

export function PartnerCollaborationView({ 
  partnerships, 
  profile, 
  partnerProfile, 
  goals, 
  user, 
  currencySymbol 
}: PartnerCollaborationViewProps) {
  const [collaborationSessions, setCollaborationSessions] = useState<CollaborationSession[]>([])
  const [sharedNotes, setSharedNotes] = useState<SharedNote[]>([])
  const [teamAchievements, setTeamAchievements] = useState<TeamAchievement[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'calendar' | 'communication' | 'insights'>('overview')
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)

  const initializeCollaborationData = () => {
    // In a real app, this would fetch from collaboration API
    // For now, initialize with empty arrays until real data is implemented
    setCollaborationSessions([])
    setSharedNotes([])
  }

  const checkForTeamAchievements = useCallback(() => {
    if (!partnerships || partnerships.length === 0) return

    const newAchievements: TeamAchievement[] = []

    // Check for partnership milestones
    if (partnerships.length > 0) {
      newAchievements.push({
        id: 'partnership-formed',
        title: 'Partnership Formed',
        description: 'Successfully connected with your financial partner',
        icon: '🤝',
        unlockedAt: new Date(),
        category: 'collaboration'
      })
    }

    // Check for goal achievements
    if (goals && goals.length > 0) {
      newAchievements.push({
        id: 'first-shared-goal',
        title: 'First Shared Goal',
        description: 'Created your first shared financial goal together',
        icon: '🎯',
        unlockedAt: new Date(),
        category: 'financial'
      })
    }

    // Check for financial milestones
    const totalGoals = goals?.length || 0
    const completedGoals = goals?.filter(goal => goal.current_amount >= goal.target_amount).length || 0
    
    if (completedGoals > 0) {
      newAchievements.push({
        id: 'first-goal-completed',
        title: 'First Goal Completed',
        description: 'Achieved your first shared financial goal together',
        icon: '🏆',
        unlockedAt: new Date(),
        category: 'milestone'
      })
    }

    setTeamAchievements(newAchievements)
  }, [partnerships, goals])

  useEffect(() => {
    initializeCollaborationData()
    checkForTeamAchievements()
  }, [partnerships, goals, checkForTeamAchievements])

  const calculateCollaborationScore = () => {
    if (!partnerships || partnerships.length === 0) return 0
    
    let score = 0
    
    // Base partnership score
    score += 30
    
    // Goal collaboration score
    if (goals && goals.length > 0) {
      score += Math.min(30, goals.length * 10)
    }
    
    // Communication score
    if (sharedNotes.length > 0) {
      score += Math.min(20, sharedNotes.length * 5)
    }
    
    // Planning score
    if (collaborationSessions.length > 0) {
      score += Math.min(20, collaborationSessions.length * 10)
    }
    
    return Math.min(100, score)
  }

  const getCollaborationLevel = (score: number) => {
    if (score >= 90) return { level: 'Elite', icon: '👑', color: 'text-yellow-600' }
    if (score >= 80) return { level: 'Advanced', icon: '⭐', color: 'text-purple-600' }
    if (score >= 70) return { level: 'Intermediate', icon: '🚀', color: 'text-blue-600' }
    if (score >= 50) return { level: 'Beginner', icon: '🌱', color: 'text-green-600' }
    return { level: 'Getting Started', icon: '🎯', color: 'text-gray-600' }
  }

  const getNextPayday = (profile: any) => {
    if (!profile?.payday) return null
    
    const today = new Date()
    const payday = new Date(profile.payday)
    
    // If payday has passed this month, calculate next month's payday
    if (payday < today) {
      payday.setMonth(payday.getMonth() + 1)
    }
    
    return payday
  }

  const formatTimeUntil = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days < 7) return `${days} days`
    if (days < 30) return `${Math.ceil(days / 7)} weeks`
    return `${Math.ceil(days / 30)} months`
  }

  if (!partnerships || partnerships.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
        <div className="text-8xl mb-6 opacity-50">🤝</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Partnership Required</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
          To access enhanced partner features, you need to be connected with a partner. This allows you to collaborate on financial goals and planning together.
        </p>
        
        <div className="text-left max-w-md mx-auto">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 text-center">Next steps:</h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li>• Partner with someone to start collaborating</li>
            <li>• Set up shared financial goals</li>
            <li>• Plan your financial future together</li>
          </ul>
        </div>
      </div>
    )
  }

  const collaborationScore = calculateCollaborationScore()
  const collaborationLevel = getCollaborationLevel(collaborationScore)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-900 to-pink-600 dark:from-purple-100 dark:to-pink-300 bg-clip-text text-transparent">
            Partner Collaboration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Work together with your partner to achieve financial success
          </p>
        </div>
        
        {/* Collaboration Score */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="text-center">
            <div className="text-2xl mb-1">{collaborationLevel.icon}</div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {collaborationScore}/100
            </div>
            <div className={`text-sm font-medium ${collaborationLevel.color}`}>
              {collaborationLevel.level}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'goals', label: 'Collaborative Goals', icon: '🎯' },
          { id: 'calendar', label: 'Shared Calendar', icon: '📅' },
          { id: 'communication', label: 'Communication', icon: '💬' },
          { id: 'insights', label: 'Partner Insights', icon: '🔍' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Partnership Overview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🤝 Partnership Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Your Profile */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm font-bold">{profile?.name?.charAt(0)?.toUpperCase() || 'Y'}</span>
                  </div>
                  {profile?.name || 'Your'} Profile
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{profile?.income?.toLocaleString() || '--'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Personal Allowance</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{profile?.personal_allowance?.toLocaleString() || '--'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Payday</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(() => {
                        const nextPayday = getNextPayday(profile)
                        return nextPayday ? formatTimeUntil(nextPayday) : 'Not set'
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Partner Profile */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-sm font-bold">{partnerProfile?.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                  </div>
                  {partnerProfile?.name || 'Partner'}&apos;s Profile
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Income</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{partnerProfile?.income?.toLocaleString() || '--'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Personal Allowance</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currencySymbol}{partnerProfile?.personal_allowance?.toLocaleString() || '--'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Payday</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(() => {
                        const nextPayday = getNextPayday(partnerProfile)
                        return nextPayday ? formatTimeUntil(nextPayday) : 'Not set'
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Team Achievements */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🏆 Team Achievements</h2>
            
            {teamAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamAchievements.map((achievement) => (
                  <div key={achievement.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-2">
                        {achievement.description}
                      </p>
                      <div className="text-xs text-yellow-600 dark:text-yellow-400">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🎯</div>
                <div>No team achievements yet</div>
                <div className="text-sm">Start collaborating to unlock achievements together</div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">⚡ Quick Actions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowNewSessionModal(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white p-4 rounded-lg text-center transition-all transform hover:-translate-y-0.5"
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium">Schedule Session</div>
                <div className="text-xs opacity-80">Plan financial review</div>
              </button>
              
              <button
                onClick={() => setShowNewNoteModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white p-4 rounded-lg text-center transition-all transform hover:-translate-y-0.5"
              >
                <div className="text-2xl mb-2">📝</div>
                <div className="font-medium">Add Note</div>
                <div className="text-xs opacity-80">Share financial thoughts</div>
              </button>
              
              <button
                onClick={() => setActiveTab('goals')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-4 rounded-lg text-center transition-all transform hover:-translate-y-0.5"
              >
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium">Review Goals</div>
                <div className="text-xs opacity-80">Check progress together</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🎯 Collaborative Goals</h2>
          
          {goals && goals.length > 0 ? (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{goal.category}</span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">{goal.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Progress:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {currencySymbol}{goal.current_amount?.toFixed(2) || '0'} / {currencySymbol}{goal.target_amount.toFixed(2)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Status:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {goal.current_amount >= goal.target_amount ? '✅ Completed' : '🔄 In Progress'}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Created:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {goal.created_at ? new Date(goal.created_at).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-4xl mb-2">🎯</div>
              <div>No shared goals yet</div>
              <div className="text-sm">Create goals together to start collaborating</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📅 Shared Calendar</h2>
          
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">📋 Upcoming Sessions</h3>
              
              {collaborationSessions.filter(session => session.status === 'scheduled').length > 0 ? (
                <div className="space-y-3">
                  {collaborationSessions
                    .filter(session => session.status === 'scheduled')
                    .map((session) => (
                      <div key={session.id} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100">{session.title}</h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300">{session.description}</p>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {session.scheduledDate.toLocaleDateString()} at {session.scheduledDate.toLocaleTimeString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              {formatTimeUntil(session.scheduledDate)}
                            </div>
                            <div className="text-xs text-blue-500 dark:text-blue-300">
                              {session.participants.join(' & ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <div className="text-2xl mb-2">📅</div>
                  <div>No upcoming sessions</div>
                  <div className="text-sm">Schedule a session to start planning together</div>
                </div>
              )}
            </div>

            {/* Payday Calendar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">💰 Payday Calendar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Your Payday */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <div className="text-center">
                    <div className="text-2xl mb-2">👤</div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">{profile?.name || 'Your'} Payday</h4>
                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                      {(() => {
                        const nextPayday = getNextPayday(profile)
                        return nextPayday ? formatTimeUntil(nextPayday) : 'Not set'
                      })()}
                    </div>
                    {profile?.payday && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {new Date(profile.payday).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Partner Payday */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🤝</div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">{partnerProfile?.name || 'Partner'}&apos;s Payday</h4>
                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {(() => {
                        const nextPayday = getNextPayday(partnerProfile)
                        return nextPayday ? formatTimeUntil(nextPayday) : 'Not set'
                      })()}
                    </div>
                    {partnerProfile?.payday && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {new Date(partnerProfile.payday).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'communication' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">💬 Communication Hub</h2>
          
          <div className="space-y-6">
            {/* Shared Notes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">📝 Shared Notes</h3>
                <button
                  onClick={() => setShowNewNoteModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + Add Note
                </button>
              </div>
              
              {sharedNotes.length > 0 ? (
                <div className="space-y-3">
                  {sharedNotes.map((note) => (
                    <div key={note.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">{note.title}</h4>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          by {note.author}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{note.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {note.tags.map((tag) => (
                            <span key={tag} className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {note.updatedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <div>No shared notes yet</div>
                  <div className="text-sm">Start sharing financial thoughts and plans</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🔍 Partner Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Collaboration Metrics */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">🤝 Collaboration Metrics</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Collaboration Score</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">{collaborationScore}/100</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Shared Goals</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">{goals?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Scheduled Sessions</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">{collaborationSessions.filter(s => s.status === 'scheduled').length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-purple-700 dark:text-purple-300">Shared Notes</span>
                  <span className="font-medium text-purple-900 dark:text-purple-100">{sharedNotes.length}</span>
                </div>
              </div>
            </div>
            
            {/* Financial Comparison */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">💰 Financial Comparison</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 dark:text-green-300">Combined Income</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {currencySymbol}{((profile?.income || 0) + (partnerProfile?.income || 0)).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 dark:text-green-300">Combined Allowance</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {currencySymbol}{((profile?.personal_allowance || 0) + (partnerProfile?.personal_allowance || 0)).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 dark:text-green-300">Combined Disposable</span>
                  <span className="font-medium text-green-900 dark:text-green-100">
                    {currencySymbol}{(((profile?.income || 0) - (profile?.personal_allowance || 0)) + ((partnerProfile?.income || 0) - (partnerProfile?.personal_allowance || 0))).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showNewSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule New Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Type</label>
                <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
                  <option value="goal-planning">Goal Planning</option>
                  <option value="monthly-review">Monthly Review</option>
                  <option value="financial-discussion">Financial Discussion</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Session title" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date & Time</label>
                <input type="datetime-local" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewSessionModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNewSessionModal(false)
                  toast.success('Session scheduled successfully!')
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Note Modal */}
      {showNewNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Shared Note</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="Note title" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                <textarea className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" rows={4} placeholder="Share your thoughts..."></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input type="text" className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" placeholder="planning, strategy, goals" />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewNoteModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowNewNoteModal(false)
                  toast.success('Note shared successfully!')
                }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
