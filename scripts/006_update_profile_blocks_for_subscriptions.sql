-- Add subscription-specific fields to profile_blocks table
ALTER TABLE public.profile_blocks 
ADD COLUMN IF NOT EXISTS subscription_settings JSONB DEFAULT '{}';

-- Update existing blocks to have empty subscription settings
UPDATE public.profile_blocks 
SET subscription_settings = '{}' 
WHERE subscription_settings IS NULL;
