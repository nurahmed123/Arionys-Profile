-- Script to sync campaign counts with actual sent email records
-- This fixes campaigns that show 0 sent but have sent emails in the database

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
WHERE 
  sent_count = 0 
  AND failed_count = 0 
  AND EXISTS (
    SELECT 1 
    FROM sent_emails 
    WHERE sent_emails.campaign_id = email_campaigns.id
  );
