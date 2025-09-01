-- Financial Forecasting Database Schema
-- This migration creates tables for storing financial forecasts, scenario analyses, and risk assessments

-- Create financial_forecasts table
CREATE TABLE IF NOT EXISTS public.financial_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    forecast_type VARCHAR(50) NOT NULL CHECK (forecast_type IN ('savings_trajectory', 'goal_completion', 'financial_health', 'scenario_analysis')),
    timeframe VARCHAR(20) NOT NULL CHECK (timeframe IN ('3months', '6months', '12months', '24months', '5years')),
    predictions JSONB NOT NULL DEFAULT '[]',
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    assumptions JSONB NOT NULL DEFAULT '[]',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scenario_analyses table
CREATE TABLE IF NOT EXISTS public.scenario_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scenario_name VARCHAR(255) NOT NULL,
    description TEXT,
    modifications JSONB NOT NULL DEFAULT '[]',
    outcomes JSONB NOT NULL DEFAULT '[]',
    comparison JSONB NOT NULL DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create risk_assessments table
CREATE TABLE IF NOT EXISTS public.risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    risk_factors JSONB NOT NULL DEFAULT '[]',
    mitigation_strategies TEXT[] DEFAULT '{}',
    probability DECIMAL(3,2) NOT NULL CHECK (probability >= 0 AND probability <= 1),
    impact VARCHAR(20) NOT NULL CHECK (impact IN ('low', 'medium', 'high')),
    last_assessed TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_financial_forecasts_user_id ON public.financial_forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_forecasts_forecast_type ON public.financial_forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_financial_forecasts_created_at ON public.financial_forecasts(created_at);
CREATE INDEX IF NOT EXISTS idx_scenario_analyses_user_id ON public.scenario_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_scenario_analyses_created_at ON public.scenario_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_user_id ON public.risk_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk_level ON public.risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_last_assessed ON public.risk_assessments(last_assessed);

-- Enable Row Level Security
ALTER TABLE public.financial_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "financial_forecasts_select_policy" ON public.financial_forecasts 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "financial_forecasts_insert_policy" ON public.financial_forecasts 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "financial_forecasts_update_policy" ON public.financial_forecasts 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "scenario_analyses_select_policy" ON public.scenario_analyses 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "scenario_analyses_insert_policy" ON public.scenario_analyses 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "scenario_analyses_update_policy" ON public.scenario_analyses 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "risk_assessments_select_policy" ON public.risk_assessments 
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "risk_assessments_insert_policy" ON public.risk_assessments 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "risk_assessments_update_policy" ON public.risk_assessments 
    FOR UPDATE USING (auth.uid() = user_id);
