-- Add missing columns to fix schema mismatches

-- Add status column to partnerships table
ALTER TABLE public.partnerships 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'declined', 'ended'));

-- Add missing columns to partnership_invitations table
ALTER TABLE public.partnership_invitations 
ADD COLUMN IF NOT EXISTS to_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- Update existing partnerships to have 'active' status
UPDATE public.partnerships SET status = 'active' WHERE status IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_to_email ON public.partnership_invitations(to_email);
CREATE INDEX IF NOT EXISTS idx_partnership_invitations_expires_at ON public.partnership_invitations(expires_at);
