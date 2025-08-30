-- Create enhanced monthly progress tracking table for SplitSave
-- This migration creates a table to store detailed monthly progress data and analytics

-- Create monthly_progress table for storing detailed monthly progress information
CREATE TABLE IF NOT EXISTS public.monthly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  total_expected DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
  user_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  partner_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  over_under_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  over_under_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'on-track' CHECK (status IN ('on-track', 'behind', 'ahead', 'completed')),
  goals_progress JSONB, -- Store goal progress data as JSON
  expenses_covered DECIMAL(12,2) NOT NULL DEFAULT 0,
  safety_pot_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id, month)
);

-- Create monthly_progress_analytics table for storing calculated analytics
CREATE TABLE IF NOT EXISTS public.monthly_progress_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  average_monthly_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  contribution_growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  best_month VARCHAR(20),
  worst_month VARCHAR(20),
  months_on_track INTEGER NOT NULL DEFAULT 0,
  months_behind INTEGER NOT NULL DEFAULT 0,
  months_ahead INTEGER NOT NULL DEFAULT 0,
  financial_health VARCHAR(20) NOT NULL DEFAULT 'good' CHECK (financial_health IN ('excellent', 'good', 'fair', 'needs-attention')),
  recommendations JSONB, -- Store recommendations as JSON array
  risk_factors JSONB, -- Store risk factors as JSON array
  opportunities JSONB, -- Store opportunities as JSON array
  next_month_projection DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id, month)
);

-- Create partner_accountability table for tracking partner reliability
CREATE TABLE IF NOT EXISTS public.partner_accountability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  contribution_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  reliability_rating VARCHAR(20) NOT NULL DEFAULT 'fair' CHECK (reliability_rating IN ('excellent', 'good', 'fair', 'poor')),
  last_contribution_date TIMESTAMPTZ,
  next_expected_contribution TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id, partner_id, month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_progress_partnership_month ON public.monthly_progress(partnership_id, month);
CREATE INDEX IF NOT EXISTS idx_monthly_progress_status ON public.monthly_progress(status);
CREATE INDEX IF NOT EXISTS idx_monthly_progress_analytics_partnership_month ON public.monthly_progress_analytics(partnership_id, month);
CREATE INDEX IF NOT EXISTS idx_partner_accountability_partnership_partner ON public.partner_accountability(partnership_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_accountability_month ON public.partner_accountability(month);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_monthly_progress_updated_at 
  BEFORE UPDATE ON public.monthly_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_progress_analytics_updated_at 
  BEFORE UPDATE ON public.monthly_progress_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_accountability_updated_at 
  BEFORE UPDATE ON public.partner_accountability 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.monthly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_progress_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_accountability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for monthly_progress
CREATE POLICY "Users can view their partnership's monthly progress" ON public.monthly_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their partnership's monthly progress" ON public.monthly_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their partnership's monthly progress" ON public.monthly_progress
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for monthly_progress_analytics
CREATE POLICY "Users can view their partnership's analytics" ON public.monthly_progress_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress_analytics.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their partnership's analytics" ON public.monthly_progress_analytics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress_analytics.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their partnership's analytics" ON public.monthly_progress_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress_analytics.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for partner_accountability
CREATE POLICY "Users can view their partnership's accountability data" ON public.partner_accountability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = partner_accountability.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their partnership's accountability data" ON public.partner_accountability
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = partner_accountability.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their partnership's accountability data" ON public.partner_accountability
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = partner_accountability.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Grant permissions to authenticated users
GRANT ALL ON public.monthly_progress TO authenticated;
GRANT ALL ON public.monthly_progress_analytics TO authenticated;
GRANT ALL ON public.partner_accountability TO authenticated;

-- Add monthly_target column to goals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'monthly_target') THEN
    ALTER TABLE public.goals ADD COLUMN monthly_target DECIMAL(12,2) DEFAULT 0;
  END IF;
END $$;

-- Add target_date column to goals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'target_date') THEN
    ALTER TABLE public.goals ADD COLUMN target_date DATE;
  END IF;
END $$;

-- Insert some initial monthly progress data for existing partnerships
-- This will be handled by the application logic when users first access monthly progress
-- This migration creates a table to store detailed monthly progress data and analytics

