-- Disable the problematic calculate_goal_feasibility trigger
-- This will allow goal creation to work without the database function error

-- Drop the trigger completely
DROP TRIGGER IF EXISTS trigger_calculate_goal_feasibility ON public.goals;

-- Drop the function as well to prevent any issues
DROP FUNCTION IF EXISTS calculate_goal_feasibility();

-- Add a comment explaining why this was disabled
COMMENT ON TABLE public.goals IS 'Goals table - feasibility calculation trigger temporarily disabled due to PostgreSQL function compatibility issues';
