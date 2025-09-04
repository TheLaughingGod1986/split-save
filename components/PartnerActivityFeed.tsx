'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { apiClient } from '@/lib/api-client'
import { toast } from '@/lib/toast'
import { ActivityFeedItem, ActivityComment } from '@/lib/activity-logger'

interface PartnerActivityFeedProps {
  className?: string
  user?: any
  partnerships?: any[]
}

export function PartnerActivityFeed({ className = '', user: propUser, partnerships }: PartnerActivityFeedProps) {
  const { user: authUser } = useAuth()
  const user = propUser || authUser
  const [activities, setActivities] = useState<ActivityFeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'financial' | 'achievements' | 'social'>('all')
  const [refreshing, setRefreshing] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [comments, setComments] = useState<Record<string, ActivityComment[]>>({})
  const [newComment, setNewComment] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  const loadActivities = useCallback(async (showLoading = true) => {
    if (!user) {
      console.log('❌ No user available for activity feed')
      return
    }

    try {
      if (showLoading) setLoading(true)
      
      const params = new URLSearchParams({
        limit: '50',
        offset: '0',
        ...(filter !== 'all' && { filter })
      })

      console.log('🔄 Loading activities for user:', user.id)
      const response = await apiClient.get(`/activity-feed?${params}`)
      const apiActivities = response.data?.activities || []
      
      console.log('📊 API returned activities:', apiActivities.length)
      
      console.log('✅ Setting activities from API:', apiActivities.length)
      setActivities(apiActivities)
      
      // Mark activities as viewed
      const activityIds = (apiActivities.length > 0 ? apiActivities : []).map((a: ActivityFeedItem) => a.id) || []
      if (activityIds.length > 0) {
        await apiClient.post('/activity-feed', {
          action: 'mark_viewed',
          activityIds
        }).catch(err => console.warn('Failed to mark activities as viewed:', err))
      }
    } catch (error) {
      console.error('Error loading activities:', error)
      toast.error('Failed to load activity feed')
    } finally {
      if (showLoading) setLoading(false)
      setRefreshing(false)
    }
  }, [user, filter])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadActivities(false)
  }

  const handleReaction = async (activityId: string, reactionType: string, isAdding: boolean) => {
    try {
      await apiClient.post('/activity-feed', {
        action: isAdding ? 'add_reaction' : 'remove_reaction',
        activityId,
        reactionType
      })

      // Update local state
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            reaction_count: activity.reaction_count + (isAdding ? 1 : -1),
            user_has_reacted: isAdding
          }
        }
        return activity
      }))

      if (isAdding) {
        toast.success('Reaction added!')
      } else {
        toast.success('Reaction removed!')
      }
    } catch (error) {
      console.error('Error handling reaction:', error)
      toast.error('Failed to update reaction')
    }
  }

  const loadComments = async (activityId: string) => {
    try {
      const response = await apiClient.get(`/activity-feed/${activityId}/comments`)
      setComments(prev => ({
        ...prev,
        [activityId]: response.data?.comments || []
      }))
    } catch (error) {
      console.error('Error loading comments:', error)
      toast.error('Failed to load comments')
    }
  }

  const toggleComments = async (activityId: string) => {
    if (expandedComments.has(activityId)) {
      setExpandedComments(prev => {
        const newSet = new Set(prev)
        newSet.delete(activityId)
        return newSet
      })
    } else {
      setExpandedComments(prev => new Set(prev).add(activityId))
      if (!comments[activityId]) {
        await loadComments(activityId)
      }
    }
  }

  const submitComment = async (activityId: string) => {
    const comment = newComment[activityId]?.trim()
    if (!comment || submittingComment) return

    try {
      setSubmittingComment(activityId)
      
      await apiClient.post('/activity-feed', {
        action: 'add_comment',
        activityId,
        comment
      })

      // Clear input
      setNewComment(prev => ({ ...prev, [activityId]: '' }))

      // Reload comments
      await loadComments(activityId)

      // Update comment count
      setActivities(prev => prev.map(activity => {
        if (activity.id === activityId) {
          return { ...activity, comment_count: activity.comment_count + 1 }
        }
        return activity
      }))

      toast.success('Comment added!')
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmittingComment(null)
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const getActivityIcon = (activity: ActivityFeedItem) => {
    if (activity.is_milestone) {
      return <span className="text-2xl">🏆</span>
    }
    return <span className="text-xl">{activity.type_icon}</span>
  }

  const getActivityColor = (activity: ActivityFeedItem) => {
    const colorMap: Record<string, string> = {
      gold: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      gray: 'text-gray-600 bg-gray-50 border-gray-200'
    }
    return colorMap[activity.type_color] || colorMap.gray
  }

  useEffect(() => {
    console.log('🔄 PartnerActivityFeed useEffect triggered, user:', user?.id)
    loadActivities()
  }, [loadActivities, user])

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['all', 'financial', 'achievements', 'social'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === filterOption
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <span className={`${refreshing ? 'animate-spin' : ''}`}>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      {/* Activity Feed */}
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activity yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'all' 
                ? "Start adding expenses and working towards goals to see activity here!"
                : `No ${filter} activities to show yet.`
              }
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md ${
              activity.is_milestone ? 'ring-2 ring-yellow-200 dark:ring-yellow-800 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/20 dark:to-gray-800' : ''
            }`}>
              <div className="p-4">
                {/* Activity Header */}
                <div className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${getActivityColor(activity)}`}>
                    {getActivityIcon(activity)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">{activity.user_name}</span>
                        {activity.is_milestone && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                            Milestone
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{getRelativeTime(activity.created_at)}</span>
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-1">{activity.title}</h3>
                    
                    {activity.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                    )}
                    
                    {activity.amount && (
                      <div className="text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
                        £{activity.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleReaction(activity.id, 'like', !activity.user_has_reacted)}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        activity.user_has_reacted 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      <span>{activity.user_has_reacted ? '👍' : '👍'}</span>
                      <span>{activity.reaction_count || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(activity.id)}
                      className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      <span>💬</span>
                      <span>{activity.comment_count || 0}</span>
                    </button>
                  </div>

                  <span className={`text-xs px-2 py-1 rounded-full ${getActivityColor(activity)}`}>
                    {activity.type_display_name}
                  </span>
                </div>

                {/* Comments Section */}
                {expandedComments.has(activity.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {/* Existing Comments */}
                    {comments[activity.id] && comments[activity.id].length > 0 && (
                      <div className="space-y-3 mb-4">
                        {comments[activity.id].map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.user_name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTime(comment.created_at)}</span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <textarea
                          value={newComment[activity.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [activity.id]: e.target.value }))}
                          placeholder="Add a comment..."
                          className="w-full text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                          rows={2}
                          maxLength={500}
                        />
                        {newComment[activity.id]?.trim() && (
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {500 - (newComment[activity.id]?.length || 0)} characters remaining
                            </span>
                            <button
                              onClick={() => submitComment(activity.id)}
                              disabled={submittingComment === activity.id}
                              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              {submittingComment === activity.id ? 'Posting...' : 'Post'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