-- Create monthly_progress table for storing detailed monthly progress information
CREATE TABLE IF NOT EXISTS public.monthly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  total_expected DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
  user_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  partner_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  over_under_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  over_under_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'on-track' CHECK (status IN ('on-track', 'behind', 'ahead', 'completed')),
  goals_progress JSONB, -- Store goal progress data as JSON
  expenses_covered DECIMAL(12,2) NOT NULL DEFAULT 0,
  safety_pot_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id, month)
);

-- Create monthly_progress_analytics table for storing calculated analytics
CREATE TABLE IF NOT EXISTS public.monthly_progress_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  average_monthly_contribution DECIMAL(12,2) NOT NULL DEFAULT 0,
  contribution_growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  best_month VARCHAR(20),
  worst_month VARCHAR(20),
  months_on_track INTEGER NOT NULL DEFAULT 0,
  months_behind INTEGER NOT NULL DEFAULT 0,
  months_ahead INTEGER NOT NULL DEFAULT 0,
  financial_health VARCHAR(20) NOT NULL DEFAULT 'good' CHECK (financial_health IN ('excellent', 'good', 'fair', 'needs-attention')),
  recommendations JSONB, -- Store recommendations as JSON array
  risk_factors JSONB, -- Store risk factors as JSON array
  opportunities JSONB, -- Store opportunities as JSON array
  next_month_projection DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id, month)
);

-- Create partner_accountability table for tracking partner reliability
CREATE TABLE IF NOT EXISTS public.partner_accountability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  contribution_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  consistency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  reliability_rating VARCHAR(20) NOT NULL DEFAULT 'fair' CHECK (reliability_rating IN ('excellent', 'good', 'fair', 'poor')),
  last_contribution_date TIMESTAMPTZ,
  next_expected_contribution TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id, partner_id, month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_monthly_progress_partnership_month ON public.monthly_progress(partnership_id, month);
CREATE INDEX IF NOT EXISTS idx_monthly_progress_status ON public.monthly_progress(status);
CREATE INDEX IF NOT EXISTS idx_monthly_progress_analytics_partnership_month ON public.monthly_progress_analytics(partnership_id, month);
CREATE INDEX IF NOT EXISTS idx_partner_accountability_partnership_partner ON public.partner_accountability(partnership_id, partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_accountability_month ON public.partner_accountability(month);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_monthly_progress_updated_at 
  BEFORE UPDATE ON public.monthly_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_progress_analytics_updated_at 
  BEFORE UPDATE ON public.monthly_progress_analytics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_partner_accountability_updated_at 
  BEFORE UPDATE ON public.partner_accountability 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.monthly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_progress_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_accountability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for monthly_progress
CREATE POLICY "Users can view their partnership's monthly progress" ON public.monthly_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their partnership's monthly progress" ON public.monthly_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their partnership's monthly progress" ON public.monthly_progress
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for monthly_progress_analytics
CREATE POLICY "Users can view their partnership's analytics" ON public.monthly_progress_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress_analytics.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their partnership's analytics" ON public.monthly_progress_analytics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress_analytics.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their partnership's analytics" ON public.monthly_progress_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = monthly_progress_analytics.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create RLS policies for partner_accountability
CREATE POLICY "Users can view their partnership's accountability data" ON public.partner_accountability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = partner_accountability.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their partnership's accountability data" ON public.partner_accountability
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = partner_accountability.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their partnership's accountability data" ON public.partner_accountability
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships 
      WHERE id = partner_accountability.partnership_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Grant permissions to authenticated users
GRANT ALL ON public.monthly_progress TO authenticated;
GRANT ALL ON public.monthly_progress_analytics TO authenticated;
GRANT ALL ON public.partner_accountability TO authenticated;

-- Add monthly_target column to goals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'monthly_target') THEN
    ALTER TABLE public.goals ADD COLUMN monthly_target DECIMAL(12,2) DEFAULT 0;
  END IF;
END $$;

-- Add target_date column to goals table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'target_date') THEN
    ALTER TABLE public.goals ADD COLUMN target_date DATE;
  END IF;
END $$;

-- Insert some initial monthly progress data for existing partnerships
-- This will be handled by the application logic when users first access monthly progress


