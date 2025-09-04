-- Add sample activities for testing the activity feed
-- This migration adds some sample activities to test the like/comment functionality

-- Create a sample partnership if none exists (using the same user for both sides for testing)
INSERT INTO partnerships (id, user1_id, user2_id, status, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM users LIMIT 1),
    'active',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM partnerships WHERE status = 'active');

-- Add sample activities for the first user
INSERT INTO partner_activities (
    user_id,
    partnership_id,
    activity_type,
    title,
    description,
    metadata,
    amount,
    currency,
    entity_type,
    entity_id,
    visibility,
    is_milestone,
    created_at
)
SELECT 
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM partnerships WHERE status = 'active' LIMIT 1),
    'expense_added',
    'Added shared expense: Groceries',
    'Weekly grocery shopping at Tesco',
    '{"category": "food", "location": "Tesco"}'::jsonb,
    85.50,
    'GBP',
    'expense',
    gen_random_uuid(),
    'partners',
    false,
    NOW() - INTERVAL '2 hours'
WHERE EXISTS (SELECT 1 FROM partnerships WHERE status = 'active')
AND NOT EXISTS (SELECT 1 FROM partner_activities WHERE title = 'Added shared expense: Groceries');

INSERT INTO partner_activities (
    user_id,
    partnership_id,
    activity_type,
    title,
    description,
    metadata,
    amount,
    currency,
    entity_type,
    entity_id,
    visibility,
    is_milestone,
    created_at
)
SELECT 
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM partnerships WHERE status = 'active' LIMIT 1),
    'goal_contribution',
    'Contributed to Holiday Fund',
    'Monthly contribution towards summer holiday',
    '{"goal_name": "Holiday Fund", "contribution_amount": 200}'::jsonb,
    200.00,
    'GBP',
    'goal',
    gen_random_uuid(),
    'partners',
    false,
    NOW() - INTERVAL '1 day'
WHERE EXISTS (SELECT 1 FROM partnerships WHERE status = 'active')
AND NOT EXISTS (SELECT 1 FROM partner_activities WHERE title = 'Contributed to Holiday Fund');

INSERT INTO partner_activities (
    user_id,
    partnership_id,
    activity_type,
    title,
    description,
    metadata,
    amount,
    currency,
    entity_type,
    entity_id,
    visibility,
    is_milestone,
    created_at
)
SELECT 
    (SELECT id FROM users LIMIT 1),
    (SELECT id FROM partnerships WHERE status = 'active' LIMIT 1),
    'safety_pot_contribution',
    'Safety Pot Contribution',
    'Emergency fund contribution',
    '{"contribution_amount": 150}'::jsonb,
    150.00,
    'GBP',
    'safety_pot',
    gen_random_uuid(),
    'partners',
    false,
    NOW() - INTERVAL '3 days'
WHERE EXISTS (SELECT 1 FROM partnerships WHERE status = 'active')
AND NOT EXISTS (SELECT 1 FROM partner_activities WHERE title = 'Safety Pot Contribution');