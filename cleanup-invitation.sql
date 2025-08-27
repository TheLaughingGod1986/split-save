-- Clean up existing invitation for benoats86@gmail.com
-- Run this in Supabase SQL Editor

-- Remove the existing invitation
DELETE FROM partnership_invitations 
WHERE to_email = 'benoats86@gmail.com' 
   OR to_user_id IN (
     SELECT id FROM users WHERE email = 'benoats86@gmail.com'
   );

-- Remove any user records for benoats86@gmail.com (if they exist)
DELETE FROM user_profiles 
WHERE user_id IN (
  SELECT id FROM users WHERE email = 'benoats86@gmail.com'
);

DELETE FROM users 
WHERE email = 'benoats86@gmail.com';

-- Remove any partnerships involving benoats86@gmail.com (if they exist)
DELETE FROM partnerships 
WHERE user1_id IN (
  SELECT id FROM users WHERE email = 'benoats86@gmail.com'
) OR user2_id IN (
  SELECT id FROM users WHERE email = 'benoats86@gmail.com'
);

-- Check what's left
SELECT 'partnership_invitations' as table_name, COUNT(*) as count FROM partnership_invitations
UNION ALL
SELECT 'partnerships' as table_name, COUNT(*) as count FROM partnerships
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles;
