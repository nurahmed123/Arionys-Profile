import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Get all public profiles for dynamic sitemap generation
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username, updated_at")
    .eq("is_public", true)
    .not("username", "is", null)

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://Arionys Profile.vercel.app"
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/sign-up`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ]

  // Dynamic profile pages
  const profilePages =
    profiles?.map((profile) => ({
      url: `${baseUrl}/${profile.username}`,
      lastModified: profile.updated_at || currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    })) || []

  const allPages = [...staticPages, ...profilePages]

  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  })
}
