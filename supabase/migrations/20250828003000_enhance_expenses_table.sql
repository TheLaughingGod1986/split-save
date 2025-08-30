-- Enhance expenses table with recurring expense support and better tracking
-- Migration: 20250828003000_enhance_expenses_table.sql

-- Add new columns to expenses table
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurring_end_date DATE,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for recurring expenses
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(is_recurring, recurring_frequency) WHERE is_recurring = TRUE;

-- Create index for expense status
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status) WHERE status != 'active';

-- Create index for expense dates
CREATE INDEX IF NOT EXISTS idx_expenses_dates ON expenses(date, recurring_end_date);

-- Add trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for expenses table
DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON expenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing expenses to have default values
UPDATE expenses 
SET 
    is_recurring = FALSE,
    status = 'active',
    updated_at = created_at
WHERE is_recurring IS NULL OR status IS NULL OR updated_at IS NULL;

-- Add RLS policies for the new fields
-- Users can only see expenses from their partnerships
CREATE POLICY "Users can view expenses from their partnerships" ON expenses
    FOR SELECT USING (
        partnership_id IN (
            SELECT id FROM partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Users can only insert expenses for their partnerships
CREATE POLICY "Users can insert expenses for their partnerships" ON expenses
    FOR INSERT WITH CHECK (
        partnership_id IN (
            SELECT id FROM partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Users can only update expenses they created or in their partnerships
CREATE POLICY "Users can update expenses they created or in their partnerships" ON expenses
    FOR UPDATE USING (
        added_by_user_id = auth.uid() OR
        partnership_id IN (
            SELECT id FROM partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );

-- Users can only delete expenses they created or in their partnerships
CREATE POLICY "Users can delete expenses they created or in their partnerships" ON expenses
    FOR DELETE USING (
        added_by_user_id = auth.uid() OR
        partnership_id IN (
            SELECT id FROM partnerships 
            WHERE user1_id = auth.uid() OR user2_id = auth.uid()
        )
    );
