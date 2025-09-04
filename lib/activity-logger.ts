import { supabase } from './supabase'

export interface ActivityMetadata {
  [key: string]: any
}

export interface ActivityLogEntry {
  userId: string
  partnershipId: string
  activityType: string
  title: string
  description?: string
  metadata?: ActivityMetadata
  amount?: number
  currency?: string
  entityType?: string
  entityId?: string
  visibility?: 'partners' | 'private' | 'achievements_only'
  isMilestone?: boolean
}

export interface ActivityFeedItem {
  id: string
  user_id: string
  partnership_id: string
  activity_type: string
  title: string
  description?: string
  metadata: ActivityMetadata
  amount?: number
  currency: string
  entity_type?: string
  entity_id?: string
  visibility: string
  is_milestone: boolean
  created_at: string
  user_name: string
  user_avatar?: string
  type_display_name: string
  type_icon: string
  type_color: string
  reaction_count: number
  comment_count: number
  user_has_reacted: boolean
}

export interface ActivityReaction {
  id: string
  activity_id: string
  user_id: string
  reaction_type: 'like' | 'cheer' | 'celebrate' | 'support'
  created_at: string
}

export interface ActivityComment {
  id: string
  activity_id: string
  user_id: string
  comment: string
  created_at: string
  updated_at: string
  user_name?: string
  user_avatar?: string
}

class ActivityLogger {
  
  /**
   * Log a new activity to the partner activity feed
   */
  async logActivity(entry: ActivityLogEntry): Promise<{ success: boolean; activityId?: string; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('log_partner_activity', {
        p_user_id: entry.userId,
        p_partnership_id: entry.partnershipId,
        p_activity_type: entry.activityType,
        p_title: entry.title,
        p_description: entry.description || null,
        p_metadata: entry.metadata || {},
        p_amount: entry.amount || null,
        p_currency: entry.currency || 'GBP',
        p_entity_type: entry.entityType || null,
        p_entity_id: entry.entityId || null,
        p_visibility: entry.visibility || 'partners',
        p_is_milestone: entry.isMilestone || false
      })

      if (error) {
        console.error('Error logging activity:', error)
        return { success: false, error: error.message }
      }

      return { success: true, activityId: data }
    } catch (error) {
      console.error('Error logging activity:', error)
      return { success: false, error: 'Failed to log activity' }
    }
  }

  /**
   * Get the activity feed for a user's partnerships
   */
  async getActivityFeed(userId: string, limit = 50, offset = 0): Promise<{ success: boolean; activities?: ActivityFeedItem[]; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('get_partnership_activity_feed', {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset
      })

      if (error) {
        console.error('Error fetching activity feed:', error)
        return { success: false, error: error.message }
      }

      return { success: true, activities: data || [] }
    } catch (error) {
      console.error('Error fetching activity feed:', error)
      return { success: false, error: 'Failed to fetch activity feed' }
    }
  }

  /**
   * Add a reaction to an activity
   */
  async addReaction(activityId: string, userId: string, reactionType: 'like' | 'cheer' | 'celebrate' | 'support'): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('activity_reactions')
        .upsert({
          activity_id: activityId,
          user_id: userId,
          reaction_type: reactionType
        }, {
          onConflict: 'activity_id,user_id,reaction_type'
        })

      if (error) {
        console.error('Error adding reaction:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error adding reaction:', error)
      return { success: false, error: 'Failed to add reaction' }
    }
  }

  /**
   * Remove a reaction from an activity
   */
  async removeReaction(activityId: string, userId: string, reactionType: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('activity_reactions')
        .delete()
        .match({
          activity_id: activityId,
          user_id: userId,
          reaction_type: reactionType
        })

      if (error) {
        console.error('Error removing reaction:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error removing reaction:', error)
      return { success: false, error: 'Failed to remove reaction' }
    }
  }

  /**
   * Add a comment to an activity
   */
  async addComment(activityId: string, userId: string, comment: string): Promise<{ success: boolean; commentId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('activity_comments')
        .insert({
          activity_id: activityId,
          user_id: userId,
          comment: comment.trim()
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error adding comment:', error)
        return { success: false, error: error.message }
      }

      return { success: true, commentId: data.id }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: 'Failed to add comment' }
    }
  }

  /**
   * Get comments for an activity
   */
  async getActivityComments(activityId: string): Promise<{ success: boolean; comments?: ActivityComment[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('activity_comments')
        .select(`
          id,
          activity_id,
          user_id,
          comment,
          created_at,
          updated_at,
          users:user_id (
            name,
            avatar_url
          )
        `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        return { success: false, error: error.message }
      }

      const comments: ActivityComment[] = (data || []).map(item => ({
        id: item.id,
        activity_id: item.activity_id,
        user_id: item.user_id,
        comment: item.comment,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_name: (item.users as any)?.name || 'Unknown User',
        user_avatar: (item.users as any)?.avatar_url
      }))

      return { success: true, comments }
    } catch (error) {
      console.error('Error fetching comments:', error)
      return { success: false, error: 'Failed to fetch comments' }
    }
  }

  /**
   * Mark activities as viewed
   */
  async markActivitiesAsViewed(userId: string, activityIds: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const viewRecords = activityIds.map(activityId => ({
        viewer_user_id: userId,
        activity_id: activityId
      }))

      const { error } = await supabase
        .from('activity_feed_views')
        .upsert(viewRecords, {
          onConflict: 'viewer_user_id,activity_id'
        })

      if (error) {
        console.error('Error marking activities as viewed:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Error marking activities as viewed:', error)
      return { success: false, error: 'Failed to mark activities as viewed' }
    }
  }
}

