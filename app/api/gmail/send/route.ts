import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendGmailMessage, refreshGmailToken } from "@/lib/gmail"

interface EmailRequest {
  subject: string
  body: string
  isHtml: boolean
  recipients: string[]
  sendType: "individual" | "bulk"
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const emailData: EmailRequest = await request.json()
    const { subject, body, isHtml, recipients, sendType } = emailData

    // Validate request
    if (!subject.trim() || !body.trim() || !recipients.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (recipients.length > 1000) {
      return NextResponse.json({ error: "Too many recipients (max 1000)" }, { status: 400 })
    }

    // Get user's Gmail tokens
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gmail_access_token, gmail_refresh_token, gmail_email")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    if (!profile.gmail_access_token || !profile.gmail_refresh_token) {
      return NextResponse.json({ error: "Gmail not connected" }, { status: 400 })
    }

    let accessToken = profile.gmail_access_token

    // Function to send email with token refresh retry
    const sendWithRetry = async (to: string, retryCount = 0): Promise<void> => {
      try {
        await sendGmailMessage(accessToken, to, subject, body, isHtml)
      } catch (error: any) {
        // If token expired and we haven't retried yet, refresh and try again
        if (error.message?.includes("401") && retryCount === 0 && profile.gmail_refresh_token) {
          try {
            accessToken = await refreshGmailToken(profile.gmail_refresh_token)

            // Update token in database
            await supabase.from("profiles").update({ gmail_access_token: accessToken }).eq("id", user.id)

            // Retry sending
            await sendGmailMessage(accessToken, to, subject, body, isHtml)
          } catch (refreshError) {
            throw new Error("Failed to refresh Gmail token. Please reconnect your Gmail account.")
          }
        } else {
          throw error
        }
      }
    }

    const emailResults: Array<{ success: boolean; recipient: string; error?: string }> = []

    // Log email campaign first to get campaign ID
    let campaignId: string | null = null
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from("email_campaigns")
        .insert({
          user_id: user.id,
          subject,
          body,
          is_html: isHtml,
          send_type: sendType,
          recipients_count: recipients.length,
          sent_count: 0, // Will be updated after sending
          failed_count: 0,
          sent_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (campaignError) throw campaignError
      campaignId = campaign.id
    } catch (logError) {
      console.error("Failed to create email campaign:", logError)
      return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
    }

    if (sendType === "bulk") {
      // For bulk emails, send to all recipients at once
      try {
        await sendWithRetry(recipients.join(", "))
        // Mark all as successful
        for (const recipient of recipients) {
          emailResults.push({ success: true, recipient })
        }
      } catch (error: any) {
        // Mark all as failed
        for (const recipient of recipients) {
          emailResults.push({ success: false, recipient, error: error.message })
        }
      }
    } else {
      // Individual emails - send them with proper concurrency control
      const sendPromises = recipients.map(async (recipient) => {
        try {
          await sendWithRetry(recipient)
          return { success: true, recipient }
        } catch (error: any) {
          return { success: false, recipient, error: error.message }
        }
      })

      // Process emails with rate limiting (5 concurrent sends)
      const chunks = []
      for (let i = 0; i < sendPromises.length; i += 5) {
        chunks.push(sendPromises.slice(i, i + 5))
      }

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(chunk)
        emailResults.push(...chunkResults)
        // Small delay between chunks to avoid rate limits
        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    // Calculate final counts from results
    const sentCount = emailResults.filter((r) => r.success).length
    const failedCount = emailResults.filter((r) => !r.success).length
    const errors = emailResults.filter((r) => !r.success).map((r) => `Failed to send to ${r.recipient}: ${r.error}`)

    // Create email records based on results
    const emailRecords = emailResults.map((result) => ({
      campaign_id: campaignId,
      user_id: user.id,
      recipient_email: result.recipient,
      subject,
      body,
      is_html: isHtml,
      send_method: "gmail",
      status: result.success ? "sent" : "failed",
      error_message: result.success ? undefined : result.error,
      sent_at: result.success ? new Date().toISOString() : undefined,
    }))

    if (emailRecords.length > 0) {
      try {
        await supabase.from("sent_emails").insert(emailRecords)
      } catch (error) {
        console.error("Failed to store email records:", error)
        // Don't return error here, continue to update campaign counts
      }
    }

    // Update campaign with accurate counts
    try {
      console.log("[v0] Updating campaign", campaignId, "with counts:", { sentCount, failedCount })

      const { data: updateData, error: updateError } = await supabase
        .from("email_campaigns")
        .update({
          sent_count: sentCount,
          failed_count: failedCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId)
        .eq("user_id", user.id) // Ensure we only update campaigns belonging to this user
        .select()

      if (updateError) {
        console.error("[v0] Failed to update campaign counts:", updateError)
        const { data: existingCampaign, error: checkError } = await supabase
          .from("email_campaigns")
          .select("id, sent_count, failed_count")
          .eq("id", campaignId)
          .eq("user_id", user.id)
          .single()

        console.error("[v0] Campaign check result:", { existingCampaign, checkError })

        return NextResponse.json({
          success: true,
          sent: sentCount,
          failed: failedCount,
          errors: [...errors, `Campaign update failed: ${updateError.message}`],
          warning: "Emails sent but campaign status may not reflect correctly",
        })
      } else {
        console.log("[v0] Campaign updated successfully:", updateData)

        if (updateData && updateData.length > 0) {
          const updatedCampaign = updateData[0]
          if (updatedCampaign.sent_count !== sentCount || updatedCampaign.failed_count !== failedCount) {
            console.error("[v0] Campaign update verification failed:", {
              expected: { sentCount, failedCount },
              actual: { sent_count: updatedCampaign.sent_count, failed_count: updatedCampaign.failed_count },
            })
          }
        }
      }
    } catch (error) {
      console.error("[v0] Failed to update campaign counts:", error)
      return NextResponse.json({
        success: true,
        sent: sentCount,
        failed: failedCount,
        errors: [...errors, `Campaign update failed: ${error instanceof Error ? error.message : "Unknown error"}`],
        warning: "Emails sent but campaign status may not reflect correctly",
      })
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      errors: errors,
    })
  } catch (error) {
    console.error("Email send error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send email" },
      { status: 500 },
    )
  }
}
