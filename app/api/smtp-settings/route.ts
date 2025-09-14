import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data: smtpSettings, error } = await supabase
      .from("smtp_settings")
      .select("id, display_name, host, port, username, is_active, created_at, updated_at")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ smtpSettings: smtpSettings || [] })
  } catch (error) {
    console.error("Error fetching SMTP settings:", error)
    return NextResponse.json({ error: "Failed to fetch SMTP settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { display_name, host, port, username, password } = await request.json()

    // Validate required fields
    if (!display_name || !host || !port || !username || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate port number
    if (isNaN(port) || port < 1 || port > 65535) {
      return NextResponse.json({ error: "Invalid port number" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("smtp_settings")
      .insert({
        user_id: user.id,
        display_name,
        host,
        port: Number.parseInt(port),
        username,
        password, // In production, this should be encrypted
      })
      .select("id, display_name, host, port, username, is_active, created_at, updated_at")
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ smtpSetting: data })
  } catch (error) {
    console.error("Error creating SMTP setting:", error)
    return NextResponse.json({ error: "Failed to create SMTP setting" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id, display_name, host, port, username, password } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "SMTP setting ID is required" }, { status: 400 })
    }

    // Validate required fields
    if (!display_name || !host || !port || !username) {
      return NextResponse.json({ error: "Display name, host, port, and username are required" }, { status: 400 })
    }

    // Validate port number
    if (isNaN(port) || port < 1 || port > 65535) {
      return NextResponse.json({ error: "Invalid port number" }, { status: 400 })
    }

    const updateData: any = {
      display_name,
      host,
      port: Number.parseInt(port),
      username,
    }

    // Only update password if provided
    if (password) {
      updateData.password = password
    }

    const { data, error } = await supabase
      .from("smtp_settings")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, display_name, host, port, username, is_active, created_at, updated_at")
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ smtpSetting: data })
  } catch (error) {
    console.error("Error updating SMTP setting:", error)
    return NextResponse.json({ error: "Failed to update SMTP setting" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database connection not available" }, { status: 500 })
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "SMTP setting ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("smtp_settings").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting SMTP setting:", error)
    return NextResponse.json({ error: "Failed to delete SMTP setting" }, { status: 500 })
  }
}
