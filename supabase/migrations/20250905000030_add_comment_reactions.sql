-- Add comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL REFERENCES activity_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(20) NOT NULL DEFAULT 'like',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one reaction per user per comment
    UNIQUE(comment_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_comment_reactions_comment_id ON comment_reactions(comment_id);
CREATE INDEX idx_comment_reactions_user_id ON comment_reactions(user_id);
CREATE INDEX idx_comment_reactions_type ON comment_reactions(reaction_type);

-- Disable RLS for comment reactions (temporary fix)
ALTER TABLE comment_reactions DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON comment_reactions TO authenticated;

-- Add updated_at trigger
CREATE TRIGGER update_comment_reactions_updated_at 
    BEFORE UPDATE ON comment_reactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

