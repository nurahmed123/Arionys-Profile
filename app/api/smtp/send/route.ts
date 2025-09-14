import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import nodemailer from "nodemailer"

interface EmailRequest {
  subject: string
  body: string
  isHtml: boolean
  recipients: string[]
  sendType: "individual" | "bulk"
  smtpSettingId: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const emailData: EmailRequest = await request.json()
    const { subject, body, isHtml, recipients, sendType, smtpSettingId } = emailData

    if (!subject?.trim() || !body?.trim() || !recipients?.length || !smtpSettingId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (recipients.length > 1000) {
      return NextResponse.json({ error: "Too many recipients (max 1000)" }, { status: 400 })
    }

    const { data: smtpSetting, error: smtpError } = await supabase
      .from("smtp_settings")
      .select("*")
      .eq("id", smtpSettingId)
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    if (smtpError || !smtpSetting) {
      return NextResponse.json({ error: "SMTP settings not found" }, { status: 404 })
    }

    const isGmail = smtpSetting.host.toLowerCase().includes("gmail")
    const port = Number.parseInt(smtpSetting.port.toString())

    const transporterConfig: any = {
      host: smtpSetting.host,
      port: port,
      secure: port === 465, // true for 465, false for other ports like 587
      auth: {
        user: smtpSetting.username,
        pass: smtpSetting.password,
      },
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    }

    if (isGmail) {
      transporterConfig.service = "gmail"
      transporterConfig.auth.type = "OAuth2"
      transporterConfig.auth.user = smtpSetting.username
      transporterConfig.auth.pass = smtpSetting.password
      delete transporterConfig.auth.type
      transporterConfig.tls = {
        rejectUnauthorized: false,
      }
    } else {
      transporterConfig.tls = {
        rejectUnauthorized: false,
      }
    }

    const transporter = nodemailer.createTransport(transporterConfig)

    try {
      await transporter.verify()
    } catch (verifyError: any) {
      console.error("SMTP verification failed:", verifyError)
      return NextResponse.json(
        {
          error: "SMTP connection failed. Please check your settings.",
          details: verifyError.message,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Starting email send process...")

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
          sent_count: 0,
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

    const emailResults: Array<{ success: boolean; recipient: string; error?: string }> = []

    if (sendType === "bulk") {
      try {
        await transporter.sendMail({
          from: `${smtpSetting.display_name} <${smtpSetting.username}>`,
          to: recipients.join(", "),
          subject,
          [isHtml ? "html" : "text"]: body,
        })
        for (const recipient of recipients) {
          emailResults.push({ success: true, recipient })
        }
      } catch (error: any) {
        for (const recipient of recipients) {
          emailResults.push({ success: false, recipient, error: error.message })
        }
      }
    } else {
      const sendPromises = recipients.map(async (recipient, index) => {
        try {
          await transporter.sendMail({
            from: `${smtpSetting.display_name} <${smtpSetting.username}>`,
            to: recipient,
            subject,
            [isHtml ? "html" : "text"]: body,
          })
          return { success: true, recipient }
        } catch (error: any) {
          return { success: false, recipient, error: error.message }
        }
      })

      const chunks = []
      for (let i = 0; i < sendPromises.length; i += 5) {
        chunks.push(sendPromises.slice(i, i + 5))
      }

      for (const chunk of chunks) {
        const chunkResults = await Promise.all(chunk)
        emailResults.push(...chunkResults)
        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    const sentCount = emailResults.filter((r) => r.success).length
    const failedCount = emailResults.filter((r) => !r.success).length
    const errors = emailResults.filter((r) => !r.success).map((r) => `Failed to send to ${r.recipient}: ${r.error}`)

    const emailRecords = emailResults.map((result) => ({
      campaign_id: campaignId,
      user_id: user.id,
      recipient_email: result.recipient,
      subject,
      body,
      is_html: isHtml,
      send_method: "smtp",
      smtp_setting_id: smtpSettingId,
      status: result.success ? "sent" : "failed",
      error_message: result.success ? undefined : result.error,
      sent_at: result.success ? new Date().toISOString() : undefined,
    }))

    if (emailRecords.length > 0) {
      try {
        await supabase.from("sent_emails").insert(emailRecords)
      } catch (error) {
        console.error("Failed to store email records:", error)
      }
    }

    try {
      console.log("[v0] Updating campaign", campaignId, "with counts:", { sentCount, failedCount })

      const { data: existingCampaign, error: checkError } = await supabase
        .from("email_campaigns")
        .select("id, sent_count, failed_count, user_id")
        .eq("id", campaignId)
        .single()

      console.log("[v0] Campaign check before update:", { existingCampaign, checkError })

      if (checkError || !existingCampaign) {
        console.error("[v0] Campaign not found before update:", { campaignId, checkError })
        return NextResponse.json({
          success: true,
          sent: sentCount,
          failed: failedCount,
          errors: [...errors, `Campaign not found for update: ${campaignId}`],
          warning: "Emails sent but campaign status may not reflect correctly",
        })
      }

      const {
        data: updateData,
        error: updateError,
        count,
      } = await supabase
        .from("email_campaigns")
        .update({
          sent_count: sentCount,
          failed_count: failedCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId)
        .eq("user_id", user.id)
        .select()

      console.log("[v0] Update result:", { updateData, updateError, count, campaignId, userId: user.id })

      if (updateError) {
        console.error("[v0] Failed to update campaign counts:", updateError)
        return NextResponse.json({
          success: true,
          sent: sentCount,
          failed: failedCount,
          errors: [...errors, `Campaign update failed: ${updateError.message}`],
          warning: "Emails sent but campaign status may not reflect correctly",
        })
      }

      const { data: verifyData, error: verifyError } = await supabase
        .from("email_campaigns")
        .select("id, sent_count, failed_count, updated_at")
        .eq("id", campaignId)
        .single()

      console.log("[v0] Campaign verification after update:", { verifyData, verifyError })

      if (verifyData) {
        if (verifyData.sent_count !== sentCount || verifyData.failed_count !== failedCount) {
          console.error("[v0] Campaign update verification failed:", {
            expected: { sentCount, failedCount },
            actual: { sent_count: verifyData.sent_count, failed_count: verifyData.failed_count },
          })
          return NextResponse.json({
            success: true,
            sent: sentCount,
            failed: failedCount,
            errors: [...errors, "Campaign counts were not updated correctly in database"],
            warning: "Emails sent but campaign status may not reflect correctly",
          })
        } else {
          console.log("[v0] Campaign update verified successfully")
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
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
