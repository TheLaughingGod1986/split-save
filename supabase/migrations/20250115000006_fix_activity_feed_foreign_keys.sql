-- Fix foreign key constraints in activity feed tables
-- The original migration referenced auth.users instead of users table

-- Drop existing tables (they will be recreated with correct foreign keys)
DROP TABLE IF EXISTS activity_comments CASCADE;
DROP TABLE IF EXISTS activity_reactions CASCADE;

-- Recreate Activity Reactions table with correct foreign key
CREATE TABLE activity_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES partner_activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- 'like', 'cheer', 'celebrate', 'support'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id, reaction_type)
);

-- Recreate Activity Comments table with correct foreign key
CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES partner_activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate indexes
CREATE INDEX idx_activity_reactions_activity ON activity_reactions(activity_id);
CREATE INDEX idx_activity_reactions_user ON activity_reactions(user_id);

CREATE INDEX idx_activity_comments_activity ON activity_comments(activity_id);
CREATE INDEX idx_activity_comments_user ON activity_comments(user_id);

-- Enable RLS
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- Recreate RLS Policies
-- Activity Reactions
CREATE POLICY "Users can view partnership reactions" ON activity_reactions
    FOR SELECT USING (
        activity_id IN (
            SELECT id FROM partner_activities 
            WHERE partnership_id IN (
                SELECT id FROM partnerships 
                WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
                AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can manage their own reactions" ON activity_reactions
    FOR ALL USING (user_id = auth.uid());

-- Activity Comments
CREATE POLICY "Users can view partnership comments" ON activity_comments
    FOR SELECT USING (
        activity_id IN (
            SELECT id FROM partner_activities 
            WHERE partnership_id IN (
                SELECT id FROM partnerships 
                WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
                AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can manage their own comments" ON activity_comments
    FOR ALL USING (user_id = auth.uid());

-- Updated at trigger for comments
CREATE TRIGGER update_activity_comments_updated_at 
    BEFORE UPDATE ON activity_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
