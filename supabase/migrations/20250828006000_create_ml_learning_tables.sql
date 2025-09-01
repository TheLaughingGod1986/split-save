-- ML Learning Engine Database Schema - Simplified Version
-- This migration creates the essential ML tables without conflicts

-- Create behavior_analysis table
CREATE TABLE IF NOT EXISTS public.behavior_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_period VARCHAR(20) NOT NULL CHECK (analysis_period IN ('week', 'month', 'quarter', 'year')),
    saving_consistency DECIMAL(5,2) NOT NULL CHECK (saving_consistency >= 0 AND saving_consistency <= 100),
    goal_achievement_rate DECIMAL(5,2) NOT NULL CHECK (goal_achievement_rate >= 0 AND goal_achievement_rate <= 100),
    risk_tolerance VARCHAR(20) NOT NULL CHECK (risk_tolerance IN ('low', 'medium', 'high')),
    preferred_timing VARCHAR(20) NOT NULL CHECK (preferred_timing IN ('early_month', 'mid_month', 'late_month', 'irregular')),
    stress_factors TEXT[] DEFAULT '{}',
    success_patterns TEXT[] DEFAULT '{}',
    improvement_areas TEXT[] DEFAULT '{}',
    last_analyzed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, analysis_period)
);

-- Create learning_insights table
CREATE TABLE IF NOT EXISTS public.learning_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('saving_behavior', 'goal_optimization', 'contribution_pattern', 'risk_assessment')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    recommendations TEXT[] DEFAULT '{}',
    data_points INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    applied_at TIMESTAMPTZ,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT
);

-- Create adaptive_recommendations table
CREATE TABLE IF NOT EXISTS public.adaptive_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL CHECK (recommendation_type IN ('goal_adjustment', 'contribution_change', 'safety_pot_optimization', 'priority_reweighting')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    suggested_action TEXT NOT NULL,
    expected_impact_short_term TEXT NOT NULL,
    expected_impact_long_term TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    reasoning TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    applied_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    feedback_rating INTEGER CHECK (feedback_rating >= 1 AND feedback_rating <= 5),
    feedback_comment TEXT
);

-- Create user_behavior_patterns table
CREATE TABLE IF NOT EXISTS public.user_behavior_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL CHECK (pattern_type IN ('under_saving', 'over_saving', 'consistent', 'irregular')),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    factors TEXT[] DEFAULT '{}',
    context_data JSONB DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pattern_type)
);

-- Create ml_model_config table
CREATE TABLE IF NOT EXISTS public.ml_model_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) NOT NULL UNIQUE,
    config_data JSONB NOT NULL DEFAULT '{}',
    version VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create ml_learning_events table for tracking learning events
CREATE TABLE IF NOT EXISTS public.ml_learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic indexes
CREATE INDEX IF NOT EXISTS idx_behavior_analysis_user_id ON public.behavior_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_insights_user_id ON public.learning_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_adaptive_recommendations_user_id ON public.adaptive_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_patterns_user_id ON public.user_behavior_patterns(user_id);

-- Enable Row Level Security
ALTER TABLE public.behavior_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_model_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_learning_events ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "behavior_analysis_select_policy" ON public.behavior_analysis 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "behavior_analysis_insert_policy" ON public.behavior_analysis 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "behavior_analysis_update_policy" ON public.behavior_analysis 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "learning_insights_select_policy" ON public.learning_insights 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "learning_insights_insert_policy" ON public.learning_insights 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learning_insights_update_policy" ON public.learning_insights 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "adaptive_recommendations_select_policy" ON public.adaptive_recommendations 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "adaptive_recommendations_insert_policy" ON public.adaptive_recommendations 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "adaptive_recommendations_update_policy" ON public.adaptive_recommendations 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_behavior_patterns_select_policy" ON public.user_behavior_patterns 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_behavior_patterns_insert_policy" ON public.user_behavior_patterns 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_behavior_patterns_update_policy" ON public.user_behavior_patterns 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "ml_learning_events_select_policy" ON public.ml_learning_events 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ml_learning_events_insert_policy" ON public.ml_learning_events 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "ml_model_config_select_policy" ON public.ml_model_config 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ml_model_config_insert_policy" ON public.ml_model_config 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "ml_model_config_update_policy" ON public.ml_model_config 
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Insert default ML model configuration
INSERT INTO public.ml_model_config (model_name, config_data, version) 
SELECT 'default_learning_engine', 
       '{"minDataPoints": 10, "confidenceThreshold": 0.7, "learningRate": 0.1, "analysisFrequency": "weekly", "retentionPeriod": 365}',
       '1.0.0'
WHERE NOT EXISTS (SELECT 1 FROM public.ml_model_config WHERE model_name = 'default_learning_engine');
