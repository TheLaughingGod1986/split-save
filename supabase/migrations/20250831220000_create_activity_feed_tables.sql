-- =============================================
-- Partner Activity Feed System
-- =============================================

-- Activity Types Table
CREATE TABLE activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(20) NOT NULL,
    color VARCHAR(20) NOT NULL,
    category VARCHAR(30) NOT NULL,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partner Activities Table
CREATE TABLE partner_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL REFERENCES activity_types(name),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'GBP',
    entity_type VARCHAR(20), -- 'expense', 'goal', 'contribution', 'achievement', etc.
    entity_id UUID,
    visibility VARCHAR(20) DEFAULT 'partners', -- 'partners', 'private', 'achievements_only'
    is_milestone BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Feed Views (for optimized reads)
CREATE TABLE activity_feed_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    viewer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES partner_activities(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(viewer_user_id, activity_id)
);

-- Activity Reactions (likes, cheers, etc.)
CREATE TABLE activity_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES partner_activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL, -- 'like', 'cheer', 'celebrate', 'support'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(activity_id, user_id, reaction_type)
);

-- Activity Comments
CREATE TABLE activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES partner_activities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes for Performance
-- =============================================

CREATE INDEX idx_partner_activities_partnership_id ON partner_activities(partnership_id);
CREATE INDEX idx_partner_activities_user_id ON partner_activities(user_id);
CREATE INDEX idx_partner_activities_created_at ON partner_activities(created_at DESC);
CREATE INDEX idx_partner_activities_type ON partner_activities(activity_type);
CREATE INDEX idx_partner_activities_visibility ON partner_activities(visibility);
CREATE INDEX idx_partner_activities_entity ON partner_activities(entity_type, entity_id);

CREATE INDEX idx_activity_feed_views_viewer ON activity_feed_views(viewer_user_id);
CREATE INDEX idx_activity_feed_views_activity ON activity_feed_views(activity_id);

CREATE INDEX idx_activity_reactions_activity ON activity_reactions(activity_id);
CREATE INDEX idx_activity_reactions_user ON activity_reactions(user_id);

CREATE INDEX idx_activity_comments_activity ON activity_comments(activity_id);
CREATE INDEX idx_activity_comments_user ON activity_comments(user_id);

-- =============================================
-- RLS Policies
-- =============================================

-- Enable RLS
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- Activity Types (public read)
CREATE POLICY "Anyone can read activity types" ON activity_types
    FOR SELECT USING (true);

-- Partner Activities (only partnership members can see)
CREATE POLICY "Users can view partnership activities" ON partner_activities
    FOR SELECT USING (
        user_id = auth.uid() OR 
        partnership_id IN (
            SELECT id FROM partnerships 
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
            AND status = 'active'
        )
    );

CREATE POLICY "Users can create their own activities" ON partner_activities
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own activities" ON partner_activities
    FOR UPDATE USING (user_id = auth.uid());

-- Activity Feed Views
CREATE POLICY "Users can manage their own views" ON activity_feed_views
    FOR ALL USING (viewer_user_id = auth.uid());

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

-- =============================================
-- Updated At Triggers
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_partner_activities_updated_at 
    BEFORE UPDATE ON partner_activities 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_comments_updated_at 
    BEFORE UPDATE ON activity_comments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Seed Activity Types
-- =============================================

INSERT INTO activity_types (name, display_name, icon, color, category, priority) VALUES
-- Financial Activities
('expense_added', 'Added an Expense', '💳', 'blue', 'financial', 5),
('expense_approved', 'Approved an Expense', '✅', 'green', 'financial', 3),
('goal_created', 'Created a New Goal', '🎯', 'purple', 'financial', 7),
('goal_updated', 'Updated a Goal', '📝', 'orange', 'financial', 2),
('goal_contribution', 'Made a Contribution', '💰', 'green', 'financial', 6),
('goal_completed', 'Completed a Goal', '🏆', 'gold', 'financial', 10),
('safety_pot_contribution', 'Added to Safety Pot', '🛡️', 'blue', 'financial', 4),

