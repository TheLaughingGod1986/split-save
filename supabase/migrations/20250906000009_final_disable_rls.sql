-- Final migration to disable RLS for development
-- This runs after all other migrations to ensure RLS is disabled

-- Disable RLS on activity tables for development
ALTER TABLE activity_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed_views DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users
GRANT ALL ON activity_reactions TO authenticated;
GRANT ALL ON activity_comments TO authenticated;
GRANT ALL ON activity_feed_views TO authenticated;

-- Also ensure partner_activities is accessible for development
ALTER TABLE partner_activities DISABLE ROW LEVEL SECURITY;
GRANT ALL ON partner_activities TO authenticated;

