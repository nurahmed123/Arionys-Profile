-- Fix profile views system by creating missing tables and updating function

-- Create daily_visit_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_visit_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  visit_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on profile_id and visit_date
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_visit_stats_profile_date 
ON daily_visit_stats(profile_id, visit_date);

-- Enable RLS for daily_visit_stats
ALTER TABLE daily_visit_stats ENABLE ROW LEVEL SECURITY;

-- RLS policy for daily_visit_stats
CREATE POLICY "daily_stats_select_own"
  ON daily_visit_stats FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE auth.uid() = id
    )
  );

-- Update the increment_profile_views function to handle missing tables gracefully
CREATE OR REPLACE FUNCTION increment_profile_views(
  profile_uuid UUID,
  client_ip TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  is_unique_visitor BOOLEAN := FALSE;
BEGIN
  -- Check if this is a unique visitor (same IP hasn't visited this profile in last 24 hours)
  IF client_ip IS NOT NULL THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM profile_visits 
      WHERE profile_id = profile_uuid 
      AND visitor_ip = client_ip 
      AND visited_at > NOW() - INTERVAL '24 hours'
    ) INTO is_unique_visitor;
  ELSE
    is_unique_visitor := TRUE;
  END IF;

  -- Insert visit record (only if profile_visits table exists)
  BEGIN
    INSERT INTO profile_visits (
      profile_id, 
      visitor_ip, 
      user_agent, 
      visited_at
    ) VALUES (
      profile_uuid, 
      client_ip, 
      user_agent, 
      NOW()
    );
  EXCEPTION WHEN undefined_table THEN
    -- If profile_visits table doesn't exist, continue without error
    NULL;
  END;

  -- Update or insert profile views count
  INSERT INTO profile_views (profile_id, total_views, unique_visitors)
  VALUES (profile_uuid, 1, CASE WHEN is_unique_visitor THEN 1 ELSE 0 END)
  ON CONFLICT (profile_id) 
  DO UPDATE SET 
    total_views = profile_views.total_views + 1,
    unique_visitors = profile_views.unique_visitors + CASE WHEN is_unique_visitor THEN 1 ELSE 0 END,
    updated_at = NOW();

  -- Update daily stats
  INSERT INTO daily_visit_stats (profile_id, visit_date, visit_count, unique_visitors)
  VALUES (profile_uuid, CURRENT_DATE, 1, CASE WHEN is_unique_visitor THEN 1 ELSE 0 END)
  ON CONFLICT (profile_id, visit_date)
  DO UPDATE SET 
    visit_count = daily_visit_stats.visit_count + 1,
    unique_visitors = daily_visit_stats.unique_visitors + CASE WHEN is_unique_visitor THEN 1 ELSE 0 END;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
