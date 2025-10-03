-- Create a test partnership for the test user
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
