-- Make partnership_id nullable to support personal safety pots
-- This fixes the issue where personal safety pots can't be created

-- First, make partnership_id nullable
ALTER TABLE public.safety_pot 
ALTER COLUMN partnership_id DROP NOT NULL;

-- Update the check constraint to ensure either partnership_id or user_id is set (but not both)
-- Drop the existing constraint if it exists
ALTER TABLE public.safety_pot 
DROP CONSTRAINT IF EXISTS safety_pot_ownership_check;

-- Add the new constraint
ALTER TABLE public.safety_pot 
ADD CONSTRAINT safety_pot_ownership_check 
CHECK (
  (partnership_id IS NOT NULL AND user_id IS NULL) OR 
  (partnership_id IS NULL AND user_id IS NOT NULL)
);
