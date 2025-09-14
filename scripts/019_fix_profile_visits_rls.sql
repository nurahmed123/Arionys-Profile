-- Fix RLS policy for profile_visits to allow anonymous visit tracking

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to profile_visits" ON profile_visits;
DROP POLICY IF EXISTS "Allow authenticated users to insert profile_visits" ON profile_visits;
DROP POLICY IF EXISTS "Allow users to view their own profile visits" ON profile_visits;

-- Create new policies that allow anonymous visit tracking
CREATE POLICY "Allow public insert for profile_visits" ON profile_visits
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Allow users to view their own profile visits" ON profile_visits
    FOR SELECT 
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

-- Ensure RLS is enabled
ALTER TABLE profile_visits ENABLE ROW LEVEL SECURITY;

-- Also fix profile_views table RLS for consistency
DROP POLICY IF EXISTS "Allow public read access to profile_views" ON profile_views;
DROP POLICY IF EXISTS "Allow authenticated users to update profile_views" ON profile_views;

CREATE POLICY "Allow public read access to profile_views" ON profile_views
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow public insert/update for profile_views" ON profile_views
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Fix daily_visit_stats and country_visit_stats RLS as well
DROP POLICY IF EXISTS "Allow public read access to daily_visit_stats" ON daily_visit_stats;
DROP POLICY IF EXISTS "Allow authenticated users to manage daily_visit_stats" ON daily_visit_stats;

CREATE POLICY "Allow public access to daily_visit_stats" ON daily_visit_stats
    FOR ALL 
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read access to country_visit_stats" ON country_visit_stats;
DROP POLICY IF EXISTS "Allow authenticated users to manage country_visit_stats" ON country_visit_stats;

CREATE POLICY "Allow public access to country_visit_stats" ON country_visit_stats
    FOR ALL 
    USING (true)
    WITH CHECK (true);
