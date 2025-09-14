import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Helper function to parse user agent
function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase()

  // Detect device type
  let deviceType = "desktop"
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    deviceType = "mobile"
  } else if (/tablet|ipad/i.test(ua)) {
    deviceType = "tablet"
  }

  // Detect browser
  let browserName = "unknown"
  let browserVersion = ""

  if (ua.includes("chrome") && !ua.includes("edg")) {
    browserName = "Chrome"
    const match = ua.match(/chrome\/([0-9.]+)/)
    browserVersion = match ? match[1] : ""
  } else if (ua.includes("firefox")) {
    browserName = "Firefox"
    const match = ua.match(/firefox\/([0-9.]+)/)
    browserVersion = match ? match[1] : ""
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browserName = "Safari"
    const match = ua.match(/version\/([0-9.]+)/)
    browserVersion = match ? match[1] : ""
  } else if (ua.includes("edg")) {
    browserName = "Edge"
    const match = ua.match(/edg\/([0-9.]+)/)
    browserVersion = match ? match[1] : ""
  }

  // Detect OS
  let osName = "unknown"
  let osVersion = ""

  if (ua.includes("windows")) {
    osName = "Windows"
    if (ua.includes("windows nt 10")) osVersion = "10"
    else if (ua.includes("windows nt 6.3")) osVersion = "8.1"
    else if (ua.includes("windows nt 6.2")) osVersion = "8"
    else if (ua.includes("windows nt 6.1")) osVersion = "7"
  } else if (ua.includes("mac os x")) {
    osName = "macOS"
    const match = ua.match(/mac os x ([0-9_]+)/)
    osVersion = match ? match[1].replace(/_/g, ".") : ""
  } else if (ua.includes("android")) {
    osName = "Android"
    const match = ua.match(/android ([0-9.]+)/)
    osVersion = match ? match[1] : ""
  } else if (ua.includes("iphone") || ua.includes("ipad")) {
    osName = "iOS"
    const match = ua.match(/os ([0-9_]+)/)
    osVersion = match ? match[1].replace(/_/g, ".") : ""
  } else if (ua.includes("linux")) {
    osName = "Linux"
  }

  return {
    deviceType,
    browserName,
    browserVersion,
    osName,
    osVersion,
  }
}

// Helper function to parse referrer for traffic source
function parseReferrer(referrer: string) {
  if (!referrer) return "direct"

  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()

    // Search engines
    if (hostname.includes("google")) return "google"
    if (hostname.includes("bing")) return "bing"
    if (hostname.includes("yahoo")) return "yahoo"
    if (hostname.includes("duckduckgo")) return "duckduckgo"

    // Social media
    if (hostname.includes("facebook")) return "facebook"
    if (hostname.includes("twitter") || hostname.includes("t.co")) return "twitter"
    if (hostname.includes("linkedin")) return "linkedin"
    if (hostname.includes("instagram")) return "instagram"
    if (hostname.includes("tiktok")) return "tiktok"
    if (hostname.includes("youtube")) return "youtube"

    // Other common referrers
    if (hostname.includes("github")) return "github"
    if (hostname.includes("reddit")) return "reddit"

    return hostname
  } catch {
    return "unknown"
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Profile visits API called")
    const supabase = await createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }
    
    const body = await request.json()
    console.log("[v0] Request body received:", body)

    const { profileId, ...visitorData } = body

    if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
      console.log("[v0] Invalid or missing profile ID")
      return NextResponse.json({ error: "Valid Profile ID is required" }, { status: 400 })
    }

    const { data: profileExists } = await supabase.from("profiles").select("id").eq("id", profileId).single()

    if (!profileExists) {
      console.log("[v0] Profile not found")
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get visitor information from headers
    const visitorIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      "unknown"

    const userAgent = request.headers.get("user-agent") || ""
    const referrer = request.headers.get("referer") || ""

    console.log("[v0] Visitor IP:", visitorIP)
    console.log("[v0] User Agent:", userAgent)

    const deviceInfo = parseUserAgent(userAgent)

    const trafficSource = parseReferrer(referrer)

    // Get geolocation data from IP
    let country = null
    let city = null

    try {
      if (visitorIP !== "unknown" && !visitorIP.includes("127.0.0.1") && !visitorIP.includes("localhost")) {
        const cleanIP = visitorIP.split(",")[0].trim()
        console.log("[v0] Fetching geolocation for IP:", cleanIP)

        const geoResponse = await fetch(`http://ip-api.com/json/${cleanIP}?fields=status,message,country,city`)
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          console.log("[v0] Geolocation data:", geoData)

          if (geoData.status === "success") {
            country = geoData.country
            city = geoData.city
          }
        }
      }
    } catch (error) {
      console.log("[v0] Geolocation failed:", error)
    }

    const visitData = {
      profile_id: profileId,
      visitor_ip: visitorIP,
      visitor_country: country,
      visitor_city: city,
      user_agent: userAgent,
      referrer: referrer,
      visited_at: new Date().toISOString(),
    }

    console.log("[v0] Final visit data to insert:", visitData)

    const { data, error } = await supabase.from("profile_visits").insert(visitData).select()

    if (error) {
      console.error("[v0] Error inserting visit:", error)
      if (error.code === "42501") {
        console.error("[v0] RLS policy violation - this should not happen with current policies")
        return NextResponse.json(
          {
            error: "Permission denied",
            details: "Row level security policy violation. Please check database policies.",
            code: error.code,
          },
          { status: 403 },
        )
      }
      if (error.code === "23505") {
        return NextResponse.json({ error: "Visit already recorded" }, { status: 409 })
      }
      return NextResponse.json(
        {
          error: "Failed to track visit",
          details: error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("[v0] Visit tracked successfully:", data)

    try {
      await updateVisitStats(supabase, profileId, country)
    } catch (statsError) {
      console.log("[v0] Stats update failed (non-critical):", statsError)
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in profile visits API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function updateVisitStats(supabase: any, profileId: string, country: string | null) {
  const today = new Date().toISOString().split("T")[0]

  // Update daily stats
  const { error: dailyError } = await supabase.rpc("increment_daily_visits", {
    p_profile_id: profileId,
    p_visit_date: today,
  })

  if (dailyError) {
    console.log("[v0] Daily stats update failed:", dailyError)
  }

  // Update country stats if country is available
  if (country) {
    const { error: countryError } = await supabase.rpc("increment_country_visits", {
      p_profile_id: profileId,
      p_country: country,
    })

    if (countryError) {
      console.log("[v0] Country stats update failed:", countryError)
    }
  }
}
