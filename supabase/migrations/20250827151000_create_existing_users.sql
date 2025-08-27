-- Create user records for existing authenticated users
-- This migration ensures that users who signed up before the trigger was working have proper records

-- First, let's see what users exist in auth.users
DO $$
DECLARE
    auth_user RECORD;
BEGIN
    FOR auth_user IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
        -- Insert into public.users if not exists
        INSERT INTO public.users (id, name, email, created_at, updated_at, last_seen)
        VALUES (
            auth_user.id,
            COALESCE(auth_user.raw_user_meta_data->>'name', 'User'),
            auth_user.email,
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Insert into public.user_profiles if not exists
        INSERT INTO public.user_profiles (user_id, country_code, currency, created_at, updated_at)
        VALUES (
            auth_user.id,
            COALESCE(auth_user.raw_user_meta_data->>'country_code', 'US'),
            'USD',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE LOG 'Created/updated user records for: %', auth_user.email;
    END LOOP;
END $$;
