import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // Get user's email campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from("email_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (campaignsError) {
      throw campaignsError
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from("email_campaigns")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)

    if (countError) {
      throw countError
    }

    return NextResponse.json({
      campaigns: campaigns || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Email campaigns error:", error)
    return NextResponse.json({ error: "Failed to get email campaigns" }, { status: 500 })
  }
}
