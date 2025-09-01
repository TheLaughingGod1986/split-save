-- Enhance goal prioritization system
-- Extend priority range from 1-3 to 1-5
ALTER TABLE public.goals 
DROP CONSTRAINT IF EXISTS goals_priority_check;

ALTER TABLE public.goals 
ADD CONSTRAINT goals_priority_check CHECK (priority >= 1 AND priority <= 5);

-- Add fields for smart recommendations and allocation
ALTER TABLE public.goals 
ADD COLUMN recommended_amount DECIMAL(10,2),
ADD COLUMN recommended_deadline DATE,
ADD COLUMN recommended_priority INTEGER CHECK (recommended_priority >= 1 AND priority <= 5),
ADD COLUMN allocation_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
ADD COLUMN last_recommendation_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN recommendation_reason TEXT;

-- Add fields for tracking goal feasibility
ALTER TABLE public.goals 
ADD COLUMN monthly_contribution_needed DECIMAL(10,2),
ADD COLUMN days_to_deadline INTEGER,
ADD COLUMN is_feasible BOOLEAN DEFAULT true,
ADD COLUMN feasibility_score DECIMAL(3,2) DEFAULT 1.0;

-- Create indexes for performance
CREATE INDEX idx_goals_risk_level ON public.goals(risk_level);
CREATE INDEX idx_goals_feasibility ON public.goals(is_feasible, feasibility_score);
CREATE INDEX idx_goals_deadline_priority ON public.goals(target_date, priority);

-- Update existing goals to have priority 3 (medium) instead of 2
UPDATE public.goals SET priority = 3 WHERE priority = 2;

-- Create a function to calculate goal feasibility
CREATE OR REPLACE FUNCTION calculate_goal_feasibility()
RETURNS TRIGGER AS $$
DECLARE
    total_monthly_income DECIMAL(10,2);
    current_savings_rate DECIMAL(5,2);
    months_to_deadline INTEGER;
    monthly_needed DECIMAL(10,2);
    feasibility DECIMAL(3,2);
BEGIN
    -- Get user's monthly income (simplified calculation)
    SELECT COALESCE(monthly_income, 0) INTO total_monthly_income
    FROM user_profiles 
    WHERE user_id = NEW.added_by_user_id;
    
    -- Calculate months to deadline
    months_to_deadline := EXTRACT(DAYS FROM (NEW.target_date - CURRENT_DATE)) / 30;
    
    -- Calculate monthly contribution needed
    monthly_needed := (NEW.target_amount - NEW.current_amount) / GREATEST(months_to_deadline, 1);
    
    -- Calculate feasibility score (0.0 to 1.0)
    IF total_monthly_income > 0 THEN
        feasibility := LEAST(1.0, (total_monthly_income * 0.3) / monthly_needed);
    ELSE
        feasibility := 0.0;
    END IF;
    
    -- Update the goal with calculated values
    NEW.monthly_contribution_needed := monthly_needed;
    NEW.days_to_deadline := EXTRACT(DAYS FROM (NEW.target_date - CURRENT_DATE));
    NEW.is_feasible := feasibility >= 0.5;
    NEW.feasibility_score := feasibility;
    
    -- Set risk level based on feasibility
    IF feasibility < 0.3 THEN
        NEW.risk_level := 'critical';
    ELSIF feasibility < 0.5 THEN
        NEW.risk_level := 'high';
    ELSIF feasibility < 0.7 THEN
        NEW.risk_level := 'medium';
    ELSE
        NEW.risk_level := 'low';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate feasibility
CREATE TRIGGER trigger_calculate_goal_feasibility
    BEFORE INSERT OR UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION calculate_goal_feasibility();

-- Create a function to calculate optimal allocation percentages
CREATE OR REPLACE FUNCTION calculate_goal_allocations(user_id_param UUID)
RETURNS TABLE (
    goal_id UUID,
    suggested_allocation DECIMAL(5,2),
    recommendation_reason TEXT
) AS $$
DECLARE
    total_priority_weight INTEGER := 0;
    goal_record RECORD;
BEGIN
    -- Calculate total priority weight (inverse priority - lower number = higher weight)
    SELECT COALESCE(SUM((6 - priority) * GREATEST(feasibility_score, 0.1)), 0) 
    INTO total_priority_weight
    FROM goals 
    WHERE added_by_user_id = user_id_param 
    AND target_date > CURRENT_DATE 
    AND current_amount < target_amount;
    
    -- Calculate allocation for each goal
    FOR goal_record IN 
        SELECT id, priority, feasibility_score, target_amount, current_amount, target_date
        FROM goals 
        WHERE added_by_user_id = user_id_param 
        AND target_date > CURRENT_DATE 
        AND current_amount < target_amount
        ORDER BY priority ASC, target_date ASC
    LOOP
        goal_id := goal_record.id;
        
        -- Calculate allocation based on priority and feasibility
        suggested_allocation := ROUND(
            ((6 - goal_record.priority) * GREATEST(goal_record.feasibility_score, 0.1) / total_priority_weight) * 100, 
            2
        );
        
        -- Generate recommendation reason
        IF goal_record.feasibility_score < 0.5 THEN
            recommendation_reason := 'Consider increasing monthly contribution or extending deadline';
        ELSIF goal_record.priority > 3 THEN
            recommendation_reason := 'Lower priority goal - consider reducing allocation';
        ELSE
            recommendation_reason := 'Optimal allocation based on priority and feasibility';
        END IF;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
