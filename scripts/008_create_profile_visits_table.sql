-- Create profile_visits table for tracking visitor analytics
CREATE TABLE IF NOT EXISTS profile_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  visitor_ip TEXT,
  visitor_country TEXT,
  visitor_city TEXT,
  user_agent TEXT,
  referrer TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_visits_profile_id ON profile_visits(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_visits_visited_at ON profile_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_profile_visits_country ON profile_visits(visitor_country);

-- Enable RLS
ALTER TABLE profile_visits ENABLE ROW LEVEL SECURITY;

-- Create policy for profile owners to view their analytics
CREATE POLICY "Users can view their own profile visits" ON profile_visits
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );
