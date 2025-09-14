import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { profileId, email, name, source } = await request.json()

    if (!profileId || !email) {
      return NextResponse.json({ error: "Profile ID and email are required" }, { status: 400 })
    }

    const supabase = await createClient()

    const subscriberIP =
      request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Get geolocation data from IP (using a free service)
    let country = null
    let city = null

    try {
      if (subscriberIP !== "unknown" && !subscriberIP.includes("127.0.0.1") && !subscriberIP.includes("localhost")) {
        const geoResponse = await fetch(`http://ip-api.com/json/${subscriberIP.split(",")[0]}`)
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          if (geoData.status === "success") {
            country = geoData.country
            city = geoData.city
          }
        }
      }
    } catch (error) {
      console.log("Geolocation failed for subscription:", error)
    }

    // Insert subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        profile_id: profileId,
        subscriber_email: email.toLowerCase().trim(),
        subscriber_name: name?.trim() || null,
        source: source || "profile_block",
        subscriber_ip: subscriberIP,
        subscriber_country: country,
        subscriber_city: city,
      })
      .select()
      .single()

    if (error) {
      // Handle duplicate subscription
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already subscribed" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's profile
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get subscriptions for this profile
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Get subscriptions error:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
