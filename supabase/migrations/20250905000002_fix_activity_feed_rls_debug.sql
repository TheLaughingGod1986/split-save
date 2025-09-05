-- Fix RLS policies for activity feed tables with better debugging
-- This migration makes the policies more permissive and adds debugging

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can manage their own comments" ON activity_comments;
DROP POLICY IF EXISTS "Users can view partnership reactions" ON activity_reactions;
DROP POLICY IF EXISTS "Users can view partnership comments" ON activity_comments;

-- Create more permissive policies for development
-- Allow authenticated users to insert reactions
CREATE POLICY "Authenticated users can insert reactions" ON activity_reactions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id = auth.uid()
    );

-- Allow authenticated users to view reactions for their partnerships
CREATE POLICY "Users can view partnership reactions" ON activity_reactions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            activity_id IN (
                SELECT pa.id FROM partner_activities pa
                JOIN partnerships p ON pa.partnership_id = p.id
                WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
            )
        )
    );

-- Allow authenticated users to update/delete their own reactions
CREATE POLICY "Users can manage their own reactions" ON activity_reactions
    FOR ALL USING (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

-- Allow authenticated users to insert comments
CREATE POLICY "Authenticated users can insert comments" ON activity_comments
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND
        user_id = auth.uid()
    );

-- Allow authenticated users to view comments for their partnerships
CREATE POLICY "Users can view partnership comments" ON activity_comments
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            activity_id IN (
                SELECT pa.id FROM partner_activities pa
                JOIN partnerships p ON pa.partnership_id = p.id
                WHERE p.user1_id = auth.uid() OR p.user2_id = auth.uid()
            )
        )
    );

-- Allow authenticated users to update/delete their own comments
CREATE POLICY "Users can manage their own comments" ON activity_comments
    FOR ALL USING (
        auth.uid() IS NOT NULL AND user_id = auth.uid()
    );

-- Ensure tables have RLS enabled
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_reactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_comments TO authenticated;

