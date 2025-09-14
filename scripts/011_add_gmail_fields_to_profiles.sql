-- Add Gmail integration fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gmail_access_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_refresh_token TEXT,
ADD COLUMN IF NOT EXISTS gmail_email TEXT,
ADD COLUMN IF NOT EXISTS gmail_connected_at TIMESTAMPTZ;

-- Add index for Gmail email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_gmail_email ON profiles(gmail_email);
