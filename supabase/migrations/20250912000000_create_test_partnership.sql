-- Create a test partnership for the test user
-- First ensure the user exists in auth.users table
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
  '95c0acd8-e9c0-455d-ba0d-db3b8efc2287',
  'test@splitsave.com',
  crypt('test123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Test User"}',
  false,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Then ensure the user exists in public.users table
INSERT INTO public.users (
  id,
  name,
  email,
  created_at,
  updated_at,
  last_seen
) VALUES (
  '95c0acd8-e9c0-455d-ba0d-db3b8efc2287',
  'Test User',
  'test@splitsave.com',
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
  '95c0acd8-e9c0-455d-ba0d-db3b8efc2287',
  'US',
  'USD',
  now(),
  now()
) ON CONFLICT (user_id) DO NOTHING;

-- Create the partnership
INSERT INTO partnerships (
  id,
  user1_id,
  user2_id,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '95c0acd8-e9c0-455d-ba0d-db3b8efc2287',
  '95c0acd8-e9c0-455d-ba0d-db3b8efc2287',
  'active',
  now(),
  now()
) ON CONFLICT DO NOTHING;
