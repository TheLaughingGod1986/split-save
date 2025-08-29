-- Add priority field to goals table
ALTER TABLE public.goals 
ADD COLUMN priority INTEGER NOT NULL DEFAULT 2 CHECK (priority >= 1 AND priority <= 3);

-- Create index for priority queries
CREATE INDEX idx_goals_priority ON public.goals(priority);

-- Update existing goals to have default priority 2 (medium)
UPDATE public.goals SET priority = 2 WHERE priority IS NULL;