// Singleton instance
export const activityLogger = new ActivityLogger()

// Helper functions for common activity types
export const ActivityHelpers = {
  /**
   * Log an expense activity
   */
  async logExpenseActivity(
    userId: string, 
    partnershipId: string, 
    expenseId: string, 
    amount: number, 
    description: string,
    isApproved: boolean = false,
    action: string = 'created'
  ) {
    let activityType = 'expense_added'
    let title = `Added expense: ${description}`
    
    if (isApproved) {
      activityType = 'expense_approved'
      title = `Approved expense: ${description}`
    } else if (action === 'updated') {
      activityType = 'expense_updated'
      title = `Updated expense: ${description}`
    } else if (action === 'deleted') {
      activityType = 'expense_deleted'
      title = `Deleted expense: ${description}`
    }
    
    return activityLogger.logActivity({
      userId,
      partnershipId,
      activityType,
      title,
      description: `£${amount.toFixed(2)} - ${description}`,
      amount,
      entityType: 'expense',
      entityId: expenseId,
      metadata: { approved: isApproved }
    })
  },

  /**
   * Log a goal activity
   */
  async logGoalActivity(
    userId: string, 
    partnershipId: string, 
    goalId: string, 
    goalName: string, 
    action: 'created' | 'updated' | 'contribution' | 'completed',
    amount?: number,
    metadata?: ActivityMetadata
  ) {
    const activityTypes = {
      created: 'goal_created',
      updated: 'goal_updated', 
      contribution: 'goal_contribution',
      completed: 'goal_completed'
    }

    const titles = {
      created: `Created new goal: ${goalName}`,
      updated: `Updated goal: ${goalName}`,
      contribution: `Contributed to ${goalName}`,
      completed: `🎉 Completed goal: ${goalName}`
    }

    return activityLogger.logActivity({
      userId,
      partnershipId,
      activityType: activityTypes[action],
      title: titles[action],
      amount,
      entityType: 'goal',
      entityId: goalId,
      isMilestone: action === 'completed',
      metadata: { action, ...metadata }
    })
  },

  /**
   * Log an achievement activity
   */
  async logAchievementActivity(
    userId: string, 
    partnershipId: string, 
    achievementName: string, 
    achievementType: string,
    points?: number
  ) {
    return activityLogger.logActivity({
      userId,
      partnershipId,
      activityType: 'achievement_unlocked',
      title: `🏅 Unlocked: ${achievementName}`,
      description: `Earned ${points || 0} points`,
      isMilestone: true,
      visibility: 'partners',
      metadata: { achievementType, points }
    })
  },

  /**
   * Log a safety pot activity
   */
  async logSafetyPotActivity(
    userId: string, 
    partnershipId: string, 
    amount: number, 
    action: 'contribution' | 'withdrawal'
  ) {
    const title = action === 'contribution' 
      ? `Added £${amount.toFixed(2)} to Safety Pot`
      : `Withdrew £${amount.toFixed(2)} from Safety Pot`
    
    return activityLogger.logActivity({
      userId,
      partnershipId,
      activityType: 'safety_pot_contribution',
      title,
      amount,
      entityType: 'safety_pot',
      metadata: { action }
    })
  }
}
