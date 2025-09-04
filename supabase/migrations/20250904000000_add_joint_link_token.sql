-- Add joint_link_token column to partnership_invitations table
-- This allows generating shareable links for invitations

-- Add joint_link_token column
ALTER TABLE public.partnership_invitations 
ADD COLUMN IF NOT EXISTS joint_link_token VARCHAR(64);

-- Create unique index on joint_link_token for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_partnership_invitations_joint_link_token 
ON public.partnership_invitations(joint_link_token);

-- Add updated_at column if it doesn't exist
ALTER TABLE public.partnership_invitations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
