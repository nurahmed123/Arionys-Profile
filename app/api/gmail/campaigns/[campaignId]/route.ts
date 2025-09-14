import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest, { params }: { params: { campaignId: string } }) {
  try {
    console.log("[v0] DELETE request for campaign:", params.campaignId)

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.log("[v0] User authentication failed:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] User authenticated:", user.id)

    // Verify the campaign belongs to the user
    const { data: campaign, error: campaignError } = await supabase
      .from("email_campaigns")
      .select("id, subject, user_id")
      .eq("id", params.campaignId)
      .eq("user_id", user.id)
      .single()

    if (campaignError || !campaign) {
      console.log("[v0] Campaign not found or access denied:", campaignError)
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
    }

    console.log("[v0] Campaign found:", campaign.subject, "proceeding with deletion")

    console.log("[v0] Deleting sent emails for campaign:", params.campaignId)
    const { data: deletedEmails, error: emailsError } = await supabase
      .from("sent_emails")
      .delete()
      .eq("campaign_id", params.campaignId)
      .select("id")

    if (emailsError) {
      console.error("[v0] Error deleting sent emails:", emailsError)
      return NextResponse.json({ error: "Failed to delete campaign emails" }, { status: 500 })
    }

    console.log("[v0] Sent emails deleted successfully:", deletedEmails?.length || 0, "emails")

    console.log("[v0] Deleting campaign:", params.campaignId)
    const { data: deletedCampaign, error: deleteError } = await supabase
      .from("email_campaigns")
      .delete()
      .eq("id", params.campaignId)
      .eq("user_id", user.id)
      .select("id, subject")

    if (deleteError) {
      console.error("[v0] Error deleting campaign:", deleteError)
      return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 })
    }

    if (!deletedCampaign || deletedCampaign.length === 0) {
      console.error("[v0] Campaign deletion failed - no rows affected")
      return NextResponse.json({ error: "Campaign deletion failed" }, { status: 500 })
    }

    console.log("[v0] Campaign deleted successfully:", deletedCampaign[0].subject)
    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
      deletedCampaign: deletedCampaign[0],
    })
  } catch (error) {
    console.error("[v0] Error in DELETE /api/gmail/campaigns/[campaignId]:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
