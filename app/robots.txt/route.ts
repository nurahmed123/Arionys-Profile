import { NextResponse } from "next/server"

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://Arionys Profile.vercel.app"

  const robotsTxt = `User-agent: *
Allow: /
Allow: /explore
Allow: /auth/sign-up

# Disallow private/protected areas
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /profile/edit
Disallow: /profile/blocks
Disallow: /auth/login
Disallow: /auth/forgot-password
Disallow: /auth/reset-password
Disallow: /auth/sign-up-success
Disallow: /api/

# Allow public profile pages (dynamic routes)
Allow: /*/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional - be respectful)
Crawl-delay: 1`

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
    },
  })
}
