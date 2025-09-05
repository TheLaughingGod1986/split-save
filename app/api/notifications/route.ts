import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

interface NotificationPreference {
  type: 'payday' | 'goal_deadline' | 'streak_risk' | 'achievement' | 'approval' | 'partner_activity' | 'approval_request' | 'approval_approved' | 'approval_declined'
  enabled: boolean
  method: 'push' | 'email' | 'both'
  timing: number
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's notification preferences
    const { data: preferences } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)

    // Get pending notifications
    const { data: notifications } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false })

    // Get unread count
    const { count: unreadCount } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false)

    // Generate smart reminders based on user data
    const smartReminders = await generateSmartReminders(user.id)

    return NextResponse.json({
      preferences: preferences || [],
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      smartReminders
    })

  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { type, action, preferences } = body

    switch (action) {
      case 'update_preferences':
        await updateNotificationPreferences(user.id, preferences)
        return NextResponse.json({ success: true })

      case 'mark_read':
        await markNotificationRead(user.id, body.notificationId)
        return NextResponse.json({ success: true })

      case 'send_test':
        await sendTestNotification(user.id, type)
        return NextResponse.json({ success: true })

      case 'schedule_reminder':
        await schedulePaydayReminder(user.id, body.reminderData)
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error handling notification action:', error)
    return NextResponse.json(
      { error: 'Failed to process notification action' },
      { status: 500 }
    )
  }
}

async function generateSmartReminders(userId: string) {
  try {
    // Get user's profile and partnership data
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: goals } = await supabaseAdmin
      .from('goals')
      .select('*')
      .eq('partnership_id', profile?.partnership_id || '')

    const { data: contributions } = await supabaseAdmin
      .from('contributions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)

    const { data: progress } = await supabaseAdmin
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    const reminders = []

    // 1. Payday Reminders
    if (profile?.payday) {
      const nextPayday = calculateNextPayday(profile.payday)
      const daysUntilPayday = Math.ceil((new Date(nextPayday).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilPayday <= 3 && daysUntilPayday > 0) {
        reminders.push({
          type: 'payday',
          title: `Payday Reminder - ${daysUntilPayday} day(s) left`,
          message: `Your payday is in ${daysUntilPayday} day(s). Don't forget to make your monthly savings contributions!`,
          severity: 'info',
          actionRequired: true,
          scheduledFor: nextPayday
        })
      }
    }

    // 2. Goal Deadline Reminders
    if (goals) {
      for (const goal of goals) {
        if (goal.target_date) {
          const deadline = new Date(goal.target_date)
          const daysUntilDeadline = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          const progressPercent = (goal.current_amount / goal.target_amount) * 100
          
          if (daysUntilDeadline <= 30 && daysUntilDeadline > 0 && progressPercent < 90) {
            reminders.push({
              type: 'goal_deadline',
              title: `Goal Deadline Approaching`,
              message: `Your "${goal.name}" goal deadline is in ${daysUntilDeadline} days. You're ${progressPercent.toFixed(1)}% complete.`,
              severity: progressPercent < 50 ? 'warning' : 'info',
              actionRequired: true,
              relatedEntityId: goal.id
            })
          }
        }
      }
    }

    // 3. Streak Risk Warnings
    if (progress && contributions && contributions.length > 0) {
      const lastContribution = contributions[0]
      const daysSinceLastContribution = Math.floor((Date.now() - new Date(lastContribution.created_at).getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSinceLastContribution >= 25 && progress.current_streak > 0) {
        reminders.push({
          type: 'streak_risk',
          title: 'Streak at Risk!',
          message: `Your ${progress.current_streak}-month streak is at risk! It's been ${daysSinceLastContribution} days since your last contribution.`,
          severity: 'warning',
          actionRequired: true
        })
      }
    }

    // 4. Achievement Progress Reminders
    if (progress) {
      // Check if close to unlocking achievements
      const pointsToNextLevel = (progress.current_level * 100) - progress.total_points
      if (pointsToNextLevel <= 25 && pointsToNextLevel > 0) {
        reminders.push({
          type: 'achievement',
          title: 'Close to Next Level!',
          message: `You're only ${pointsToNextLevel} points away from reaching Level ${progress.current_level + 1}!`,
          severity: 'success',
          actionRequired: false
        })
      }
    }

    return reminders

  } catch (error) {
    console.error('Error generating smart reminders:', error)
    return []
  }
}

function calculateNextPayday(paydayConfig: any): string {
  const now = new Date()
  let nextPayday = new Date(now)

  if (typeof paydayConfig === 'string') {
    // Handle different payday formats
    if (paydayConfig.includes('last-friday')) {
      // Last Friday of the month
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      while (lastDay.getDay() !== 5) { // 5 = Friday
        lastDay.setDate(lastDay.getDate() - 1)
      }
      nextPayday = lastDay
    } else if (paydayConfig.includes('last-working-day')) {
      // Last working day of the month
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      while (lastDay.getDay() === 0 || lastDay.getDay() === 6) { // Skip weekends
        lastDay.setDate(lastDay.getDate() - 1)
      }
      nextPayday = lastDay
    } else {
      // Assume it's a day number (1-31)
      const day = parseInt(paydayConfig)
      nextPayday = new Date(now.getFullYear(), now.getMonth(), day)
      if (nextPayday <= now) {
        nextPayday = new Date(now.getFullYear(), now.getMonth() + 1, day)
      }
    }
  }

  // If the calculated payday is in the past, move to next month
  if (nextPayday <= now) {
    if (paydayConfig.includes('last-friday') || paydayConfig.includes('last-working-day')) {
      nextPayday = new Date(now.getFullYear(), now.getMonth() + 2, 0)
      // Recalculate for next month
      if (paydayConfig.includes('last-friday')) {
        while (nextPayday.getDay() !== 5) {
          nextPayday.setDate(nextPayday.getDate() - 1)
        }
      } else {
        while (nextPayday.getDay() === 0 || nextPayday.getDay() === 6) {
          nextPayday.setDate(nextPayday.getDate() - 1)
        }
      }
    } else {
      const day = parseInt(paydayConfig)
      nextPayday = new Date(now.getFullYear(), now.getMonth() + 1, day)
    }
  }

  return nextPayday.toISOString()
}

async function updateNotificationPreferences(userId: string, preferences: NotificationPreference[]) {
  // Upsert notification preferences
  for (const pref of preferences) {
    await supabaseAdmin
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        type: pref.type,
        enabled: pref.enabled,
        method: pref.method,
        timing: pref.timing,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,type'
      })
  }
}

async function markNotificationRead(userId: string, notificationId: string) {
  await supabaseAdmin
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('id', notificationId)
}

async function sendTestNotification(userId: string, type: string) {
  // Create a test notification record
  await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type: 'test',
      title: 'Test Notification',
      message: `This is a test ${type} notification from SplitSave`,
      severity: 'info',
      read: false,
      created_at: new Date().toISOString()
    })
}

async function schedulePaydayReminder(userId: string, reminderData: any) {
  // Insert payday reminder schedule
  await supabaseAdmin
    .from('payday_reminders')
    .upsert({
      user_id: userId,
      next_payday: reminderData.nextPayday,
      reminder_days: reminderData.reminderDays,
      enabled: reminderData.enabled,
      message: reminderData.message,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
}
