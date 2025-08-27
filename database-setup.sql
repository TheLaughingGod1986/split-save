-- SplitSave Database Setup Script
-- Run this in your Supabase SQL Editor

-- Step 1: Create the users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  country_code TEXT NOT NULL DEFAULT 'US',
  currency TEXT NOT NULL DEFAULT 'USD',
  income NUMERIC(12,2),
  payday TEXT,
  personal_allowance NUMERIC(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Create partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create partnership invitations table
CREATE TABLE IF NOT EXISTS partnership_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(from_user_id, to_user_id)
);

-- Step 3: Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  added_by UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create goals table  
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount NUMERIC(12,2) NOT NULL,
  saved_amount NUMERIC(12,2) DEFAULT 0,
  goal_type TEXT NOT NULL,
  priority INTEGER DEFAULT 1,
  added_by UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create approval_requests table
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES public.users(id) NOT NULL,
  request_type TEXT NOT NULL,
  request_data JSONB NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  responded_by UUID REFERENCES public.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 6: Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  message_text TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  read_by_recipient BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Partnership members can see partnership data
CREATE POLICY "Partnership members can view partnerships" ON public.partnerships 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create partnerships" ON public.partnerships 
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Partnership members can update partnerships" ON public.partnerships 
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Expenses are visible to partnership members
CREATE POLICY "Partnership members can view expenses" ON public.expenses 
  FOR SELECT USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Partnership members can create expenses" ON public.expenses 
  FOR INSERT WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Partnership members can update expenses" ON public.expenses 
  FOR UPDATE USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Goals are visible to partnership members
CREATE POLICY "Partnership members can view goals" ON public.goals 
  FOR SELECT USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Partnership members can create goals" ON public.goals 
  FOR INSERT WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Partnership members can update goals" ON public.goals 
  FOR UPDATE USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Approval requests are visible to partnership members
CREATE POLICY "Partnership members can view approval requests" ON public.approval_requests 
  FOR SELECT USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Partnership members can create approval requests" ON public.approval_requests 
  FOR INSERT WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Partnership members can update approval requests" ON public.approval_requests 
  FOR UPDATE USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Messages are visible to partnership members
CREATE POLICY "Partnership members can view messages" ON public.messages 
  FOR SELECT USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Partnership members can create messages" ON public.messages 
  FOR INSERT WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Step 9: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partnerships_users ON public.partnerships(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_expenses_partnership ON public.expenses(partnership_id);
CREATE INDEX IF NOT EXISTS idx_goals_partnership ON public.goals(partnership_id);
CREATE INDEX IF NOT EXISTS idx_approvals_partnership ON public.approval_requests(partnership_id);
CREATE INDEX IF NOT EXISTS idx_messages_partnership ON public.messages(partnership_id);

-- Step 10: Create a function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, country_code, currency)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'country_code', 'US'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'USD')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Create trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 12: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 13: Set up future permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated;

-- Add partnership_id to existing tables
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_partnerships_user1_id ON partnerships(user1_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_user2_id ON partnerships(user2_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_to_user_id ON partnership_invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_status ON partnership_invitations(status);
CREATE INDEX IF NOT EXISTS idx_expenses_partnership_id ON expenses(partnership_id);
CREATE INDEX IF NOT EXISTS idx_goals_partnership_id ON goals(partnership_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_partnership_id ON approval_requests(partnership_id);

-- Enable Row Level Security (RLS)
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partnerships
CREATE POLICY IF NOT EXISTS "Users can view their own partnerships" ON partnerships
    FOR SELECT USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY IF NOT EXISTS "Users can create partnerships" ON partnerships
    FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY IF NOT EXISTS "Users can update their own partnerships" ON partnerships
    FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));

-- RLS Policies for partnership_invitations
CREATE POLICY IF NOT EXISTS "Users can view invitations sent to them" ON partnership_invitations
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY IF NOT EXISTS "Users can view invitations they sent" ON partnership_invitations
    FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY IF NOT EXISTS "Users can create invitations" ON partnership_invitations
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY IF NOT EXISTS "Users can update invitations sent to them" ON partnership_invitations
    FOR UPDATE USING (auth.uid() = to_user_id);

-- Update existing RLS policies to include partnership_id
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
CREATE POLICY "Users can view expenses in their partnerships" ON expenses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user1_id FROM partnerships WHERE id = partnership_id AND status = 'active'
            UNION
            SELECT user2_id FROM partnerships WHERE id = partnership_id AND status = 'active'
        )
    );

DROP POLICY IF EXISTS "Users can view their own goals" ON goals;
CREATE POLICY "Users can view goals in their partnerships" ON goals
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user1_id FROM partnerships WHERE id = partnership_id AND status = 'active'
            UNION
            SELECT user2_id FROM partnerships WHERE id = partnership_id AND status = 'active'
        )
    );

-- Add function to get user's active partnership
CREATE OR REPLACE FUNCTION get_user_partnership(user_uuid UUID)
RETURNS UUID AS $$
BEGIN
    RETURN (
        SELECT id FROM partnerships 
        WHERE (user1_id = user_uuid OR user2_id = user_uuid) 
        AND status = 'active' 
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
SELECT 'SplitSave database setup completed successfully!' as status;
