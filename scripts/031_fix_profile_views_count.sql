-- Fix profile views count tracking
-- This script ensures the profiles.views_count column is properly updated when visits are tracked

-- First, update existing profiles with correct view counts from profile_visits
UPDATE profiles 
SET views_count = (
    SELECT COUNT(DISTINCT visitor_ip) 
    FROM profile_visits 
    WHERE profile_visits.profile_id = profiles.id
)
WHERE id IN (
    SELECT DISTINCT profile_id 
    FROM profile_visits
);

-- Create or replace function to update profile views count
CREATE OR REPLACE FUNCTION update_profile_views_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the profile views count with unique visitor count
    UPDATE profiles 
    SET views_count = (
        SELECT COUNT(DISTINCT visitor_ip) 
        FROM profile_visits 
        WHERE profile_id = NEW.profile_id
    )
    WHERE id = NEW.profile_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_profile_views_count ON profile_visits;

-- Create trigger to update profile views count when new visit is recorded
CREATE TRIGGER trigger_update_profile_views_count
    AFTER INSERT ON profile_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_views_count();

-- Also update the existing visit stats trigger to include profile views count update
CREATE OR REPLACE FUNCTION update_visit_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily stats
    INSERT INTO daily_visit_stats (profile_id, visit_date, visit_count, unique_visitors)
    VALUES (
        NEW.profile_id,
        DATE(NEW.visited_at),
        1,
        1
    )
    ON CONFLICT (profile_id, visit_date)
    DO UPDATE SET
        visit_count = daily_visit_stats.visit_count + 1,
        unique_visitors = (
            SELECT COUNT(DISTINCT visitor_ip)
            FROM profile_visits
            WHERE profile_id = NEW.profile_id
            AND DATE(visited_at) = DATE(NEW.visited_at)
        ),
        updated_at = NOW();

    -- Update country stats
    IF NEW.visitor_country IS NOT NULL THEN
        INSERT INTO country_visit_stats (profile_id, visitor_country, visit_count, unique_visitors)
        VALUES (
            NEW.profile_id,
            NEW.visitor_country,
            1,
            1
        )
        ON CONFLICT (profile_id, visitor_country)
        DO UPDATE SET
            visit_count = country_visit_stats.visit_count + 1,
            unique_visitors = (
                SELECT COUNT(DISTINCT visitor_ip)
                FROM profile_visits
                WHERE profile_id = NEW.profile_id
                AND visitor_country = NEW.visitor_country
            ),
            updated_at = NOW();
    END IF;

    -- Update profile views count
    UPDATE profiles 
    SET views_count = (
        SELECT COUNT(DISTINCT visitor_ip) 
        FROM profile_visits 
        WHERE profile_id = NEW.profile_id
    )
    WHERE id = NEW.profile_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
