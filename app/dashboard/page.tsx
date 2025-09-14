import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Settings, Eye, BarChart3, Mail } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProfilePreview } from "@/components/dashboard/profile-preview"

export default async function DashboardPage() {
  const supabase = await createClient()
  if (!supabase) {
    redirect("/auth/login")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch profile blocks
  const { data: blocks } = await supabase.from("profile_blocks").select("*").eq("profile_id", user.id).order("position")

  const { data: subscribers } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("profile_id", user.id)
    .eq("is_active", true)

  console.log("[v0] Profile views_count from database:", profile?.views_count)

  const blockCount = blocks?.length || 0
  const subscriberCount = subscribers?.length || 0
  const profileViews = profile?.views_count || 0
  const profileUrl = profile?.username ? `/${profile.username}` : "#"

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {profile?.display_name || user.email?.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground">Manage your profile and track your online presence.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Blocks</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{blockCount}</div>
              <p className="text-xs text-muted-foreground">Content blocks added</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Subscribers</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriberCount}</div>
              <p className="text-xs text-muted-foreground">Active subscribers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={profile?.is_public ? "default" : "secondary"}>
                  {profile?.is_public ? "Public" : "Private"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Visibility setting</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileViews}</div>
              <p className="text-xs text-muted-foreground">{profileViews === 1 ? "Unique view" : "Unique views"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Actions */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Get started with building your profile</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/profile/edit">
                  <Button className="w-full h-auto p-6 flex flex-col items-center space-y-2">
                    <Settings className="h-8 w-8" />
                    <span className="font-medium">Edit Profile</span>
                    <span className="text-xs text-center opacity-80">Update your basic information</span>
                  </Button>
                </Link>

                <Link href="/profile/blocks">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-6 flex flex-col items-center space-y-2 bg-transparent"
                  >
                    <Plus className="h-8 w-8" />
                    <span className="font-medium">Add Content</span>
                    <span className="text-xs text-center opacity-80">Create new profile blocks</span>
                  </Button>
                </Link>

                <Link href="/dashboard/subscribers">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-6 flex flex-col items-center space-y-2 bg-transparent"
                  >
                    <Mail className="h-8 w-8" />
                    <span className="font-medium">Manage Subscribers</span>
                    <span className="text-xs text-center opacity-80">View and export email list</span>
                  </Button>
                </Link>

                <Link href={profileUrl} target="_blank">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-6 flex flex-col items-center space-y-2 bg-transparent"
                  >
                    <Eye className="h-8 w-8" />
                    <span className="font-medium">View Profile</span>
                    <span className="text-xs text-center opacity-80">See your public profile</span>
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest profile updates</CardDescription>
              </CardHeader>
              <CardContent>
                {blockCount === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No activity yet</p>
                    <Link href="/profile/blocks">
                      <Button>Add Your First Block</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blocks?.slice(0, 3).map((block) => (
                      <div key={block.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="font-medium capitalize">{block.block_type} Block</p>
                          <p className="text-sm text-muted-foreground">{block.title || "Untitled"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Preview */}
          <div className="space-y-6">
            <ProfilePreview profile={profile} blocks={blocks || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
