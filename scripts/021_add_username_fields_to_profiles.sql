-- Add username and show_username fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS show_username BOOLEAN DEFAULT true;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Update existing profiles to have usernames based on email
UPDATE profiles 
SET username = LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
WHERE username IS NULL AND email IS NOT NULL;

-- Add constraint to ensure username is lowercase and alphanumeric
ALTER TABLE profiles 
ADD CONSTRAINT check_username_format 
CHECK (username ~ '^[a-z0-9_]+$' AND LENGTH(username) >= 3 AND LENGTH(username) <= 50);
