-- Fix the calculate_goal_feasibility function to use 'income' instead of 'monthly_income'

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS trigger_calculate_goal_feasibility ON public.goals;

-- Drop the existing function
DROP FUNCTION IF EXISTS calculate_goal_feasibility();

-- Recreate the function with the correct column name
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
    SELECT COALESCE(income, 0) INTO total_monthly_income
    FROM user_profiles 
    WHERE user_id = NEW.added_by_user_id;
    
    -- Calculate months to deadline
    IF NEW.target_date IS NOT NULL THEN
        months_to_deadline := GREATEST(1, EXTRACT(YEAR FROM AGE(NEW.target_date::date, CURRENT_DATE)) * 12 + EXTRACT(MONTH FROM AGE(NEW.target_date::date, CURRENT_DATE)));
    ELSE
        months_to_deadline := 12; -- Default to 1 year if no target date
    END IF;
    
    -- Calculate monthly amount needed
    monthly_needed := (NEW.target_amount - NEW.current_amount) / GREATEST(months_to_deadline, 1);
    
    -- Calculate feasibility score (0.0 to 1.0)
    IF total_monthly_income > 0 THEN
        feasibility := LEAST(1.0, (total_monthly_income * 0.3) / monthly_needed);
    ELSE
        feasibility := 0.0;
    END IF;
    
    -- Update the goal with feasibility score
    NEW.feasibility_score := feasibility;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_calculate_goal_feasibility
    BEFORE INSERT OR UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION calculate_goal_feasibility();
