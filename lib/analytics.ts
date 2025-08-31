import { track } from '@vercel/analytics'

// Analytics event types for SplitSave
export interface AnalyticsEvent {
  // User Authentication
  'user_signup': { method: 'email' | 'google' | 'oauth' }
  'user_login': { method: 'email' | 'google' | 'oauth' }
  'user_logout': Record<string, never>
  
  // Partnership Events
  'partnership_created': { inviteMethod: 'email' | 'link' }
  'partnership_joined': { method: 'invitation' | 'direct' }
  'partnership_left': Record<string, never>
  
  // Financial Actions
  'expense_added': { category: string; amount: number; requiresApproval: boolean }
  'expense_approved': { amount: number; category: string }
  'expense_declined': { amount: number; category: string }
  
  // Goals & Savings
  'goal_created': { category: string; targetAmount: number; hasPartner: boolean }
  'goal_updated': { goalId: string; field: string }
  'goal_contribution': { goalId: string; amount: number; percentage: number }
  'goal_completed': { goalId: string; totalAmount: number; timeToCompletion: number }
  
  // Safety Pot
  'safety_pot_contribution': { amount: number; newTotal: number }
  'safety_pot_withdrawal': { amount: number; reason?: string }
  
  // Achievements & Gamification
  'achievement_unlocked': { achievementId: string; points: number; category: string }
  'level_up': { newLevel: number; totalPoints: number }
  'streak_milestone': { streakLength: number; type: 'contribution' | 'login' }
  
  // Activity Feed
  'activity_reaction': { activityType: string; reactionType: string }
  'activity_comment': { activityType: string; commentLength: number }
  
  // Navigation & Engagement
  'page_view': { page: string; authenticated: boolean }
  'tab_switched': { from: string; to: string; section: string }
  'feature_used': { feature: string; section: string }
  
  // Notifications
  'notification_received': { type: string; channel: 'web' | 'push' }
  'notification_clicked': { type: string; actionTaken: string }
  'notification_settings_changed': { setting: string; enabled: boolean }
  
  // Performance & Errors
  'error_occurred': { errorType: string; page: string; authenticated: boolean }
  'performance_issue': { metric: 'LCP' | 'FID' | 'CLS'; value: number; page: string }
  
  // Data Export & Privacy
  'data_exported': { format: 'csv' | 'json' | 'pdf'; dataType: string }
  'privacy_setting_changed': { setting: string; value: boolean }
}

/**
 * Track custom analytics events with proper typing
 */
export function trackEvent<K extends keyof AnalyticsEvent>(
  event: K,
  properties: AnalyticsEvent[K]
): void {
  try {
    // Only track in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ANALYTICS_DEBUG) {
      track(event, properties)
      console.log('📊 Analytics event tracked:', event, properties)
    } else {
      console.log('📊 Analytics event (dev):', event, properties)
    }
  } catch (error) {
    console.warn('📊 Analytics tracking failed:', error)
  }
}

/**
 * Track page views with context
 */
export function trackPageView(page: string, authenticated: boolean): void {
  trackEvent('page_view', { page, authenticated })
}

/**
 * Track navigation between tabs/sections
 */
export function trackNavigation(from: string, to: string, section: string): void {
  trackEvent('tab_switched', { from, to, section })
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(feature: string, section: string): void {
  trackEvent('feature_used', { feature, section })
}

/**
 * Track financial actions with proper context
 */
export class FinancialAnalytics {
  static trackExpense(category: string, amount: number, requiresApproval: boolean): void {
    trackEvent('expense_added', { category, amount, requiresApproval })
  }
  
  static trackGoalCreation(category: string, targetAmount: number, hasPartner: boolean): void {
    trackEvent('goal_created', { category, targetAmount, hasPartner })
  }
  
  static trackGoalContribution(goalId: string, amount: number, percentage: number): void {
    trackEvent('goal_contribution', { goalId, amount, percentage })
  }
  
  static trackGoalCompletion(goalId: string, totalAmount: number, timeToCompletion: number): void {
    trackEvent('goal_completed', { goalId, totalAmount, timeToCompletion })
  }
  
  static trackSafetyPotAction(action: 'contribution' | 'withdrawal', amount: number, newTotal: number): void {
    if (action === 'contribution') {
      trackEvent('safety_pot_contribution', { amount, newTotal })
    } else {
      trackEvent('safety_pot_withdrawal', { amount })
    }
  }
}

/**
 * Track gamification events
 */
export class GamificationAnalytics {
  static trackAchievement(achievementId: string, points: number, category: string): void {
    trackEvent('achievement_unlocked', { achievementId, points, category })
  }
  
  static trackLevelUp(newLevel: number, totalPoints: number): void {
    trackEvent('level_up', { newLevel, totalPoints })
  }
  
  static trackStreakMilestone(streakLength: number, type: 'contribution' | 'login'): void {
    trackEvent('streak_milestone', { streakLength, type })
  }
}

/**
 * Track social/activity events
 */
export class SocialAnalytics {
  static trackActivityReaction(activityType: string, reactionType: string): void {
    trackEvent('activity_reaction', { activityType, reactionType })
  }
  
  static trackActivityComment(activityType: string, commentLength: number): void {
    trackEvent('activity_comment', { activityType, commentLength })
  }
  
  static trackPartnershipCreated(inviteMethod: 'email' | 'link'): void {
    trackEvent('partnership_created', { inviteMethod })
  }
}

/**
 * Track user journey and onboarding
 */
export class UserJourneyAnalytics {
  static trackSignup(method: 'email' | 'google' | 'oauth'): void {
    trackEvent('user_signup', { method })
  }
  
  static trackLogin(method: 'email' | 'google' | 'oauth'): void {
    trackEvent('user_login', { method })
  }
  
  static trackLogout(): void {
    trackEvent('user_logout', {})
  }
}

/**
 * Track performance metrics
 */
export class PerformanceAnalytics {
  static trackPerformanceIssue(metric: 'LCP' | 'FID' | 'CLS', value: number, page: string): void {
    // Only track if performance is poor
    const thresholds = { LCP: 2500, FID: 100, CLS: 0.1 }
    if (value > thresholds[metric]) {
      trackEvent('performance_issue', { metric, value, page })
    }
  }
  
  static trackError(errorType: string, page: string, authenticated: boolean): void {
    trackEvent('error_occurred', { errorType, page, authenticated })
  }
}

/**
 * Custom analytics hook for React components
 */
export function useAnalytics() {
  return {
    track: trackEvent,
    trackPageView,
    trackNavigation,
    trackFeatureUsage,
    financial: FinancialAnalytics,
    gamification: GamificationAnalytics,
    social: SocialAnalytics,
    userJourney: UserJourneyAnalytics,
    performance: PerformanceAnalytics,
  }
}
