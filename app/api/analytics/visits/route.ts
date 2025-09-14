import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Helper function to parse user agent for device and browser info
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
  if (ua.includes("chrome") && !ua.includes("edg")) {
    browserName = "Chrome"
  } else if (ua.includes("firefox")) {
    browserName = "Firefox"
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browserName = "Safari"
  } else if (ua.includes("edg")) {
    browserName = "Edge"
  }

  return { deviceType, browserName }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
    }
    
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")
    const days = Number.parseInt(searchParams.get("days") || "30")

    if (!profileId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId)) {
      return NextResponse.json({ error: "Valid Profile ID is required" }, { status: 400 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("id").eq("id", profileId).single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]

    let dailyStats = []
    let countryStats = []
    let totalVisits = 0
    let deviceStats: any[] = []
    let browserStats: any[] = []
    let referrerStats: any[] = []
    let hourlyStats: any[] = []

    try {
      const { data: dailyData, error: dailyError } = await supabase
        .from("daily_visit_stats")
        .select("*")
        .eq("profile_id", profileId)
        .gte("visit_date", startDate)
        .order("visit_date", { ascending: true })

      if (!dailyError) {
        dailyStats = dailyData || []
      }
    } catch (error) {
      console.log("[v0] Daily stats table not available, using fallback")
    }

    try {
      const { data: countryData, error: countryError } = await supabase
        .from("country_visit_stats")
        .select("*")
        .eq("profile_id", profileId)
        .order("visit_count", { ascending: false })
        .limit(10)

      if (!countryError) {
        countryStats = countryData || []
      }
    } catch (error) {
      console.log("[v0] Country stats table not available, using fallback")
    }

    const { count } = await supabase
      .from("profile_visits")
      .select("*", { count: "exact", head: true })
      .eq("profile_id", profileId)

    totalVisits = count || 0

    const { data: visits } = await supabase
      .from("profile_visits")
      .select("visited_at, visitor_ip, visitor_country, user_agent, referrer")
      .eq("profile_id", profileId)
      .gte("visited_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())

    if (visits && visits.length > 0) {
      const deviceMap = new Map()
      const browserMap = new Map()

      visits.forEach((visit) => {
        const { deviceType, browserName } = parseUserAgent(visit.user_agent || "")

        // Count devices
        deviceMap.set(deviceType, (deviceMap.get(deviceType) || 0) + 1)

        // Count browsers
        browserMap.set(browserName, (browserMap.get(browserName) || 0) + 1)
      })

      deviceStats = Array.from(deviceMap.entries())
        .map(([device, count]) => ({ device_type: device, visit_count: count }))
        .sort((a, b) => b.visit_count - a.visit_count)

      browserStats = Array.from(browserMap.entries())
        .map(([browser, count]) => ({ browser_name: browser, visit_count: count }))
        .sort((a, b) => b.visit_count - a.visit_count)

      const referrerMap = new Map()
      visits.forEach((visit) => {
        const source = parseTrafficSource(visit.referrer)
        referrerMap.set(source, (referrerMap.get(source) || 0) + 1)
      })
      referrerStats = Array.from(referrerMap.entries())
        .map(([source, count]) => ({ traffic_source: source, visit_count: count }))
        .sort((a, b) => b.visit_count - a.visit_count)

      const hourlyMap = new Map()
      visits.forEach((visit) => {
        const hour = new Date(visit.visited_at).getHours()
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      })
      hourlyStats = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        visit_count: hourlyMap.get(hour) || 0,
      }))
    }

    if (dailyStats.length === 0 && totalVisits > 0 && visits) {
      const dailyMap = new Map()
      visits.forEach((visit) => {
        const date = visit.visited_at.split("T")[0]
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { ips: new Set(), count: 0 })
        }
        dailyMap.get(date).ips.add(visit.visitor_ip)
        dailyMap.get(date).count++
      })

      dailyStats = Array.from(dailyMap.entries())
        .map(([date, data]) => ({
          visit_date: date,
          visit_count: data.count,
          unique_visitors: data.ips.size,
        }))
        .sort((a, b) => a.visit_date.localeCompare(b.visit_date))
    }

    if (countryStats.length === 0 && totalVisits > 0 && visits) {
      const countryMap = new Map()
      visits.forEach((visit) => {
        if (visit.visitor_country) {
          if (!countryMap.has(visit.visitor_country)) {
            countryMap.set(visit.visitor_country, { ips: new Set(), count: 0 })
          }
          countryMap.get(visit.visitor_country).ips.add(visit.visitor_ip)
          countryMap.get(visit.visitor_country).count++
        }
      })

      countryStats = Array.from(countryMap.entries())
        .map(([country, data]) => ({
          visitor_country: country,
          visit_count: data.count,
          unique_visitors: data.ips.size,
        }))
        .sort((a, b) => b.visit_count - a.visit_count)
        .slice(0, 10)
    }

    return NextResponse.json({
      dailyStats,
      countryStats,
      totalVisits,
      deviceStats,
      browserStats,
      referrerStats,
      hourlyStats,
    })
  } catch (error) {
    console.error("[v0] Error in analytics API:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function parseTrafficSource(referrer: string | null) {
  if (!referrer) return "Direct"

  try {
    const url = new URL(referrer)
    const hostname = url.hostname.toLowerCase()

    if (hostname.includes("google")) return "Google"
    if (hostname.includes("bing")) return "Bing"
    if (hostname.includes("yahoo")) return "Yahoo"
    if (hostname.includes("duckduckgo")) return "DuckDuckGo"

    if (hostname.includes("facebook")) return "Facebook"
    if (hostname.includes("twitter") || hostname.includes("t.co")) return "Twitter"
    if (hostname.includes("linkedin")) return "LinkedIn"
    if (hostname.includes("instagram")) return "Instagram"
    if (hostname.includes("tiktok")) return "TikTok"
    if (hostname.includes("youtube")) return "YouTube"

    if (hostname.includes("github")) return "GitHub"
    if (hostname.includes("reddit")) return "Reddit"

    return "Other"
  } catch {
    return "Direct"
  }
}
