-- Add updated_at column to email_campaigns table to track when counts were last updated
ALTER TABLE email_campaigns 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing campaigns to have updated_at set to created_at
UPDATE email_campaigns 
SET updated_at = created_at 
WHERE updated_at IS NULL;
