-- Create the profile_visits table with all required columns
CREATE TABLE IF NOT EXISTS profile_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visitor_ip TEXT,
    visitor_country TEXT,
    visitor_city TEXT,
    visitor_region TEXT,
    visitor_isp TEXT,
    user_agent TEXT,
    referrer TEXT,
    device_type TEXT,
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    os_version TEXT,
    screen_width INTEGER,
    screen_height INTEGER,
    screen_color_depth INTEGER,
    window_width INTEGER,
    window_height INTEGER,
    device_pixel_ratio DECIMAL,
    timezone TEXT,
    language TEXT,
    languages TEXT,
    platform TEXT,
    cookie_enabled BOOLEAN,
    online_status BOOLEAN,
    touch_support BOOLEAN,
    max_touch_points INTEGER,
    hardware_concurrency INTEGER,
    connection_info TEXT,
    memory_info TEXT,
    visit_url TEXT,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_visits_profile_id ON profile_visits(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_visits_visited_at ON profile_visits(visited_at);
CREATE INDEX IF NOT EXISTS idx_profile_visits_visitor_country ON profile_visits(visitor_country);

-- Create daily_visit_stats table
CREATE TABLE IF NOT EXISTS daily_visit_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, visit_date)
);

-- Create country_visit_stats table
CREATE TABLE IF NOT EXISTS country_visit_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    visitor_country TEXT NOT NULL,
    visit_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, visitor_country)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_daily_visit_stats_profile_date ON daily_visit_stats(profile_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_country_visit_stats_profile ON country_visit_stats(profile_id);

-- Function to update daily stats when a visit is recorded
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stats
DROP TRIGGER IF EXISTS trigger_update_visit_stats ON profile_visits;
CREATE TRIGGER trigger_update_visit_stats
    AFTER INSERT ON profile_visits
    FOR EACH ROW
    EXECUTE FUNCTION update_visit_stats();
