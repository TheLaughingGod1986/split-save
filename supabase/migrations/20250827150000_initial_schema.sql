-- Initial clean schema for SplitSave
-- This migration creates all tables with proper foreign key relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Create user profiles table
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    country_code VARCHAR(3),
    currency VARCHAR(3) DEFAULT 'USD',
    income DECIMAL(10,2),
    payday VARCHAR(50),
    personal_allowance DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create partnerships table
CREATE TABLE public.partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create partnership invitations table
CREATE TABLE public.partnership_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(from_user_id, to_user_id)
);

-- Create expenses table
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE,
    added_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    date DATE NOT NULL,
    split_type VARCHAR(20) DEFAULT 'equal' CHECK (split_type IN ('equal', 'proportional', 'custom')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE,
    added_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(10,2) NOT NULL,
    current_amount DECIMAL(10,2) DEFAULT 0,
    target_date DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create approval requests table
CREATE TABLE public.approval_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE,
    requested_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expense_id UUID REFERENCES public.expenses(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('expense', 'goal')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partnership_id UUID REFERENCES public.partnerships(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnership_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "users_select_policy" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_policy" ON public.users FOR UPDATE USING (auth.uid() = id);

-- User profiles can only be accessed by the owner
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_profiles_update_policy" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Partnerships can be accessed by both users
CREATE POLICY "partnerships_select_policy" ON public.partnerships FOR SELECT USING (auth.uid() IN (user1_id, user2_id));
CREATE POLICY "partnerships_insert_policy" ON public.partnerships FOR INSERT WITH CHECK (auth.uid() = user1_id);
CREATE POLICY "partnerships_update_policy" ON public.partnerships FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));

-- Partnership invitations can be accessed by sender and recipient
CREATE POLICY "invitations_select_policy" ON public.partnership_invitations FOR SELECT USING (auth.uid() IN (from_user_id, to_user_id));
CREATE POLICY "invitations_insert_policy" ON public.partnership_invitations FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "invitations_update_policy" ON public.partnership_invitations FOR UPDATE USING (auth.uid() = to_user_id);

-- Expenses can be accessed by partnership members
CREATE POLICY "expenses_select_policy" ON public.expenses FOR SELECT USING (
    partnership_id IS NULL OR 
    EXISTS (
        SELECT 1 FROM public.partnerships 
        WHERE id = expenses.partnership_id 
        AND auth.uid() IN (user1_id, user2_id)
        AND status = 'active'
    )
);
CREATE POLICY "expenses_insert_policy" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = added_by_user_id);
CREATE POLICY "expenses_update_policy" ON public.expenses FOR UPDATE USING (auth.uid() = added_by_user_id);

-- Goals can be accessed by partnership members
CREATE POLICY "goals_select_policy" ON public.goals FOR SELECT USING (
    partnership_id IS NULL OR 
    EXISTS (
        SELECT 1 FROM public.partnerships 
        WHERE id = goals.partnership_id 
        AND auth.uid() IN (user1_id, user2_id)
        AND status = 'active'
    )
);
CREATE POLICY "goals_insert_policy" ON public.goals FOR INSERT WITH CHECK (auth.uid() = added_by_user_id);
CREATE POLICY "goals_update_policy" ON public.goals FOR UPDATE USING (auth.uid() = added_by_user_id);

-- Approval requests can be accessed by partnership members
CREATE POLICY "approvals_select_policy" ON public.approval_requests FOR SELECT USING (
    partnership_id IS NULL OR 
    EXISTS (
        SELECT 1 FROM public.partnerships 
        WHERE id = approval_requests.partnership_id 
        AND auth.uid() IN (user1_id, user2_id)
        AND status = 'active'
    )
);
CREATE POLICY "approvals_insert_policy" ON public.approval_requests FOR INSERT WITH CHECK (auth.uid() = requested_by_user_id);
CREATE POLICY "approvals_update_policy" ON public.approval_requests FOR UPDATE USING (
    auth.uid() = requested_by_user_id OR
    EXISTS (
        SELECT 1 FROM public.partnerships 
        WHERE id = approval_requests.partnership_id 
        AND auth.uid() IN (user1_id, user2_id)
        AND status = 'active'
    )
);

-- Messages can be accessed by partnership members
CREATE POLICY "messages_select_policy" ON public.messages FOR SELECT USING (
    partnership_id IS NULL OR 
    EXISTS (
        SELECT 1 FROM public.partnerships 
        WHERE id = messages.partnership_id 
        AND auth.uid() IN (user1_id, user2_id)
        AND status = 'active'
    )
);
CREATE POLICY "messages_insert_policy" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_user_id);

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_partnerships_user1_id ON public.partnerships(user1_id);
CREATE INDEX idx_partnerships_user2_id ON public.partnerships(user2_id);
CREATE INDEX idx_partnerships_status ON public.partnerships(status);
CREATE INDEX idx_partnership_invitations_to_user_id ON public.partnership_invitations(to_user_id);
CREATE INDEX idx_partnership_invitations_status ON public.partnership_invitations(status);
CREATE INDEX idx_expenses_partnership_id ON public.expenses(partnership_id);
CREATE INDEX idx_expenses_added_by ON public.expenses(added_by_user_id);
CREATE INDEX idx_goals_partnership_id ON public.goals(partnership_id);
CREATE INDEX idx_goals_added_by ON public.goals(added_by_user_id);
CREATE INDEX idx_approval_requests_partnership_id ON public.approval_requests(partnership_id);
CREATE INDEX idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX idx_messages_partnership_id ON public.messages(partnership_id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table (bypass RLS for this function)
    INSERT INTO public.users (id, name, email)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        NEW.email
    );
    
    -- Insert into user_profiles table (bypass RLS for this function)
    INSERT INTO public.user_profiles (user_id, country_code, currency)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'country_code', 'US'),
        'USD'
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
