-- Create achievements tables for SplitSave
-- This migration creates tables to track user achievements and progress

-- Create user_achievements table to track which achievements each user has unlocked
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER NOT NULL DEFAULT 0, -- 0-100 percentage
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create user_progress table to track user progress metrics
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE,
  total_contributions INTEGER NOT NULL DEFAULT 0,
  total_contribution_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_goals INTEGER NOT NULL DEFAULT 0,
  completed_goals INTEGER NOT NULL DEFAULT 0,
  partnership_duration_months INTEGER NOT NULL DEFAULT 0,
  safety_pot_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, partnership_id)
);

-- Create achievement_progress_log table to track progress changes
CREATE TABLE IF NOT EXISTS public.achievement_progress_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  old_progress INTEGER NOT NULL,
  new_progress INTEGER NOT NULL,
  change_reason VARCHAR(200),
  related_entity_type VARCHAR(50), -- 'contribution', 'goal', 'partnership', 'safety_pot'
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON public.user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_partnership_id ON public.user_progress(partnership_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_log_user_id ON public.achievement_progress_log(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_log_achievement_id ON public.achievement_progress_log(achievement_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_achievements_updated_at 
  BEFORE UPDATE ON public.user_achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at 
  BEFORE UPDATE ON public.user_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_progress_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" ON public.user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for achievement_progress_log
CREATE POLICY "Users can view their own progress logs" ON public.achievement_progress_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress logs" ON public.achievement_progress_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON public.user_achievements TO authenticated;
GRANT ALL ON public.user_progress TO authenticated;
GRANT ALL ON public.achievement_progress_log TO authenticated;

-- Add missing columns to user_achievements table
ALTER TABLE public.user_achievements 
ADD COLUMN IF NOT EXISTS unlocked BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS points_earned INTEGER NOT NULL DEFAULT 0;

-- Update the unique constraint for user_progress to be user_id only
ALTER TABLE public.user_progress DROP CONSTRAINT IF EXISTS user_progress_user_id_partnership_id_key;
DROP INDEX IF EXISTS user_progress_user_id_partnership_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_id_unique ON public.user_progress(user_id);

-- Add achievements_unlocked column if missing
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS achievements_unlocked INTEGER NOT NULL DEFAULT 0;

-- Create notifications tables
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'payday', 'goal_deadline', 'streak_risk', 'achievement', 'approval', 'partner_activity', 'test'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  action_required BOOLEAN NOT NULL DEFAULT FALSE,
  related_entity_type VARCHAR(50), -- 'goal', 'expense', 'achievement', etc.
  related_entity_id UUID,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'payday', 'goal_deadline', 'streak_risk', 'achievement', 'approval', 'partner_activity'
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  method VARCHAR(20) NOT NULL DEFAULT 'push', -- 'push', 'email', 'both'
  timing INTEGER NOT NULL DEFAULT 0, -- hours before/after trigger
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Create payday reminders table
CREATE TABLE IF NOT EXISTS public.payday_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  next_payday TIMESTAMPTZ NOT NULL,
  reminder_days INTEGER[] NOT NULL DEFAULT '{1,3}', -- Days before payday to send reminders
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  message TEXT,
  last_sent TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create push subscription table for web push notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON public.notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_payday_reminders_user_id ON public.payday_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_payday_reminders_next_payday ON public.payday_reminders(next_payday);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_notifications_updated_at 
  BEFORE UPDATE ON public.notifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON public.notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payday_reminders_updated_at 
  BEFORE UPDATE ON public.payday_reminders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_push_subscriptions_updated_at 
  BEFORE UPDATE ON public.push_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payday_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Allow system to create notifications

-- Create RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for payday reminders
CREATE POLICY "Users can view their own payday reminders" ON public.payday_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payday reminders" ON public.payday_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payday reminders" ON public.payday_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for push subscriptions
CREATE POLICY "Users can view their own push subscriptions" ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscriptions" ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own push subscriptions" ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notification_preferences TO authenticated;
GRANT ALL ON public.payday_reminders TO authenticated;
GRANT ALL ON public.push_subscriptions TO authenticated;

-- Insert some initial achievement data for existing users
-- This will be handled by the application logic when users first access achievements