-- Achievement Activities
('achievement_unlocked', 'Unlocked an Achievement', '🏅', 'gold', 'achievements', 8),
('streak_milestone', 'Reached Streak Milestone', '🔥', 'orange', 'achievements', 7),
('level_up', 'Leveled Up', '⭐', 'purple', 'achievements', 9),

-- Social Activities
('partnership_joined', 'Joined Partnership', '🤝', 'green', 'social', 8),
('profile_updated', 'Updated Profile', '👤', 'gray', 'social', 1),

-- System Activities
('monthly_progress', 'Completed Monthly Review', '📊', 'blue', 'system', 3),
('budget_exceeded', 'Budget Alert', '⚠️', 'red', 'system', 6),
('savings_milestone', 'Savings Milestone Reached', '💎', 'green', 'system', 7);

-- =============================================
-- Functions for Activity Logging
-- =============================================

-- Function to log an activity
CREATE OR REPLACE FUNCTION log_partner_activity(
    p_user_id UUID,
    p_partnership_id UUID,
    p_activity_type VARCHAR(50),
    p_title VARCHAR(200),
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_amount DECIMAL(10,2) DEFAULT NULL,
    p_currency VARCHAR(3) DEFAULT 'GBP',
    p_entity_type VARCHAR(20) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_visibility VARCHAR(20) DEFAULT 'partners',
    p_is_milestone BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO partner_activities (
        user_id, partnership_id, activity_type, title, description,
        metadata, amount, currency, entity_type, entity_id,
        visibility, is_milestone
    ) VALUES (
        p_user_id, p_partnership_id, p_activity_type, p_title, p_description,
        p_metadata, p_amount, p_currency, p_entity_type, p_entity_id,
        p_visibility, p_is_milestone
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get partnership activity feed
CREATE OR REPLACE FUNCTION get_partnership_activity_feed(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    partnership_id UUID,
    activity_type VARCHAR(50),
    title VARCHAR(200),
    description TEXT,
    metadata JSONB,
    amount DECIMAL(10,2),
    currency VARCHAR(3),
    entity_type VARCHAR(20),
    entity_id UUID,
    visibility VARCHAR(20),
    is_milestone BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    user_name VARCHAR(255),
    user_avatar VARCHAR(500),
    type_display_name VARCHAR(100),
    type_icon VARCHAR(20),
    type_color VARCHAR(20),
    reaction_count INTEGER,
    comment_count INTEGER,
    user_has_reacted BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pa.id,
        pa.user_id,
        pa.partnership_id,
        pa.activity_type,
        pa.title,
        pa.description,
        pa.metadata,
        pa.amount,
        pa.currency,
        pa.entity_type,
        pa.entity_id,
        pa.visibility,
        pa.is_milestone,
        pa.created_at,
        COALESCE(profiles.display_name, profiles.email) as user_name,
        profiles.avatar_url as user_avatar,
        at.display_name as type_display_name,
        at.icon as type_icon,
        at.color as type_color,
        COALESCE(reactions.count, 0)::INTEGER as reaction_count,
        COALESCE(comments.count, 0)::INTEGER as comment_count,
        CASE WHEN user_reactions.activity_id IS NOT NULL THEN TRUE ELSE FALSE END as user_has_reacted
    FROM partner_activities pa
    JOIN activity_types at ON pa.activity_type = at.name
    LEFT JOIN profiles ON pa.user_id = profiles.user_id
    LEFT JOIN (
        SELECT activity_id, COUNT(*) as count 
        FROM activity_reactions 
        GROUP BY activity_id
    ) reactions ON pa.id = reactions.activity_id
    LEFT JOIN (
        SELECT activity_id, COUNT(*) as count 
        FROM activity_comments 
        GROUP BY activity_id
    ) comments ON pa.id = comments.activity_id
    LEFT JOIN (
        SELECT DISTINCT activity_id 
        FROM activity_reactions 
        WHERE user_id = p_user_id
    ) user_reactions ON pa.id = user_reactions.activity_id
    WHERE pa.partnership_id IN (
        SELECT p.id FROM partnerships p 
        WHERE (p.user1_id = p_user_id OR p.user2_id = p_user_id)
        AND p.status = 'active'
    )
    AND pa.visibility != 'private'
    ORDER BY pa.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
