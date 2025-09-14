import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, country, city, source } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

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

    // Insert subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        profile_id: profile.id,
        subscriber_email: email.toLowerCase().trim(),
        subscriber_name: name?.trim() || null,
        subscriber_phone: phone?.trim() || null,
        subscriber_country: country?.trim() || null,
        subscriber_city: city?.trim() || null,
        source: source || "manual_add",
      })
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "This email is already subscribed" }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Add subscriber error:", error)
    return NextResponse.json({ error: "Failed to add subscriber" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, email, name, phone, country, city } = await request.json()

    if (!id || !email) {
      return NextResponse.json({ error: "ID and email are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Update subscription
    const { data, error } = await supabase
      .from("subscriptions")
      .update({
        subscriber_email: email.toLowerCase().trim(),
        subscriber_name: name?.trim() || null,
        subscriber_phone: phone?.trim() || null,
        subscriber_country: country?.trim() || null,
        subscriber_city: city?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("profile_id", user.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Edit subscriber error:", error)
    return NextResponse.json({ error: "Failed to edit subscriber" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete subscription
    const { error } = await supabase.from("subscriptions").delete().eq("id", id).eq("profile_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete subscriber error:", error)
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 })
  }
}
