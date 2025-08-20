-- 🎯 T&T Cashpot App Analytics Setup
-- Run this in your Supabase SQL Editor

-- Create analytics table
CREATE TABLE IF NOT EXISTS app_analytics (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  app_version TEXT NOT NULL,
  platform TEXT NOT NULL,
  first_open TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_open TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  open_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on device_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_analytics_device_id ON app_analytics(device_id);

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_app_analytics_updated_at ON app_analytics;
CREATE TRIGGER update_app_analytics_updated_at 
    BEFORE UPDATE ON app_analytics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create lottery actions tracking table
CREATE TABLE IF NOT EXISTS lottery_actions (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  action_type TEXT NOT NULL, -- 'check_result', 'search', 'view_history', 'sync_data'
  action_data JSONB, -- Store additional data like draw numbers, search queries
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for lottery actions
CREATE INDEX IF NOT EXISTS idx_lottery_actions_device_id ON lottery_actions(device_id);
CREATE INDEX IF NOT EXISTS idx_lottery_actions_timestamp ON lottery_actions(timestamp);

-- Insert sample data for testing (optional)
-- INSERT INTO app_analytics (device_id, app_version, platform, open_count) 
-- VALUES ('test_device_1', '1.0.0', 'web', 5);

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL ON app_analytics TO authenticated;
-- GRANT ALL ON lottery_actions TO authenticated;
