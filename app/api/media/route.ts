import { list } from "@vercel/blob"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { blobs } = await list()

    // Filter files by user ID and categorize
    const userFiles = blobs
      .filter((blob) => blob.pathname.startsWith(`${user.id}/`))
      .map((blob) => ({
        ...blob,
        filename: blob.pathname.split("/").pop()?.replace(/^\d+-/, "") || "unknown",
        category:
          blob.pathname.includes("image") || blob.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            ? "image"
            : blob.pathname.includes("video") || blob.url.match(/\.(mp4|webm|mov)$/i)
              ? "video"
              : "audio",
      }))

    return NextResponse.json({ files: userFiles })
  } catch (error) {
    console.error("Error listing files:", error)
    return NextResponse.json({ error: "Failed to list files" }, { status: 500 })
  }
}
