-- Add missing response tracking columns to approval_requests table
-- These columns track who responded to the approval and when

ALTER TABLE public.approval_requests 
ADD COLUMN IF NOT EXISTS responded_by UUID REFERENCES public.users(id),
ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Add index for better performance when querying responses
CREATE INDEX IF NOT EXISTS idx_approval_requests_responded_by ON public.approval_requests(responded_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_responded_at ON public.approval_requests(responded_at);
