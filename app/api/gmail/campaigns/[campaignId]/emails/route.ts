import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify the campaign belongs to the user
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("id")
      .eq("id", params.campaignId)
      .eq("user_id", user.id) // Fixed column name from profile_id to user_id
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    // Fetch sent emails for this campaign
    const { data: emails, error: emailsError } = await supabase
      .from("sent_emails")
      .select("*")
      .eq("campaign_id", params.campaignId)
      .order("sent_at", { ascending: false })

    if (emailsError) {
      console.error("Error fetching sent emails:", emailsError)
      return NextResponse.json({ error: "Failed to fetch sent emails" }, { status: 500 })
    }

    return NextResponse.json({ emails: emails || [] })
  } catch (error) {
    console.error("Error in GET /api/gmail/campaigns/[campaignId]/emails:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
