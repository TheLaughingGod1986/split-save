-- Fix ambiguous user_id column reference in activity feed function
-- This fixes the "column reference user_id is ambiguous" error

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
        COALESCE(users.name, users.email) as user_name,
        users.avatar_url as user_avatar,
        at.display_name as type_display_name,
        at.icon as type_icon,
        at.color as type_color,
        COALESCE(reactions.count, 0)::INTEGER as reaction_count,
        COALESCE(comments.count, 0)::INTEGER as comment_count,
        CASE WHEN user_reactions.activity_id IS NOT NULL THEN TRUE ELSE FALSE END as user_has_reacted
    FROM partner_activities pa
    JOIN activity_types at ON pa.activity_type = at.name
    LEFT JOIN users ON pa.user_id = users.id
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
        WHERE activity_reactions.user_id = p_user_id
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
