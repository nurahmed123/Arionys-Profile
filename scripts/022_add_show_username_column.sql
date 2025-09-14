-- Add show_username column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_username BOOLEAN DEFAULT true;

-- Update existing profiles to have show_username = true by default
UPDATE profiles SET show_username = true WHERE show_username IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN profiles.show_username IS 'Whether to display username on public profile';
