-- Minimal Partnership Setup - Just the essentials
-- Run this in Supabase SQL Editor

-- Create partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create partnership invitations table
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

-- Enable RLS
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_invitations ENABLE ROW LEVEL SECURITY;

-- Create basic policies (without dropping existing ones)
DO $$
BEGIN
    -- Only create policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partnerships' AND policyname = 'partnerships_select_policy') THEN
        CREATE POLICY partnerships_select_policy ON partnerships FOR SELECT USING (auth.uid() IN (user1_id, user2_id));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partnerships' AND policyname = 'partnerships_insert_policy') THEN
        CREATE POLICY partnerships_insert_policy ON partnerships FOR INSERT WITH CHECK (auth.uid() = user1_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partnerships' AND policyname = 'partnerships_update_policy') THEN
        CREATE POLICY partnerships_update_policy ON partnerships FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partnership_invitations' AND policyname = 'invitations_select_policy') THEN
        CREATE POLICY invitations_select_policy ON partnership_invitations FOR SELECT USING (auth.uid() IN (from_user_id, to_user_id));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partnership_invitations' AND policyname = 'invitations_insert_policy') THEN
        CREATE POLICY invitations_insert_policy ON partnership_invitations FOR INSERT WITH CHECK (auth.uid() = from_user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'partnership_invitations' AND policyname = 'invitations_update_policy') THEN
        CREATE POLICY invitations_update_policy ON partnership_invitations FOR UPDATE USING (auth.uid() = to_user_id);
    END IF;
END $$;

-- Success message
SELECT 'Minimal partnership setup completed!' as status;
