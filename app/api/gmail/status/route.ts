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
    // Get user's Gmail connection status
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("gmail_access_token, gmail_refresh_token, gmail_email, gmail_connected_at")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const isConnected = !!(profile.gmail_access_token && profile.gmail_refresh_token)

    return NextResponse.json({
      isConnected,
      email: profile.gmail_email,
      connectedAt: profile.gmail_connected_at,
    })
  } catch (error) {
    console.error("Gmail status error:", error)
    return NextResponse.json({ error: "Failed to get Gmail status" }, { status: 500 })
  }
}
