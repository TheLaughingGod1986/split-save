-- Create safety_pot table
CREATE TABLE IF NOT EXISTS public.safety_pot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  target_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id)
);

-- Create safety_pot_transactions table for logging
CREATE TABLE IF NOT EXISTS public.safety_pot_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safety_pot_id UUID NOT NULL REFERENCES public.safety_pot(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('add', 'withdraw', 'reallocate')),
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT,
  target_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_safety_pot_partnership_id ON public.safety_pot(partnership_id);
CREATE INDEX IF NOT EXISTS idx_safety_pot_transactions_safety_pot_id ON public.safety_pot_transactions(safety_pot_id);
CREATE INDEX IF NOT EXISTS idx_safety_pot_transactions_user_id ON public.safety_pot_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_pot_transactions_created_at ON public.safety_pot_transactions(created_at);

-- Create updated_at trigger for safety_pot
CREATE TRIGGER update_safety_pot_updated_at 
    BEFORE UPDATE ON public.safety_pot 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on safety_pot
ALTER TABLE public.safety_pot ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see safety pot for their partnerships
CREATE POLICY "Users can view safety pot for their partnerships" ON public.safety_pot
    FOR SELECT USING (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Policy: Users can only update safety pot for their partnerships
CREATE POLICY "Users can update safety pot for their partnerships" ON public.safety_pot
    FOR UPDATE USING (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Policy: Users can only insert safety pot for their partnerships
CREATE POLICY "Users can insert safety pot for their partnerships" ON public.safety_pot
    FOR INSERT WITH CHECK (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Enable RLS on safety_pot_transactions
ALTER TABLE public.safety_pot_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see transactions for their partnerships
CREATE POLICY "Users can view safety pot transactions for their partnerships" ON public.safety_pot_transactions
    FOR SELECT USING (
        safety_pot_id IN (
            SELECT sp.id FROM public.safety_pot sp
            JOIN public.partnerships p ON sp.partnership_id = p.id
            WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
        )
    );

-- Policy: Users can only insert transactions for their partnerships
CREATE POLICY "Users can insert safety pot transactions for their partnerships" ON public.safety_pot_transactions
    FOR INSERT WITH CHECK (
        safety_pot_id IN (
            SELECT sp.id FROM public.safety_pot sp
            JOIN public.partnerships p ON sp.partnership_id = p.id
            WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Grant permissions to authenticated users
GRANT ALL ON public.safety_pot TO authenticated;
GRANT ALL ON public.safety_pot_transactions TO authenticated;
CREATE TABLE IF NOT EXISTS public.safety_pot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  target_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(partnership_id)
);

-- Create safety_pot_transactions table for logging
CREATE TABLE IF NOT EXISTS public.safety_pot_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safety_pot_id UUID NOT NULL REFERENCES public.safety_pot(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('add', 'withdraw', 'reallocate')),
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT,
  target_goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_safety_pot_partnership_id ON public.safety_pot(partnership_id);
CREATE INDEX IF NOT EXISTS idx_safety_pot_transactions_safety_pot_id ON public.safety_pot_transactions(safety_pot_id);
CREATE INDEX IF NOT EXISTS idx_safety_pot_transactions_user_id ON public.safety_pot_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_pot_transactions_created_at ON public.safety_pot_transactions(created_at);

-- Create updated_at trigger for safety_pot
CREATE TRIGGER update_safety_pot_updated_at 
    BEFORE UPDATE ON public.safety_pot 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on safety_pot
ALTER TABLE public.safety_pot ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see safety pot for their partnerships
CREATE POLICY "Users can view safety pot for their partnerships" ON public.safety_pot
    FOR SELECT USING (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Policy: Users can only update safety pot for their partnerships
CREATE POLICY "Users can update safety pot for their partnerships" ON public.safety_pot
    FOR UPDATE USING (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Policy: Users can only insert safety pot for their partnerships
CREATE POLICY "Users can insert safety pot for their partnerships" ON public.safety_pot
    FOR INSERT WITH CHECK (
        partnership_id IN (
            SELECT id FROM public.partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Enable RLS on safety_pot_transactions
ALTER TABLE public.safety_pot_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see transactions for their partnerships
CREATE POLICY "Users can view safety pot transactions for their partnerships" ON public.safety_pot_transactions
    FOR SELECT USING (
        safety_pot_id IN (
            SELECT sp.id FROM public.safety_pot sp
            JOIN public.partnerships p ON sp.partnership_id = p.id
            WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
        )
    );

-- Policy: Users can only insert transactions for their partnerships
CREATE POLICY "Users can insert safety pot transactions for their partnerships" ON public.safety_pot_transactions
    FOR INSERT WITH CHECK (
        safety_pot_id IN (
            SELECT sp.id FROM public.safety_pot sp
            JOIN public.partnerships p ON sp.partnership_id = p.id
            WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
        )
        AND user_id = auth.uid()
    );

-- Grant permissions to authenticated users
GRANT ALL ON public.safety_pot TO authenticated;
GRANT ALL ON public.safety_pot_transactions TO authenticated;


