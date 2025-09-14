-- Comprehensive RLS fix for profile tracking
-- This script completely removes RLS restrictions for profile tracking tables

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public profile_visits inserts" ON profile_visits;
DROP POLICY IF EXISTS "Allow public profile_views inserts" ON profile_views;
DROP POLICY IF EXISTS "Allow public profile_visits select" ON profile_visits;
DROP POLICY IF EXISTS "Allow public profile_views select" ON profile_views;
DROP POLICY IF EXISTS "Users can view their own profile_visits" ON profile_visits;
DROP POLICY IF EXISTS "Users can view their own profile_views" ON profile_views;

-- Disable RLS temporarily to clean up
ALTER TABLE profile_visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE profile_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for anonymous users
CREATE POLICY "Allow all profile_visits operations" ON profile_visits
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all profile_views operations" ON profile_views
    FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions to anonymous role
GRANT INSERT, SELECT, UPDATE ON profile_visits TO anon;
GRANT INSERT, SELECT, UPDATE ON profile_views TO anon;
GRANT USAGE ON SEQUENCE profile_visits_id_seq TO anon;
GRANT USAGE ON SEQUENCE profile_views_id_seq TO anon;

-- Grant permissions to authenticated users as well
GRANT INSERT, SELECT, UPDATE ON profile_visits TO authenticated;
GRANT INSERT, SELECT, UPDATE ON profile_views TO authenticated;
GRANT USAGE ON SEQUENCE profile_visits_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE profile_views_id_seq TO authenticated;
