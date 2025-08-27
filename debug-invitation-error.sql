-- Debug invitation update error
-- Run this in Supabase SQL Editor

-- Check the current invitation
SELECT 
  id,
  from_user_id,
  to_user_id,
  to_email,
  status,
  created_at,
  updated_at,
  expires_at
FROM partnership_invitations 
WHERE to_email = 'benoats86@gmail.com'
ORDER BY created_at DESC;

-- Check if the invitation exists and its status
SELECT 
  'Invitation exists' as check_type,
  COUNT(*) as count,
  status
FROM partnership_invitations 
WHERE to_email = 'benoats86@gmail.com'
GROUP BY status;

-- Check if the from_user_id exists in users table
SELECT 
  'From user exists' as check_type,
  COUNT(*) as count
FROM users 
WHERE id IN (
  SELECT from_user_id 
  FROM partnership_invitations 
  WHERE to_email = 'benoats86@gmail.com'
);

-- Check table constraints
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'partnership_invitations';
