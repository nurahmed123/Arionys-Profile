-- Create view for daily visit statistics
CREATE OR REPLACE VIEW daily_visit_stats AS
SELECT 
  profile_id,
  DATE(visited_at) as visit_date,
  COUNT(*) as visit_count,
  COUNT(DISTINCT visitor_ip) as unique_visitors
FROM profile_visits
GROUP BY profile_id, DATE(visited_at)
ORDER BY visit_date DESC;

-- Create view for country statistics
CREATE OR REPLACE VIEW country_visit_stats AS
SELECT 
  profile_id,
  visitor_country,
  COUNT(*) as visit_count,
  COUNT(DISTINCT visitor_ip) as unique_visitors
FROM profile_visits
WHERE visitor_country IS NOT NULL
GROUP BY profile_id, visitor_country
ORDER BY visit_count DESC;
