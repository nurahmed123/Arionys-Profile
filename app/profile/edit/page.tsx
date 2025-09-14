import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ProfileEditForm } from "@/components/profile/profile-edit-form"

export default async function ProfileEditPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  let { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    const { data: newProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        display_name: user.user_metadata?.full_name || "",
        username: user.email?.split("@")[0] || "",
        is_public: true,
        theme: "default",
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating profile:", createError)
      redirect("/auth/login")
    }

    profile = newProfile
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} profile={profile} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
          <p className="text-muted-foreground">Update your profile information and settings.</p>
        </div>

        <ProfileEditForm profile={profile} />
      </main>
    </div>
  )
}
