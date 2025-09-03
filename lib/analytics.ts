import { track } from '@vercel/analytics'
import { useEffect, useCallback } from 'react'

// Analytics event types for SplitSave
export interface AnalyticsEvent {
  // User Authentication
  'user_signup': { method: 'email' | 'google' | 'oauth' }
  'user_login': { method: 'email' | 'google' | 'oauth' }
  'user_logout': Record<string, never>
  
  // CRO & Conversion Events
  'cta_clicked': { location: string; cta_type: string; page: string }
  'landing_page_view': { source: string; utm_campaign?: string; utm_source?: string }
  'signup_started': { method: string; source: string }
  'signup_completed': { method: string; time_to_complete: number }
  'onboarding_started': { step: string }
  'onboarding_completed': { total_steps: number; time_to_complete: number }
  'first_feature_used': { feature: string; time_since_signup: number }
  
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
  
  // User Behavior & Retention
  'session_started': { duration: number; pages_visited: number }
  'session_ended': { duration: number; pages_visited: number; exit_page: string }
  'return_visit': { days_since_last_visit: number; visit_count: number }
  'feature_discovery': { feature: string; discovery_method: string }
  'error_encountered': { error_type: string; page: string; user_action: string }
  
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
  
  // A/B Testing
  'ab_test_viewed': { test_name: string; variant: string; page: string }
  'ab_test_converted': { test_name: string; variant: string; conversion_type: string }
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
export function trackPageView(page: string, authenticated: boolean = false): void {
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
 * React hook for analytics with session tracking
 */
export function useAnalytics() {
  const trackEventWithHook = useCallback(<K extends keyof AnalyticsEvent>(
    event: K,
    properties: AnalyticsEvent[K]
  ) => {
    trackEvent(event, properties)
  }, [])

  const trackPageViewWithHook = useCallback((page: string, authenticated: boolean = false) => {
    trackPageView(page, authenticated)
  }, [])

  const trackNavigationWithHook = useCallback((from: string, to: string, section: string) => {
    trackNavigation(from, to, section)
  }, [])

  // Track session start on mount (only once)
  useEffect(() => {
    // Only track if not already tracked in this session
    if (!sessionStorage.getItem('analytics_session_tracked')) {
      trackEvent('session_started', { duration: 0, pages_visited: 1 })
      sessionStorage.setItem('analytics_session_tracked', 'true')
    }
    
    // Track session end on unmount
    return () => {
      trackEvent('session_ended', { duration: 0, pages_visited: 1, exit_page: 'unknown' })
      sessionStorage.removeItem('analytics_session_tracked')
    }
  }, [])

  return {
    trackEvent: trackEventWithHook,
    trackPageView: trackPageViewWithHook,
    trackNavigation: trackNavigationWithHook,
    // Legacy analytics object for backward compatibility
    financial: {
      trackExpense: (category: string, amount: number, requiresApproval: boolean) => 
        trackEvent('expense_added', { category, amount, requiresApproval }),
      trackGoalCreation: (category: string, targetAmount: number, hasPartner: boolean) => 
        trackEvent('goal_created', { category, targetAmount, hasPartner })
    },
    conversion: {
      landingPageView: (source: string, options?: any) => 
        trackEvent('landing_page_view', { source, ...options })
    },
    session: {
      started: () => trackEvent('session_started', { duration: 0, pages_visited: 1 })
    }
  }
}

// Analytics namespace for easier access (for non-hook usage)
export const analytics = {
  user: {
    signup: (method: 'email' | 'google' | 'oauth') => trackEvent('user_signup', { method }),
    login: (method: 'email' | 'google' | 'oauth') => trackEvent('user_login', { method }),
    logout: () => trackEvent('user_logout', {}),
  },
  conversion: {
    ctaClick: (location: string, ctaType: string, page: string = 'landing') => 
      trackEvent('cta_clicked', { location, cta_type: ctaType, page }),
    landingPageView: (source: string, utmParams?: { campaign?: string; source?: string }) => 
      trackEvent('landing_page_view', { 
        source, 
        utm_campaign: utmParams?.campaign,
        utm_source: utmParams?.source
      }),
    signupStarted: (method: string, source: string) => 
      trackEvent('signup_started', { method, source }),
    signupCompleted: (method: string, timeToComplete: number) => 
      trackEvent('signup_completed', { method, time_to_complete: timeToComplete }),
    onboardingStarted: (step: string) => 
      trackEvent('onboarding_started', { step }),
    onboardingCompleted: (totalSteps: number, timeToComplete: number) => 
      trackEvent('onboarding_completed', { total_steps: totalSteps, time_to_complete: timeToComplete }),
    firstFeatureUsed: (feature: string, timeSinceSignup: number) => 
      trackEvent('first_feature_used', { feature, time_since_signup: timeSinceSignup }),
  },
  session: {
    started: () => trackEvent('session_started', { duration: 0, pages_visited: 1 }),
    ended: () => trackEvent('session_ended', { duration: 0, pages_visited: 1, exit_page: 'unknown' }),
    returnVisit: () => trackEvent('return_visit', { days_since_last_visit: 0, visit_count: 1 }),
  },
  behavior: {
    featureDiscovery: (feature: string, discoveryMethod: string) => 
      trackEvent('feature_discovery', { feature, discovery_method: discoveryMethod }),
    errorEncountered: (errorType: string, page: string, userAction: string) => 
      trackEvent('error_encountered', { error_type: errorType, page, user_action: userAction }),
    navigation: trackNavigation,
    featureUsage: trackFeatureUsage,
  },
  financial: {
    trackExpense: (category: string, amount: number, requiresApproval: boolean) => 
      trackEvent('expense_added', { category, amount, requiresApproval }),
    trackGoalCreation: (category: string, targetAmount: number, hasPartner: boolean) => 
      trackEvent('goal_created', { category, targetAmount, hasPartner }),
    trackAchievement: (achievementId: string, points: number, category: string) => 
      trackEvent('achievement_unlocked', { achievementId, points, category }),
    trackLevelUp: (newLevel: number, totalPoints: number) => 
      trackEvent('level_up', { newLevel, totalPoints }),
    trackStreak: (streakLength: number, type: 'contribution' | 'login') => 
      trackEvent('streak_milestone', { streakLength, type }),
  },
  notifications: {
    received: (type: string, channel: 'web' | 'push') => 
      trackEvent('notification_received', { type, channel }),
    clicked: (type: string, actionTaken: string) => 
      trackEvent('notification_clicked', { type, actionTaken }),
  },
  performance: {
    issue: (metric: 'LCP' | 'FID' | 'CLS', value: number, page: string) => 
      trackEvent('performance_issue', { metric, value, page }),
  },
  privacy: {
    settingChanged: (setting: string, value: boolean) => 
      trackEvent('privacy_setting_changed', { setting, value }),
    dataExported: (format: 'csv' | 'json' | 'pdf', dataType: string) => 
      trackEvent('data_exported', { format, dataType }),
  },
  abTesting: {
    viewed: (testName: string, variant: string, page: string) => 
      trackEvent('ab_test_viewed', { test_name: testName, variant, page }),
    converted: (testName: string, variant: string, conversionType: string) => 
      trackEvent('ab_test_converted', { test_name: testName, variant, conversion_type: conversionType }),
  },
}
