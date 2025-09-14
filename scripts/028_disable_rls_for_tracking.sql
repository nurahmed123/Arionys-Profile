-- Completely disable RLS on profile tracking tables to allow anonymous access
-- This is safe for tracking tables as they don't contain sensitive user data

-- Disable RLS on profile_visits table
ALTER TABLE profile_visits DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profile_views table  
ALTER TABLE profile_views DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on these tables
DROP POLICY IF EXISTS "Allow public inserts on profile_visits" ON profile_visits;
DROP POLICY IF EXISTS "Allow public inserts on profile_views" ON profile_views;
DROP POLICY IF EXISTS "Allow users to view their own profile visits" ON profile_visits;
DROP POLICY IF EXISTS "Allow users to view their own profile views" ON profile_views;

-- Grant necessary permissions to anonymous role
GRANT INSERT ON profile_visits TO anon;
GRANT INSERT ON profile_views TO anon;
GRANT SELECT, UPDATE ON profile_views TO anon;

-- Grant permissions to authenticated users as well
GRANT INSERT ON profile_visits TO authenticated;
GRANT INSERT, SELECT, UPDATE ON profile_views TO authenticated;

-- Ensure the tables can be accessed publicly for tracking purposes
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
