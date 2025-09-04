-- Create shared notes table for collaboration feature
-- This table stores notes shared between partners in a partnership

CREATE TABLE shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partnership_id UUID NOT NULL REFERENCES partnerships(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_shared_notes_partnership_id ON shared_notes(partnership_id);
CREATE INDEX idx_shared_notes_author_id ON shared_notes(author_id);
CREATE INDEX idx_shared_notes_created_at ON shared_notes(created_at DESC);

-- Enable RLS
ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view notes from their active partnerships
CREATE POLICY "Users can view partnership notes" ON shared_notes
    FOR SELECT USING (
        partnership_id IN (
            SELECT id FROM partnerships 
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
            AND status = 'active'
        )
    );

-- Users can create notes in their active partnerships
CREATE POLICY "Users can create partnership notes" ON shared_notes
    FOR INSERT WITH CHECK (
        author_id = auth.uid() AND
        partnership_id IN (
            SELECT id FROM partnerships 
            WHERE (user1_id = auth.uid() OR user2_id = auth.uid())
            AND status = 'active'
        )
    );

-- Users can update their own notes
CREATE POLICY "Users can update their own notes" ON shared_notes
    FOR UPDATE USING (author_id = auth.uid());

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes" ON shared_notes
    FOR DELETE USING (author_id = auth.uid());

-- Updated at trigger
CREATE TRIGGER update_shared_notes_updated_at 
    BEFORE UPDATE ON shared_notes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
