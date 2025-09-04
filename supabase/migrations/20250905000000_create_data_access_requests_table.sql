-- Create data_access_requests table for GDPR compliance
-- This table tracks user requests for data access, deletion, and other privacy rights

CREATE TABLE public.data_access_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('data_access', 'data_deletion', 'data_portability', 'data_rectification')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_data_access_requests_user_id ON public.data_access_requests(user_id);
CREATE INDEX idx_data_access_requests_status ON public.data_access_requests(status);
CREATE INDEX idx_data_access_requests_requested_at ON public.data_access_requests(requested_at);

-- Enable Row Level Security
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "data_access_requests_select_policy" ON public.data_access_requests 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "data_access_requests_insert_policy" ON public.data_access_requests 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add privacy_preferences column to user_profiles if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS privacy_preferences JSONB DEFAULT '{
    "dataSharing": true,
    "analytics": true,
    "marketing": false,
    "partnerVisibility": "full",
    "dataRetention": "1year"
}'::jsonb;
