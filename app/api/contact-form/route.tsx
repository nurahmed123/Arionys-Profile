import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { profileId, blockId, name, subject, message, notificationEmail } = await request.json()

    console.log("[v0] Contact form submission received:", {
      profileId,
      blockId,
      name: name ? "provided" : "missing",
      subject: subject ? "provided" : "missing",
      message: message ? "provided" : "missing",
      notificationEmail,
    })

    if (!profileId || !name?.trim() || !subject?.trim() || !message?.trim()) {
      console.log("[v0] Missing required fields:", {
        profileId: !profileId ? "missing" : "provided",
        name: !name?.trim() ? "missing" : "provided",
        subject: !subject?.trim() ? "missing" : "provided",
        message: !message?.trim() ? "missing" : "provided",
      })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log("[v0] Querying profile with ID:", profileId)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, username, gmail_email, display_name")
      .eq("id", profileId)
      .single()

    console.log("[v0] Profile query result:", { profile, profileError })

    if (profileError || !profile) {
      console.log("[v0] Profile not found - profileError:", profileError)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(profile.id)

    console.log("[v0] Auth user lookup:", { user: user?.email, userError })

    const recipientEmail = notificationEmail || profile.gmail_email || user?.email

    console.log("[v0] Email resolution:", {
      notificationEmail,
      gmail_email: profile.gmail_email,
      auth_email: user?.email,
      final_recipient: recipientEmail,
    })

    if (!recipientEmail) {
      console.log("[v0] No notification email found after all fallbacks")
      return NextResponse.json(
        {
          error:
            "No notification email configured for this profile. Please set up your Gmail integration or configure a notification email in your contact block settings.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Using recipient email:", recipientEmail)

    const smtpConfig = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    }

    // Check if SMTP environment variables are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        {
          error: "SMTP configuration not found. Please configure SMTP_USER and SMTP_PASSWORD environment variables.",
        },
        { status: 500 },
      )
    }

    // Prepare email content
    const emailSubject = `Contact Form: ${subject}`
    const htmlEmailBody = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; line-height: 1.7; color: #0f172a;">
    <div style="max-width: 620px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);">

        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 48px 32px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 700; letter-spacing: -0.5px;">
                📬 New Contact Message
            </h1>
            <p style="color: rgba(255,255,255,0.85); margin: 12px 0 0; font-size: 15px;">
                Someone reached out through your profile
            </p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 32px;">

            <!-- Contact Info -->
            <div style="margin-bottom: 32px;">
                <div style="background-color: #f9fafb; border-left: 5px solid #6366f1; padding: 20px 24px; margin-bottom: 16px; border-radius: 12px;">
                    <h3 style="margin: 0 0 6px; color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px;">
                        👤 From
                    </h3>
                    <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">
                        ${name}
                    </p>
                </div>
                
                <div style="background-color: #f9fafb; border-left: 5px solid #000000; padding: 20px 24px; margin-bottom: 16px; border-radius: 12px;">
                    <h3 style="margin: 0 0 6px; color: #475569; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px;">
                        📋 Subject
                    </h3>
                    <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 600;">
                        ${subject}
                    </p>
                </div>
            </div>
            
            <!-- Message -->
            <div style="background-color: #ffffff; border: 2px solid #e5e7eb; border-radius: 14px; padding: 28px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 16px; color: #334155; font-size: 16px; font-weight: 700; display: flex; align-items: center;">
                    💬 Message
                </h3>
                <div style="color: #475569; font-size: 16px; line-height: 1.75; background-color: #f8fafc; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6; white-space: pre-wrap;">
                    ${message}
                </div>
            </div>
            
            <!-- Reply Button -->
            <div style="text-align: center;">
                <a href="mailto:${name.replace(/[<>]/g, "")}" 
                   style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35); transition: all 0.3s ease;">
                    ↩️ Reply to ${name}
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #64748b; font-size: 14px;">
                This message was sent through your profile contact form
            </p>
            <div style="margin-top: 16px;">
                <span style="display: inline-block; width: 7px; height: 7px; background-color: #000000; border-radius: 50%; margin: 0 5px;"></span>
                <span style="display: inline-block; width: 7px; height: 7px; background-color: #3b82f6; border-radius: 50%; margin: 0 5px;"></span>
                <span style="display: inline-block; width: 7px; height: 7px; background-color: #8b5cf6; border-radius: 50%; margin: 0 5px;"></span>
            </div>
        </div>
    </div>
</body>
</html>

    `

    const plainTextEmailBody = `
You received a new message from your profile contact form:

👤 From: ${name}
📋 Subject: ${subject}

💬 Message:
${message}

---
This message was sent through your profile contact form.
    `.trim()

    try {
      const transporter = nodemailer.createTransport(smtpConfig)

      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || "Profile Contact Form"}" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: emailSubject,
        text: plainTextEmailBody,
        html: htmlEmailBody,
      })

      console.log("[v0] Email sent successfully to:", recipientEmail)
    } catch (emailError: any) {
      console.error("[v0] Failed to send email:", emailError)
      return NextResponse.json(
        {
          error: "Failed to send notification email",
          details: emailError.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, message: "Message sent successfully" })
  } catch (error: any) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
