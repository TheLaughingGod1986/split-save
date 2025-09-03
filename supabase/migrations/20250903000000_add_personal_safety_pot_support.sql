-- Add support for personal safety pots (without partnerships)
-- This migration allows users to have safety pots even when not in a partnership

-- Add user_id column to safety_pot table (nullable for backward compatibility)
ALTER TABLE public.safety_pot 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

-- Update the unique constraint to allow both partnership and personal safety pots
ALTER TABLE public.safety_pot 
DROP CONSTRAINT IF EXISTS safety_pot_partnership_id_key;

-- Create new unique constraints
-- For partnership safety pots: one per partnership
CREATE UNIQUE INDEX IF NOT EXISTS idx_safety_pot_partnership_unique 
ON public.safety_pot(partnership_id) 
WHERE partnership_id IS NOT NULL;

-- For personal safety pots: one per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_safety_pot_user_unique 
ON public.safety_pot(user_id) 
WHERE user_id IS NOT NULL AND partnership_id IS NULL;

-- Add check constraint to ensure either partnership_id or user_id is set (but not both)
ALTER TABLE public.safety_pot 
ADD CONSTRAINT safety_pot_ownership_check 
CHECK (
  (partnership_id IS NOT NULL AND user_id IS NULL) OR 
  (partnership_id IS NULL AND user_id IS NOT NULL)
);

-- Update RLS policies to support personal safety pots

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view safety pot for their partnerships" ON public.safety_pot;
DROP POLICY IF EXISTS "Users can update safety pot for their partnerships" ON public.safety_pot;
DROP POLICY IF EXISTS "Users can insert safety pot for their partnerships" ON public.safety_pot;

-- Create new policies that support both partnership and personal safety pots

-- Policy: Users can view safety pot for their partnerships OR their personal safety pot
CREATE POLICY "Users can view their safety pots" ON public.safety_pot
    FOR SELECT USING (
        -- Partnership safety pot
        (partnership_id IS NOT NULL AND partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )) OR
        -- Personal safety pot
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

-- Policy: Users can update safety pot for their partnerships OR their personal safety pot
CREATE POLICY "Users can update their safety pots" ON public.safety_pot
    FOR UPDATE USING (
        -- Partnership safety pot
        (partnership_id IS NOT NULL AND partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )) OR
        -- Personal safety pot
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

-- Policy: Users can insert safety pot for their partnerships OR their personal safety pot
CREATE POLICY "Users can insert their safety pots" ON public.safety_pot
    FOR INSERT WITH CHECK (
        -- Partnership safety pot
        (partnership_id IS NOT NULL AND partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )) OR
        -- Personal safety pot
        (user_id IS NOT NULL AND user_id = auth.uid())
    );

-- Update safety_pot_transactions policies to support personal safety pots

-- Drop existing transaction policies
DROP POLICY IF EXISTS "Users can view safety pot transactions for their partnerships" ON public.safety_pot_transactions;
DROP POLICY IF EXISTS "Users can insert safety pot transactions for their partnerships" ON public.safety_pot_transactions;

-- Create new transaction policies
CREATE POLICY "Users can view their safety pot transactions" ON public.safety_pot_transactions
    FOR SELECT USING (
        -- Partnership safety pot transactions
        (safety_pot_id IN (
            SELECT sp.id FROM public.safety_pot sp
            JOIN public.partnerships p ON sp.partnership_id = p.id
            WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
        )) OR
        -- Personal safety pot transactions
        (safety_pot_id IN (
            SELECT sp.id FROM public.safety_pot sp
            WHERE sp.user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can insert their safety pot transactions" ON public.safety_pot_transactions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND (
            -- Partnership safety pot transactions
            (safety_pot_id IN (
                SELECT sp.id FROM public.safety_pot sp
                JOIN public.partnerships p ON sp.partnership_id = p.id
                WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
            )) OR
            -- Personal safety pot transactions
            (safety_pot_id IN (
                SELECT sp.id FROM public.safety_pot sp
                WHERE sp.user_id = auth.uid()
            ))
        )
    );

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_safety_pot_user_id ON public.safety_pot(user_id);
