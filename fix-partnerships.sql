-- Fix existing partnership tables and relationships
-- Run this in Supabase SQL Editor

-- First, let's check what exists
SELECT 'Checking existing tables...' as status;

-- Drop existing tables if they have issues
DROP TABLE IF EXISTS partnership_invitations CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;

-- Recreate partnerships table with proper foreign keys
CREATE TABLE partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Recreate partnership invitations table with proper foreign keys
CREATE TABLE partnership_invitations (
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

-- Enable RLS
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_invitations ENABLE ROW LEVEL SECURITY;

-- Create fresh policies with unique names
CREATE POLICY "partnerships_select_policy" ON partnerships 
    FOR SELECT USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "partnerships_insert_policy" ON partnerships 
    FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "partnerships_update_policy" ON partnerships 
    FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "invitations_select_policy" ON partnership_invitations 
    FOR SELECT USING (auth.uid() IN (from_user_id, to_user_id));

CREATE POLICY "invitations_insert_policy" ON partnership_invitations 
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "invitations_update_policy" ON partnership_invitations 
    FOR UPDATE USING (auth.uid() = to_user_id);

-- Create indexes for performance
CREATE INDEX idx_partnerships_user1_id ON partnerships(user1_id);
CREATE INDEX idx_partnerships_user2_id ON partnerships(user2_id);
CREATE INDEX idx_partnerships_status ON partnerships(status);
CREATE INDEX idx_partnership_invitations_to_user_id ON partnership_invitations(to_user_id);
CREATE INDEX idx_partnership_invitations_status ON partnership_invitations(status);

-- Success message
SELECT 'Partnership tables fixed and ready!' as status;
