-- Create a test user for development
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
  gen_random_uuid(),
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
) ON CONFLICT (email) DO NOTHING;

-- Create corresponding public.users record
INSERT INTO public.users (
  id,
  name,
  email,
  created_at,
  updated_at,
  last_seen
) 
SELECT 
  id,
  'Test User',
  email,
  now(),
  now(),
  now()
FROM auth.users 
WHERE email = 'test@splitsave.com'
ON CONFLICT (id) DO NOTHING;

-- Create user profile
INSERT INTO public.user_profiles (
  user_id,
  country_code,
  currency,
  created_at,
  updated_at
) 
SELECT 
  id,
  'US',
  'USD',
  now(),
  now()
FROM auth.users 
WHERE email = 'test@splitsave.com'
ON CONFLICT (user_id) DO NOTHING;
