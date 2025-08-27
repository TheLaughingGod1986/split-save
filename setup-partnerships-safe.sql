-- Partnership System Database Setup (Safe Version)
-- Run this in your Supabase SQL Editor
-- This script safely handles existing policies and tables

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can create partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can update their own partnerships" ON partnerships;
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON partnership_invitations;
DROP POLICY IF EXISTS "Users can view invitations they sent" ON partnership_invitations;
DROP POLICY IF EXISTS "Users can create invitations" ON partnership_invitations;
DROP POLICY IF EXISTS "Users can update invitations sent to them" ON partnership_invitations;

-- Create partnerships table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create partnership invitations table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS partnership_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(from_user_id, to_user_id)
);

-- Add partnership_id to existing tables (if they don't have it)
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;

-- Create indexes for performance (if they don't exist)
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

-- Create RLS Policies (fresh, no conflicts)
CREATE POLICY "Users can view their own partnerships" ON partnerships
    FOR SELECT USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can create partnerships" ON partnerships
    FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their own partnerships" ON partnerships
    FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can view invitations sent to them" ON partnership_invitations
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can view invitations they sent" ON partnership_invitations
    FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Users can create invitations" ON partnership_invitations
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update invitations sent to them" ON partnership_invitations
    FOR UPDATE USING (auth.uid() = to_user_id);

-- Success message
SELECT 'Partnership tables and policies created successfully!' as status;
