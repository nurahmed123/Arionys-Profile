-- Add location and IP tracking to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS subscriber_ip TEXT,
ADD COLUMN IF NOT EXISTS subscriber_country TEXT,
ADD COLUMN IF NOT EXISTS subscriber_city TEXT,
ADD COLUMN IF NOT EXISTS subscriber_phone TEXT;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_country ON subscriptions(subscriber_country);
