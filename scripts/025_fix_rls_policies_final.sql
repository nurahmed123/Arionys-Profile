-- Final fix for RLS policies to ensure anonymous tracking works properly

-- Disable RLS temporarily to clean up
ALTER TABLE profile_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_visit_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE country_visit_stats DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public insert for profile_visits" ON profile_visits;
DROP POLICY IF EXISTS "Allow users to view their own profile visits" ON profile_visits;
DROP POLICY IF EXISTS "Allow public read access to profile_views" ON profile_views;
DROP POLICY IF EXISTS "Allow public insert/update for profile_views" ON profile_views;
DROP POLICY IF EXISTS "Allow public access to daily_visit_stats" ON daily_visit_stats;
DROP POLICY IF EXISTS "Allow public access to country_visit_stats" ON country_visit_stats;

-- Re-enable RLS
ALTER TABLE profile_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_visit_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_visit_stats ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous tracking
CREATE POLICY "profile_visits_anonymous_insert" ON profile_visits
    FOR INSERT 
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "profile_visits_owner_select" ON profile_visits
    FOR SELECT 
    TO authenticated
    USING (
        profile_id IN (
            SELECT id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "profile_views_public_access" ON profile_views
    FOR ALL 
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "daily_visit_stats_public_access" ON daily_visit_stats
    FOR ALL 
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "country_visit_stats_public_access" ON country_visit_stats
    FOR ALL 
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Grant necessary permissions to anon role
GRANT INSERT ON profile_visits TO anon;
GRANT ALL ON profile_views TO anon;
GRANT ALL ON daily_visit_stats TO anon;
GRANT ALL ON country_visit_stats TO anon;

-- Grant execute permission on functions to anon
GRANT EXECUTE ON FUNCTION increment_profile_views(uuid, text, text) TO anon;
GRANT EXECUTE ON FUNCTION increment_daily_visits(uuid, date) TO anon;
GRANT EXECUTE ON FUNCTION increment_country_visits(uuid, text) TO anon;
