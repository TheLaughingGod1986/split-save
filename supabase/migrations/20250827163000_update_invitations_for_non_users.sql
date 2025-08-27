-- Update partnership_invitations table to support inviting non-users
-- Add to_email column and make to_user_id optional
-- Add expires_at column for invitation expiry

-- Add to_email column
ALTER TABLE partnership_invitations 
ADD COLUMN IF NOT EXISTS to_email VARCHAR(255);

-- Make to_user_id nullable (since non-users won't have an ID yet)
ALTER TABLE partnership_invitations 
ALTER COLUMN to_user_id DROP NOT NULL;

-- Add expires_at column
ALTER TABLE partnership_invitations 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add created_at column if it doesn't exist
ALTER TABLE partnership_invitations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create index on to_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_to_email 
ON partnership_invitations(to_email);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_expires_at 
ON partnership_invitations(expires_at);

-- Update existing invitations to have to_email if they don't have it
UPDATE partnership_invitations 
SET to_email = (
  SELECT email FROM users WHERE users.id = partnership_invitations.to_user_id
)
WHERE to_email IS NULL AND to_user_id IS NOT NULL;

-- Set default expiry for existing invitations (7 days from now)
UPDATE partnership_invitations 
SET expires_at = NOW() + INTERVAL '7 days'
WHERE expires_at IS NULL;
