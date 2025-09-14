-- Add updated_at column if it doesn't exist and fix any campaign update issues
DO $$ 
BEGIN
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_campaigns' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE email_campaigns ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

    -- Update any campaigns that have sent emails but show 0 sent_count
    UPDATE email_campaigns 
    SET 
        sent_count = (
            SELECT COUNT(*) 
            FROM sent_emails 
            WHERE sent_emails.campaign_id = email_campaigns.id 
            AND sent_emails.status = 'sent'
        ),
        failed_count = (
            SELECT COUNT(*) 
            FROM sent_emails 
            WHERE sent_emails.campaign_id = email_campaigns.id 
            AND sent_emails.status = 'failed'
        ),
        updated_at = NOW()
    WHERE id IN (
        SELECT DISTINCT campaign_id 
        FROM sent_emails 
        WHERE campaign_id IS NOT NULL
    )
    AND (sent_count = 0 OR sent_count IS NULL);

END $$;
