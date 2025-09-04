-- =============================================
-- Fix Activity Feed RLS Policies
-- =============================================

-- Fix foreign key references in activity_reactions table
ALTER TABLE activity_reactions 
DROP CONSTRAINT IF EXISTS activity_reactions_user_id_fkey;

ALTER TABLE activity_reactions 
ADD CONSTRAINT activity_reactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Fix foreign key references in activity_comments table
ALTER TABLE activity_comments 
DROP CONSTRAINT IF EXISTS activity_comments_user_id_fkey;

ALTER TABLE activity_comments 
ADD CONSTRAINT activity_comments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- =============================================
-- Fix RLS Policies for INSERT operations
-- =============================================

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can manage their own views" ON activity_feed_views;
DROP POLICY IF EXISTS "Users can manage their own reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can manage their own comments" ON activity_comments;

-- Activity Feed Views - Allow users to insert their own views
CREATE POLICY "Users can insert their own views" ON activity_feed_views
    FOR INSERT WITH CHECK (viewer_user_id = auth.uid());

CREATE POLICY "Users can view their own views" ON activity_feed_views
    FOR SELECT USING (viewer_user_id = auth.uid());

CREATE POLICY "Users can update their own views" ON activity_feed_views
    FOR UPDATE USING (viewer_user_id = auth.uid());

CREATE POLICY "Users can delete their own views" ON activity_feed_views
    FOR DELETE USING (viewer_user_id = auth.uid());

-- Activity Reactions - Allow users to insert their own reactions
CREATE POLICY "Users can insert their own reactions" ON activity_reactions
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Only create the view policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_reactions' 
        AND policyname = 'Users can view partnership reactions'
    ) THEN
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
    END IF;
END $$;

CREATE POLICY "Users can update their own reactions" ON activity_reactions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own reactions" ON activity_reactions
    FOR DELETE USING (user_id = auth.uid());

-- Activity Comments - Allow users to insert their own comments
CREATE POLICY "Users can insert their own comments" ON activity_comments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Only create the view policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'activity_comments' 
        AND policyname = 'Users can view partnership comments'
    ) THEN
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
    END IF;
END $$;

CREATE POLICY "Users can update their own comments" ON activity_comments
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON activity_comments
    FOR DELETE USING (user_id = auth.uid());

-- =============================================
-- Grant necessary permissions
-- =============================================

-- Grant usage on sequences (for UUID generation)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant necessary table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_feed_views TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_comments TO authenticated;
GRANT SELECT ON activity_types TO authenticated;
GRANT SELECT ON partner_activities TO authenticated;
