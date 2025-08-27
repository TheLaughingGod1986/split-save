-- Debug authentication issue
-- Run this in Supabase SQL Editor

-- Check auth.users table
SELECT 'Auth Users:' as table_name, count(*) as count FROM auth.users;

-- Check public.users table  
SELECT 'Public Users:' as table_name, count(*) as count FROM public.users;

-- Check public.user_profiles table
SELECT 'User Profiles:' as table_name, count(*) as count FROM public.user_profiles;

-- Check specific user by email in auth.users
SELECT 
    'Auth User Details:' as info,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'benoats@gmail.com';

-- Check if user exists in public.users
SELECT 
    'Public User Details:' as info,
    id,
    name,
    email,
    created_at,
    updated_at
FROM public.users 
WHERE email = 'benoats@gmail.com';

-- Check if user profile exists
SELECT 
    'User Profile Details:' as info,
    id,
    user_id,
    country_code,
    currency,
    created_at,
    updated_at
FROM public.user_profiles 
WHERE user_id IN (
    SELECT id FROM public.users WHERE email = 'benoats@gmail.com'
);

-- Check if there's a mismatch between auth and public users
SELECT 
    'User Mismatch Check:' as info,
    au.id as auth_id,
    au.email as auth_email,
    pu.id as public_id,
    pu.email as public_email,
    CASE 
        WHEN pu.id IS NULL THEN 'Missing in public.users'
        WHEN au.id IS NULL THEN 'Missing in auth.users'
        ELSE 'Both exist'
    END as status
FROM auth.users au
FULL OUTER JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'benoats@gmail.com' OR pu.email = 'benoats@gmail.com';
