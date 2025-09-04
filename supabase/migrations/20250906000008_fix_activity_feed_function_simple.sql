-- Create a simplified activity feed function that should work reliably
-- This version avoids complex joins that might be causing RLS issues

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
        COALESCE(u.name, u.email, 'Unknown User')::VARCHAR(255) as user_name,
        u.avatar_url::VARCHAR(500) as user_avatar,
        COALESCE(at.display_name, pa.activity_type)::VARCHAR(100) as type_display_name,
        COALESCE(at.icon, '📝')::VARCHAR(20) as type_icon,
        COALESCE(at.color, 'blue')::VARCHAR(20) as type_color,
        COALESCE(ar.reaction_count, 0)::INTEGER as reaction_count,
        COALESCE(ac.comment_count, 0)::INTEGER as comment_count,
        CASE WHEN ur.activity_id IS NOT NULL THEN TRUE ELSE FALSE END as user_has_reacted
    FROM partner_activities pa
    LEFT JOIN activity_types at ON pa.activity_type = at.name
    LEFT JOIN users u ON pa.user_id = u.id
    LEFT JOIN (
        SELECT activity_id, COUNT(*) as reaction_count 
        FROM activity_reactions 
        GROUP BY activity_id
    ) ar ON pa.id = ar.activity_id
    LEFT JOIN (
        SELECT activity_id, COUNT(*) as comment_count 
        FROM activity_comments 
        GROUP BY activity_id
    ) ac ON pa.id = ac.activity_id
    LEFT JOIN (
        SELECT DISTINCT activity_id 
        FROM activity_reactions 
        WHERE user_id = p_user_id
    ) ur ON pa.id = ur.activity_id
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

-- Also create a fallback function that returns mock data if the main function fails
CREATE OR REPLACE FUNCTION get_partnership_activity_feed_fallback(
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
    -- Return mock data for development/testing
    RETURN QUERY
    SELECT 
        gen_random_uuid() as id,
        p_user_id as user_id,
        gen_random_uuid() as partnership_id,
        'expense_added'::VARCHAR(50) as activity_type,
        'Added shared expense: Groceries'::VARCHAR(200) as title,
        'Weekly grocery shopping at Tesco'::TEXT as description,
        '{}'::JSONB as metadata,
        85.50::DECIMAL(10,2) as amount,
        'GBP'::VARCHAR(3) as currency,
        'expense'::VARCHAR(20) as entity_type,
        gen_random_uuid() as entity_id,
        'partners'::VARCHAR(20) as visibility,
        false as is_milestone,
        NOW() - INTERVAL '4 hours' as created_at,
        'Ben'::VARCHAR(255) as user_name,
        null::VARCHAR(500) as user_avatar,
        'Added an Expense'::VARCHAR(100) as type_display_name,
        '💳'::VARCHAR(20) as type_icon,
        'blue'::VARCHAR(20) as type_color,
        0::INTEGER as reaction_count,
        0::INTEGER as comment_count,
        false as user_has_reacted
    WHERE p_limit > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
