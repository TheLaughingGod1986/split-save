-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Enable RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (with IF NOT EXISTS equivalent using DO blocks)
DO $$ 
BEGIN
    -- Create policy for SELECT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'push_subscriptions' 
        AND policyname = 'Users can view their own push subscriptions'
    ) THEN
        CREATE POLICY "Users can view their own push subscriptions" ON push_subscriptions
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Create policy for INSERT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'push_subscriptions' 
        AND policyname = 'Users can insert their own push subscriptions'
    ) THEN
        CREATE POLICY "Users can insert their own push subscriptions" ON push_subscriptions
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Create policy for UPDATE if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'push_subscriptions' 
        AND policyname = 'Users can update their own push subscriptions'
    ) THEN
        CREATE POLICY "Users can update their own push subscriptions" ON push_subscriptions
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Create policy for DELETE if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'push_subscriptions' 
        AND policyname = 'Users can delete their own push subscriptions'
    ) THEN
        CREATE POLICY "Users can delete their own push subscriptions" ON push_subscriptions
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at (with IF NOT EXISTS equivalent)
DO $$ 
BEGIN
    -- Drop trigger if it exists
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_push_subscriptions_updated_at'
    ) THEN
        DROP TRIGGER update_push_subscriptions_updated_at ON push_subscriptions;
    END IF;
    
    -- Create the trigger
    CREATE TRIGGER update_push_subscriptions_updated_at
      BEFORE UPDATE ON push_subscriptions
      FOR EACH ROW
      EXECUTE FUNCTION update_push_subscriptions_updated_at();
END $$;
