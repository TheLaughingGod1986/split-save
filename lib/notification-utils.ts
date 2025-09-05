import { supabaseAdmin } from './supabase'

export interface NotificationData {
  userId: string
  type: 'approval_request' | 'approval_approved' | 'approval_declined' | 'goal_created' | 'expense_created'
  title: string
  message: string
  data?: any
  priority?: 'low' | 'medium' | 'high'
}

/**
 * Create a notification for a user
 */
export async function createNotification(notificationData: NotificationData): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        priority: notificationData.priority || 'medium',
        read: false,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('❌ Failed to create notification:', error)
      throw error
    }

    console.log('✅ Notification created for user:', notificationData.userId, 'Type:', notificationData.type)
  } catch (error) {
    console.error('❌ Error creating notification:', error)
    throw error
  }
}

/**
 * Create approval request notifications for partners
 */
export async function createApprovalRequestNotifications(
  partnershipId: string,
  requesterId: string,
  requestType: 'goal' | 'expense',
  requestData: any
): Promise<void> {
  try {
    // Get partnership details to find the partner
    const { data: partnership, error: partnershipError } = await supabaseAdmin
      .from('partnerships')
      .select('user1_id, user2_id')
      .eq('id', partnershipId)
      .single()

    if (partnershipError || !partnership) {
      console.error('❌ Failed to fetch partnership for notifications:', partnershipError)
      return
    }

    // Find the partner (not the requester)
    const partnerId = partnership.user1_id === requesterId ? partnership.user2_id : partnership.user1_id

    if (!partnerId) {
      console.error('❌ No partner found for notification')
      return
    }

    // Create notification for the partner
    const title = `${requestType === 'goal' ? 'New Goal' : 'New Expense'} Request`
    const message = `Your partner has requested approval for a ${requestType === 'goal' ? 'savings goal' : 'expense'}: ${requestData.name || requestData.description || 'Untitled'}`

    await createNotification({
      userId: partnerId,
      type: 'approval_request',
      title,
      message,
      data: {
        requestType,
        requestData,
        requesterId,
        partnershipId
      },
      priority: 'high'
    })

    console.log('✅ Approval request notification sent to partner:', partnerId)
  } catch (error) {
    console.error('❌ Error creating approval request notifications:', error)
    // Don't throw - notification failure shouldn't break the main flow
  }
}

/**
 * Create approval response notifications
 */
export async function createApprovalResponseNotifications(
  requesterId: string,
  requestType: 'goal' | 'expense',
  requestData: any,
  approved: boolean
): Promise<void> {
  try {
    const title = approved ? 'Request Approved!' : 'Request Declined'
    const message = approved 
      ? `Your ${requestType === 'goal' ? 'savings goal' : 'expense'} request has been approved: ${requestData.name || requestData.description || 'Untitled'}`
      : `Your ${requestType === 'goal' ? 'savings goal' : 'expense'} request was declined: ${requestData.name || requestData.description || 'Untitled'}`

    await createNotification({
      userId: requesterId,
      type: approved ? 'approval_approved' : 'approval_declined',
      title,
      message,
      data: {
        requestType,
        requestData,
        approved
      },
      priority: approved ? 'medium' : 'high'
    })

    console.log('✅ Approval response notification sent to requester:', requesterId)
  } catch (error) {
    console.error('❌ Error creating approval response notifications:', error)
    // Don't throw - notification failure shouldn't break the main flow
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (error) {
      console.error('❌ Failed to get notification count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('❌ Error getting notification count:', error)
    return 0
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Failed to mark notification as read:', error)
      throw error
    }

    console.log('✅ Notification marked as read:', notificationId)
  } catch (error) {
    console.error('❌ Error marking notification as read:', error)
    throw error
  }
}