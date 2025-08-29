-- Add goal_contributions table for tracking individual contributions
CREATE TABLE public.goal_contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on goal_contributions
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goal_contributions
CREATE POLICY "goal_contributions_select_policy" ON public.goal_contributions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.goals g
        JOIN public.partnerships p ON g.partnership_id = p.id
        WHERE g.id = goal_contributions.goal_id
        AND p.status = 'active'
        AND auth.uid() IN (p.user1_id, p.user2_id)
    )
);

CREATE POLICY "goal_contributions_insert_policy" ON public.goal_contributions FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.goals g
        JOIN public.partnerships p ON g.partnership_id = p.id
        WHERE g.id = goal_contributions.goal_id
        AND p.status = 'active'
        AND auth.uid() IN (p.user1_id, p.user2_id)
    )
    AND auth.uid() = user_id
);

-- Create indexes for better performance
CREATE INDEX idx_goal_contributions_goal_id ON public.goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_user_id ON public.goal_contributions(user_id);
CREATE INDEX idx_goal_contributions_created_at ON public.goal_contributions(created_at);
