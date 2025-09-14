-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS website_url text,
-- <CHANGE> Added avatar_url column for profile pictures
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Update existing website column data to website_url if needed
UPDATE profiles 
SET website_url = website 
WHERE website IS NOT NULL AND website_url IS NULL;

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);
