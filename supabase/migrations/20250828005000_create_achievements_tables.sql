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

-- Insert some initial achievement data for existing users
-- This will be handled by the application logic when users first access achievements
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

-- Insert some initial achievement data for existing users
-- This will be handled by the application logic when users first access achievements


