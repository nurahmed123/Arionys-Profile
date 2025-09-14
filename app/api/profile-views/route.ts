import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }
    
    const { profileId } = await request.json()

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(profileId)) {
      console.error("[v0] Invalid UUID format:", profileId)
      return NextResponse.json({ error: "Invalid profile ID format" }, { status: 400 })
    }

    // Get client IP and user agent
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    console.log("[v0] Tracking profile view:", { profileId, clientIP, userAgent })

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profileId)
      .single()

    if (profileError || !profile) {
      console.error("[v0] Profile not found:", profileId, profileError)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const { error } = await supabase.from("profile_visits").insert({
      profile_id: profileId,
      visitor_ip: clientIP, // Changed from ip_address to visitor_ip to match database schema
      user_agent: userAgent,
      visited_at: new Date().toISOString(),
    })

    if (error) {
      console.error("[v0] Error tracking profile view:", error)
      return NextResponse.json({ error: "Failed to track view", details: error.message }, { status: 500 })
    }

    console.log("[v0] Profile view tracked successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in profile views API:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
