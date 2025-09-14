-- Sync campaign counts with actual sent emails
-- This fixes campaigns that show wrong counts

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
);

-- Update campaigns that have no sent_emails records but should be marked as failed
UPDATE email_campaigns 
SET 
    failed_count = recipients_count,
    sent_count = 0,
    updated_at = NOW()
WHERE 
    sent_count = 0 
    AND failed_count = 0 
    AND recipients_count > 0
    AND created_at < NOW() - INTERVAL '2 seconds'
    AND id NOT IN (
        SELECT DISTINCT campaign_id 
        FROM sent_emails 
        WHERE campaign_id IS NOT NULL
    );
