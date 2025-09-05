-- =============================================
-- Enhance Activity Feed with Advanced Features
-- =============================================

-- Add parent_comment_id to activity_comments for nested replies
ALTER TABLE activity_comments 
ADD COLUMN parent_comment_id UUID REFERENCES activity_comments(id) ON DELETE CASCADE;

-- Add is_edited field to track edited comments
ALTER TABLE activity_comments 
ADD COLUMN is_edited BOOLEAN DEFAULT FALSE;

-- Add index for parent_comment_id for better performance
CREATE INDEX idx_activity_comments_parent ON activity_comments(parent_comment_id);

-- =============================================
-- Enhanced Functions
-- =============================================

-- Function to get reaction details with user information
CREATE OR REPLACE FUNCTION get_activity_reaction_details(
    p_activity_id UUID
)
RETURNS TABLE (
    reaction_type VARCHAR(20),
    user_id UUID,
    user_name VARCHAR(255),
    user_avatar VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ar.reaction_type,
        ar.user_id,
        COALESCE(u.name, u.email) as user_name,
        u.avatar_url as user_avatar,
        ar.created_at
    FROM activity_reactions ar
    LEFT JOIN users u ON ar.user_id = u.id
    WHERE ar.activity_id = p_activity_id
    ORDER BY ar.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to get comments with nested replies
CREATE OR REPLACE FUNCTION get_activity_comments_with_replies(
    p_activity_id UUID
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    comment TEXT,
    is_edited BOOLEAN,
    parent_comment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_name VARCHAR(255),
    user_avatar VARCHAR(500),
    reply_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.user_id,
        ac.comment,
        ac.is_edited,
        ac.parent_comment_id,
        ac.created_at,
        ac.updated_at,
        COALESCE(u.name, u.email) as user_name,
        u.avatar_url as user_avatar,
        COALESCE(replies.count, 0)::INTEGER as reply_count
    FROM activity_comments ac
    LEFT JOIN users u ON ac.user_id = u.id
    LEFT JOIN (
        SELECT parent_comment_id, COUNT(*) as count 
        FROM activity_comments 
        WHERE parent_comment_id IS NOT NULL
        GROUP BY parent_comment_id
    ) replies ON ac.id = replies.parent_comment_id
    WHERE ac.activity_id = p_activity_id
    AND ac.parent_comment_id IS NULL  -- Only return top-level comments
    ORDER BY ac.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get replies for a specific comment
CREATE OR REPLACE FUNCTION get_comment_replies(
    p_comment_id UUID
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    comment TEXT,
    is_edited BOOLEAN,
    parent_comment_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_name VARCHAR(255),
    user_avatar VARCHAR(500)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.user_id,
        ac.comment,
        ac.is_edited,
        ac.parent_comment_id,
        ac.created_at,
        ac.updated_at,
        COALESCE(u.name, u.email) as user_name,
        u.avatar_url as user_avatar
    FROM activity_comments ac
    LEFT JOIN users u ON ac.user_id = u.id
    WHERE ac.parent_comment_id = p_comment_id
    ORDER BY ac.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a comment (for editing)
CREATE OR REPLACE FUNCTION update_activity_comment(
    p_comment_id UUID,
    p_user_id UUID,
    p_new_comment TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    comment_exists BOOLEAN;
BEGIN
    -- Check if the comment exists and belongs to the user
    SELECT EXISTS(
        SELECT 1 FROM activity_comments 
        WHERE id = p_comment_id AND user_id = p_user_id
    ) INTO comment_exists;
    
    IF NOT comment_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Update the comment
    UPDATE activity_comments 
    SET 
        comment = p_new_comment,
        is_edited = TRUE,
        updated_at = NOW()
    WHERE id = p_comment_id AND user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete a comment (and all its replies)
CREATE OR REPLACE FUNCTION delete_activity_comment(
    p_comment_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    comment_exists BOOLEAN;
BEGIN
    -- Check if the comment exists and belongs to the user
    SELECT EXISTS(
        SELECT 1 FROM activity_comments 
        WHERE id = p_comment_id AND user_id = p_user_id
    ) INTO comment_exists;
    
    IF NOT comment_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Delete the comment (this will cascade to replies due to foreign key)
    DELETE FROM activity_comments 
    WHERE id = p_comment_id AND user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Update RLS Policies for New Features
-- =============================================

-- Update activity_comments policy to allow viewing nested comments
DROP POLICY IF EXISTS "Users can view partnership comments" ON activity_comments;

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

-- =============================================
-- Grant Permissions
-- =============================================

-- Grant execute permissions on new functions
GRANT EXECUTE ON FUNCTION get_activity_reaction_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_activity_comments_with_replies(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_comment_replies(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_activity_comment(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_activity_comment(UUID, UUID) TO authenticated;

