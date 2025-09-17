-- Temporarily disable RLS for activity feed tables to allow supabaseAdmin to work
-- This is a temporary fix while we resolve the authentication context issues

-- Disable RLS for activity feed tables
ALTER TABLE activity_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE partner_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed_views DISABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to authenticated users
GRANT ALL ON activity_reactions TO authenticated;
GRANT ALL ON activity_comments TO authenticated;
GRANT ALL ON partner_activities TO authenticated;
GRANT ALL ON activity_feed_views TO authenticated;



