-- Fix missing user records
-- Run this in Supabase SQL Editor

-- First, let's see what users exist in auth.users
SELECT 'Auth Users Count:' as info, count(*) as count FROM auth.users;

-- Check if your user exists in auth.users
SELECT 
    'Your Auth User:' as info,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'benoats@gmail.com';

-- Manually create user record in public.users
INSERT INTO public.users (id, name, email, created_at, updated_at, last_seen)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'name', 'User'),
    email,
    created_at,
    updated_at,
    NOW()
FROM auth.users 
WHERE email = 'benoats@gmail.com'
ON CONFLICT (id) DO NOTHING;

-- Manually create user profile record
INSERT INTO public.user_profiles (user_id, country_code, currency, created_at, updated_at)
SELECT 
    id,
    COALESCE(raw_user_meta_data->>'country_code', 'US'),
    'USD',
    NOW(),
    NOW()
FROM auth.users 
WHERE email = 'benoats@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

-- Verify the records were created
SELECT 
    'Verification:' as info,
    u.id,
    u.email,
    u.name,
    up.country_code,
    up.currency
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE u.email = 'benoats@gmail.com';
