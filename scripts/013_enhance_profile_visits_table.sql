-- Enhanced profile visits table with comprehensive visitor tracking fields
ALTER TABLE profile_visits 
ADD COLUMN IF NOT EXISTS device_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS browser VARCHAR(100),
ADD COLUMN IF NOT EXISTS operating_system VARCHAR(100),
ADD COLUMN IF NOT EXISTS screen_width INTEGER,
ADD COLUMN IF NOT EXISTS screen_height INTEGER,
ADD COLUMN IF NOT EXISTS window_width INTEGER,
ADD COLUMN IF NOT EXISTS window_height INTEGER,
ADD COLUMN IF NOT EXISTS device_pixel_ratio DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS color_depth INTEGER,
ADD COLUMN IF NOT EXISTS language VARCHAR(10),
ADD COLUMN IF NOT EXISTS languages TEXT,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100),
ADD COLUMN IF NOT EXISTS referrer TEXT,
ADD COLUMN IF NOT EXISTS url TEXT,
ADD COLUMN IF NOT EXISTS platform VARCHAR(100),
ADD COLUMN IF NOT EXISTS cookie_enabled BOOLEAN,
ADD COLUMN IF NOT EXISTS online_status BOOLEAN;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_visits_device_type ON profile_visits(device_type);
CREATE INDEX IF NOT EXISTS idx_profile_visits_browser ON profile_visits(browser);
CREATE INDEX IF NOT EXISTS idx_profile_visits_os ON profile_visits(operating_system);
CREATE INDEX IF NOT EXISTS idx_profile_visits_country_code ON profile_visits(country_code);
CREATE INDEX IF NOT EXISTS idx_profile_visits_visited_at ON profile_visits(visited_at);
