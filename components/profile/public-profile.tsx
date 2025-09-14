"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share2, MapPin, Globe, Phone, Check } from "lucide-react"
import { ProfileBlocksDisplay } from "./profile-blocks-display"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface PublicProfileProps {
  profile: any
  blocks: any[]
  isPreview?: boolean // Added isPreview prop for mobile preview mode
}

export function PublicProfile({ profile, blocks, isPreview = false }: PublicProfileProps) {
  const [copied, setCopied] = useState(false)
  // Set the theme to classic for black and white styling
  const theme = getTheme("classic")
  const classes = getThemeClasses(theme)

  useEffect(() => {
    if (isPreview) return

    const trackView = async () => {
      try {
        console.log("[v0] Tracking profile view for profile:", profile.id)
        const response = await fetch("/api/profile-views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileId: profile.id,
          }),
        })
        console.log("[v0] Profile view response:", response.status)
      } catch (error) {
        console.error("[v0] Failed to track profile view:", error)
      }
    }

    const trackVisit = async () => {
      try {
        console.log("[v0] Starting comprehensive visitor tracking for profile:", profile.id)

        // Get comprehensive visitor data
        const visitorData = {
          profileId: profile.id,
          userAgent: navigator.userAgent,
          language: navigator.language,
          languages: navigator.languages,
          platform: navigator.platform,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          screenWidth: screen.width,
          screenHeight: screen.height,
          screenColorDepth: screen.colorDepth,
          screenPixelDepth: screen.pixelDepth,
          windowWidth: window.innerWidth,
          windowHeight: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          referrer: document.referrer,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          touchSupport: "ontouchstart" in window,
          maxTouchPoints: navigator.maxTouchPoints || 0,
          hardwareConcurrency: navigator.hardwareConcurrency || 0,
          connection: (navigator as any).connection
            ? {
                effectiveType: (navigator as any).connection.effectiveType,
                downlink: (navigator as any).connection.downlink,
                rtt: (navigator as any).connection.rtt,
              }
            : null,
          memory: (performance as any).memory
            ? {
                usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
                totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
                jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit,
              }
            : null,
        }

        console.log("[v0] Visitor data collected:", visitorData)

        const response = await fetch("/api/profile-visits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(visitorData),
        })

        const result = await response.json()
        console.log("[v0] Profile visit tracking response:", response.status, result)

        if (!response.ok) {
          console.error("[v0] Profile visit tracking failed:", result)
        } else {
          console.log("[v0] Profile visit tracked successfully")
        }
      } catch (error) {
        console.error("[v0] Failed to track profile visit:", error)
      }
    }

    if (profile?.id) {
      console.log("[v0] Profile ID found, starting tracking:", profile.id)
      trackView()
      trackVisit()
    } else {
      console.log("[v0] No profile ID found, skipping tracking")
    }
  }, [profile?.id, isPreview])

  const initials = profile.display_name
    ? profile.display_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : profile.username?.[0]?.toUpperCase() || "U"

  const handleShare = async () => {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.display_name || profile.username} - Arionys Profile`,
          text: profile.bio || `Check out ${profile.display_name || profile.username}'s profile`,
          url: url,
        })
      } catch (err) {
        // Fallback to clipboard
        handleCopyLink()
      }
    } else {
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <div className={`min-h-screen ${classes.background}`}>
      {!isPreview && (
        <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AN</span>
              </div>
              <span className="font-bold text-xl">Arionys Profile</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="bg-transparent">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                {copied ? "Copied!" : "Share"}
              </Button>
              <a href="/" target="_blank" rel="noreferrer">
                <Button size="sm">Create Your Profile</Button>
              </a>
            </div>
          </div>
        </header>
      )}

      <main className={`container mx-auto px-4 py-8 ${isPreview ? "max-w-sm" : "max-w-4xl"}`}>
        {/* Profile Header */}
        <section id="profile">
          <Card className={`${classes.card} mb-8`}>
            <CardContent className={`${isPreview ? "p-4" : "p-8"}`}>
              <div className="text-center space-y-6">
                <Avatar className={`${isPreview ? "h-20 w-20" : "h-32 w-32"} mx-auto`}>
                  <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name || "User"} />
                  <AvatarFallback className={`${isPreview ? "text-xl" : "text-3xl"}`}>{initials}</AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <div>
                    <h1 className={`${isPreview ? "text-2xl" : "text-4xl"} ${classes.heading} mb-2 text-balance`}>
                      {profile.display_name || profile.username}
                    </h1>
                    {profile.username && profile.display_name && profile.show_username && (
                      <p className={`${isPreview ? "text-base" : "text-lg"} ${classes.muted} mb-3`}>
                        @{profile.username}
                      </p>
                    )}
                    {profile.bio && (
                      <p
                        className={`${isPreview ? "text-sm" : "text-lg"} ${classes.muted} max-w-2xl mx-auto text-pretty`}
                      >
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {/* Quick Contact Info */}
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                    {profile.location && (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.website_url && (
                      <a
                        href={
                          profile.website_url.startsWith("http")
                            ? profile.website_url
                            : `https://${profile.website_url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                    {profile.phone && (
                      <a
                        href={`tel:${profile.phone}`}
                        className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <Phone className="h-4 w-4" />
                        <span>Call</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Profile Blocks */}
        <section id="content">
          <div className={classes.spacing}>
            <ProfileBlocksDisplay blocks={blocks} theme={profile.theme} profileId={profile.id} />
          </div>
        </section>

        {!isPreview && (
          <div className="text-center py-12 border-t mt-12">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">AN</span>
                </div>
                <span className="font-semibold text-sm">Arionys Profile</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Create your own profile at{" "}
                <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                  Arionys [ profile.arionys.com ]
                </a>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
