-- Fix the handle_new_user trigger to properly create new users
-- Run this in Supabase SQL Editor

-- First, let's check if the trigger exists and drop it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with proper error handling and RLS bypass
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into users table (bypass RLS for this function)
    INSERT INTO public.users (id, name, email, created_at, updated_at, last_seen)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
        NEW.email,
        NOW(),
        NOW(),
        NOW()
    );
    
    -- Insert into user_profiles table (bypass RLS for this function)
    INSERT INTO public.user_profiles (user_id, country_code, currency, created_at, updated_at)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'country_code', 'US'),
        'USD',
        NOW(),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth process
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now manually create your user records
INSERT INTO public.users (id, name, email, created_at, updated_at, last_seen)
VALUES (
    gen_random_uuid(),
    'User',
    'benoats@gmail.com',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID we just created
DO $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM public.users WHERE email = 'benoats@gmail.com';
    
    IF user_id IS NOT NULL THEN
        -- Create user profile
        INSERT INTO public.user_profiles (user_id, country_code, currency, created_at, updated_at)
        VALUES (user_id, 'US', 'USD', NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created user records for: benoats@gmail.com with ID: %', user_id;
    END IF;
END $$;

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
