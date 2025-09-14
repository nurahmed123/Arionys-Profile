import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    // Remove Gmail tokens from database
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        gmail_access_token: null,
        gmail_refresh_token: null,
        gmail_email: null,
        gmail_connected_at: null,
      })
      .eq("id", user.id)

    if (updateError) {
      throw new Error("Failed to disconnect Gmail")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Gmail disconnect error:", error)
    return NextResponse.json({ error: "Failed to disconnect Gmail" }, { status: 500 })
  }
}
