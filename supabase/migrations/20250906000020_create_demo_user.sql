-- Create a demo user for easy testing
-- This user will have a simple email and password for testing purposes

-- First, create the user in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'demo-user-id-12345',
  'demo@splitsave.com',
  crypt('demo123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Demo User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create corresponding public.users record
INSERT INTO public.users (
  id,
  name,
  email,
  created_at,
  updated_at,
  last_seen
) VALUES (
  'demo-user-id-12345',
  'Demo User',
  'demo@splitsave.com',
  now(),
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create user profile
INSERT INTO public.user_profiles (
  user_id,
  country_code,
  currency,
  created_at,
  updated_at
) VALUES (
  'demo-user-id-12345',
  'US',
  'USD',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;
