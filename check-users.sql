-- Check if user records exist
-- Run this in Supabase SQL Editor

-- Check auth.users table
SELECT 'Auth Users:' as table_name, count(*) as count FROM auth.users;

-- Check public.users table
SELECT 'Public Users:' as table_name, count(*) as count FROM public.users;

-- Check public.user_profiles table
SELECT 'User Profiles:' as table_name, count(*) as count FROM public.user_profiles;

-- Check specific user by email
SELECT 
    'User Details:' as info,
    u.id,
    u.email,
    u.name,
    up.country_code,
    up.currency
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.email = 'benoats@gmail.com';
