-- Create profile_views table to track total view counts
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index on profile_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_profile_id ON profile_views(profile_id);

-- Create function to increment profile views
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

  -- Insert visit record
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
$$ LANGUAGE plpgsql;
