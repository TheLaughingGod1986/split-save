-- Add missing request_data column to approval_requests table
-- This column stores the actual expense/goal data for approval requests

ALTER TABLE public.approval_requests 
ADD COLUMN IF NOT EXISTS request_data JSONB;

-- Add index for better performance when querying request_data
CREATE INDEX IF NOT EXISTS idx_approval_requests_request_data ON public.approval_requests USING GIN (request_data);

-- Update existing rows to have empty request_data if NULL
UPDATE public.approval_requests 
SET request_data = '{}'::jsonb 
WHERE request_data IS NULL;
