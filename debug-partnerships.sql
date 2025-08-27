-- Debug script to check partnerships and invitations
-- Run this in Supabase SQL Editor

-- Check all partnerships
SELECT 
    p.id,
    p.user1_id,
    p.user2_id,
    p.status,
    p.created_at,
    p.updated_at,
    u1.email as user1_email,
    u2.email as user2_email
FROM partnerships p
LEFT JOIN users u1 ON p.user1_id = u1.id
LEFT JOIN users u2 ON p.user2_id = u2.id
ORDER BY p.created_at DESC;

-- Check all partnership invitations
SELECT 
    pi.id,
    pi.from_user_id,
    pi.to_user_id,
    pi.to_email,
    pi.status,
    pi.created_at,
    pi.updated_at,
    pi.expires_at,
    u1.email as from_email,
    u2.email as to_user_email
FROM partnership_invitations pi
LEFT JOIN users u1 ON pi.from_user_id = u1.id
LEFT JOIN users u2 ON pi.to_user_id = u2.id
ORDER BY pi.created_at DESC;

-- Check all users
SELECT 
    u.id,
    u.email,
    u.name,
    u.created_at,
    up.country_code,
    up.currency
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
ORDER BY u.created_at DESC;

-- Check auth.users count
SELECT COUNT(*) as auth_users_count FROM auth.users;
