-- Add missing UPDATE policy for email_campaigns table
-- This allows users to update their own email campaigns (needed for sent_count updates)

CREATE POLICY "email_campaigns_update_own"
  ON email_campaigns FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also add DELETE policy for completeness (needed for campaign deletion)
CREATE POLICY "email_campaigns_delete_own"
  ON email_campaigns FOR DELETE
  USING (auth.uid() = user_id);
