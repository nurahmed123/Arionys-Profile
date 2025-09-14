-- Create functions to update visit statistics
CREATE OR REPLACE FUNCTION increment_daily_visits(p_profile_id UUID, p_visit_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO daily_visit_stats (profile_id, visit_date, visit_count, unique_visitors)
  VALUES (p_profile_id, p_visit_date, 1, 1)
  ON CONFLICT (profile_id, visit_date)
  DO UPDATE SET
    visit_count = daily_visit_stats.visit_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_country_visits(p_profile_id UUID, p_country TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO country_visit_stats (profile_id, visitor_country, visit_count, unique_visitors)
  VALUES (p_profile_id, p_country, 1, 1)
  ON CONFLICT (profile_id, visitor_country)
  DO UPDATE SET
    visit_count = country_visit_stats.visit_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
