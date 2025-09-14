import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SubscribersTable } from "@/components/dashboard/subscribers-table"
import { EmailDashboard } from "@/components/email/email-dashboard"
import { CampaignAnalytics } from "@/components/email/campaign-analytics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Mail, BarChart3 } from "lucide-react"

export default async function SubscribersPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/profile/edit")
  }

  // Fetch subscribers
  const { data: subscribers } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("profile_id", user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  const isGmailConnected = !!(profile.gmail_access_token && profile.gmail_refresh_token)
  const gmailEmail = profile.gmail_email

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Email Management</h1>
          <p className="text-muted-foreground">Manage your subscribers and send email campaigns.</p>
        </div>

        <Tabs defaultValue="subscribers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscribers" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Subscribers</span>
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="flex items-center space-x-2">
              <Mail className="h-4 w-4" />
              <span>Email Campaigns</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Campaign Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscribers">
            <SubscribersTable subscribers={subscribers || []} />
          </TabsContent>

          <TabsContent value="campaigns">
            <EmailDashboard
              subscribers={subscribers || []}
              isGmailConnected={isGmailConnected}
              gmailEmail={gmailEmail}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <CampaignAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
