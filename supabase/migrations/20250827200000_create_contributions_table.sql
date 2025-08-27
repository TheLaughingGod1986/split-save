-- Create contributions table for monthly contribution tracking
CREATE TABLE IF NOT EXISTS public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  user1_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  user2_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  user1_paid BOOLEAN NOT NULL DEFAULT false,
  user2_paid BOOLEAN NOT NULL DEFAULT false,
  user1_paid_date TIMESTAMPTZ,
  user2_paid_date TIMESTAMPTZ,
  total_required DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id, month)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contributions_partnership_id ON public.contributions(partnership_id);
CREATE INDEX IF NOT EXISTS idx_contributions_month ON public.contributions(month);
CREATE INDEX IF NOT EXISTS idx_contributions_user1_paid ON public.contributions(user1_paid);
CREATE INDEX IF NOT EXISTS idx_contributions_user2_paid ON public.contributions(user2_paid);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contributions_updated_at 
    BEFORE UPDATE ON public.contributions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see contributions for their partnerships
CREATE POLICY "Users can view contributions for their partnerships" ON public.contributions
    FOR SELECT USING (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Policy: Users can only insert contributions for their partnerships
CREATE POLICY "Users can insert contributions for their partnerships" ON public.contributions
    FOR INSERT WITH CHECK (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Policy: Users can only update their own payment status
CREATE POLICY "Users can update their own payment status" ON public.contributions
    FOR UPDATE USING (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Grant permissions to authenticated users
GRANT ALL ON public.contributions TO authenticated;
GRANT USAGE ON SEQUENCE contributions_id_seq TO authenticated;
