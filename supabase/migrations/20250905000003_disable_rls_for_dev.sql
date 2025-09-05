-- Temporarily disable RLS for development to fix activity feed issues
-- This is a development-only fix

-- Disable RLS on activity tables for development
ALTER TABLE activity_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON activity_reactions TO authenticated;
GRANT ALL ON activity_comments TO authenticated;

-- Also ensure the activity feed views table is accessible
ALTER TABLE activity_feed_views DISABLE ROW LEVEL SECURITY;
GRANT ALL ON activity_feed_views TO authenticated;

