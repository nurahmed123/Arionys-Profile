import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, ExternalLink, Users } from "lucide-react"

export default async function ExplorePage() {
  const supabase = await createClient()

  // Fetch public profiles with their block counts
  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      *,
      profile_blocks!inner(count)
    `)
    .eq("is_public", true)
    .not("username", "is", null)
    .limit(12)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AN</span>
            </div>
            <span className="font-bold text-xl">Arionys Profile</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold">Explore Profiles</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing profiles created by our community. Get inspired for your own profile!
          </p>
        </div>

        {/* Profiles Grid */}
        {profiles && profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const initials = profile.display_name
                ? profile.display_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                : profile.username?.[0]?.toUpperCase() || "U"

              return (
                <Card key={profile.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage
                        src={profile.avatar_url || "/placeholder.svg"}
                        alt={profile.display_name || "User"}
                      />
                      <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl text-balance">{profile.display_name || profile.username}</CardTitle>
                    {profile.username && profile.display_name && <CardDescription>@{profile.username}</CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground text-center line-clamp-3 text-pretty">
                        {profile.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                      {profile.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {profile.theme || "default"} theme
                      </Badge>
                    </div>

                    <Link href={`/${profile.username}`}>
                      <Button className="w-full">
                        View Profile
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Public Profiles Yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a public profile!</p>
            <Link href="/auth/sign-up">
              <Button>Create Your Profile</Button>
            </Link>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center py-16 mt-16 border-t">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Profile?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community and showcase your work, skills, and personality with a beautiful profile.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="text-lg px-8">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
