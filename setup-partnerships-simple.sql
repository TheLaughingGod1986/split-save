-- Simple Partnership Setup - Run this step by step
-- Copy and paste each section separately in Supabase SQL Editor

-- STEP 1: Create the partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'ended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- STEP 2: Create the partnership_invitations table
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

-- STEP 3: Add partnership_id to existing tables
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;
ALTER TABLE goals ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES goals(id) ON DELETE CASCADE;
ALTER TABLE approval_requests ADD COLUMN IF NOT EXISTS partnership_id UUID REFERENCES partnerships(id) ON DELETE CASCADE;

-- STEP 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_partnerships_user1_id ON partnerships(user1_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_user2_id ON partnerships(user2_id);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_to_user_id ON partnership_invitations(to_user_id);
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_status ON partnership_invitations(status);
CREATE INDEX IF NOT EXISTS idx_expenses_partnership_id ON expenses(partnership_id);
CREATE INDEX IF NOT EXISTS idx_goals_partnership_id ON goals(partnership_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_partnership_id ON approval_requests(partnership_id);

-- STEP 5: Enable RLS
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_invitations ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create policies for partnerships table
CREATE POLICY "Users can view their own partnerships" ON partnerships
    FOR SELECT USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "Users can create partnerships" ON partnerships
    FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update their own partnerships" ON partnerships
    FOR UPDATE USING (auth.uid() IN (user1_id, user2_id));

-- STEP 7: Create policies for partnership_invitations table
CREATE POLICY "Users can view invitations sent to them" ON partnership_invitations
    FOR SELECT USING (auth.uid() = to_user_id);

CREATE POLICY "Users can view invitations they sent" ON partnership_invitations
    FOR SELECT USING (auth.uid() = from_user_id);

CREATE POLICY "Users can create invitations" ON partnership_invitations
    FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update invitations sent to them" ON partnership_invitations
    FOR UPDATE USING (auth.uid() = to_user_id);

-- STEP 8: Verify tables were created
SELECT 'Partnership tables created successfully!' as status;
