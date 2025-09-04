-- Fix RLS policies for activity feed tables
-- The issue is that auth.uid() returns auth.users.id but our tables reference users.id
-- We need to check if the user exists in the users table with the same ID as auth.uid()

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can manage their own comments" ON activity_comments;

-- Recreate policies with proper user ID checking
-- For activity_reactions: Check that user_id exists in users table and matches auth.uid()
CREATE POLICY "Users can manage their own reactions" ON activity_reactions
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE id = auth.uid()
        )
    );

-- For activity_comments: Check that user_id exists in users table and matches auth.uid()
CREATE POLICY "Users can manage their own comments" ON activity_comments
    FOR ALL USING (
        user_id IN (
            SELECT id FROM users WHERE id = auth.uid()
        )
    );

-- Also fix the partner_activities policy to be consistent
DROP POLICY IF EXISTS "Users can create their own activities" ON partner_activities;
DROP POLICY IF EXISTS "Users can update their own activities" ON partner_activities;

-- Recreate with proper user ID checking
CREATE POLICY "Users can create their own activities" ON partner_activities
    FOR INSERT WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own activities" ON partner_activities
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE id = auth.uid()
        )
    );

-- Fix activity_feed_views policy as well
DROP POLICY IF EXISTS "Users can manage their own views" ON activity_feed_views;

CREATE POLICY "Users can manage their own views" ON activity_feed_views
    FOR ALL USING (
        viewer_user_id IN (
            SELECT id FROM users WHERE id = auth.uid()
        )
    );
