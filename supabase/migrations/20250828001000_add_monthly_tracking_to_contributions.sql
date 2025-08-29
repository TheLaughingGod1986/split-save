-- Add monthly tracking fields to goal_contributions table
ALTER TABLE public.goal_contributions 
ADD COLUMN month INTEGER NOT NULL DEFAULT EXTRACT(MONTH FROM NOW()),
ADD COLUMN year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
ADD COLUMN expected_amount DECIMAL(10,2),
ADD COLUMN over_under_amount DECIMAL(10,2);

-- Create index for monthly queries
CREATE INDEX idx_goal_contributions_month_year ON public.goal_contributions(month, year);

-- Update existing records to have current month/year
UPDATE public.goal_contributions 
SET month = EXTRACT(MONTH FROM created_at), 
    year = EXTRACT(YEAR FROM created_at)
WHERE month IS NULL OR year IS NULL;
