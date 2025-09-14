"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUpload } from "./file-upload"
import { Trash2, Copy, ExternalLink, ImageIcon, Video, Music } from "lucide-react"

interface MediaFile {
  url: string
  filename: string
  size: number
  uploadedAt: string
  category: string
}

interface MediaLibraryProps {
  onSelect?: (file: MediaFile) => void
  showUpload?: boolean
}

export function MediaLibrary({ onSelect, showUpload = true }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "image" | "video" | "audio">("all")

  const loadFiles = async () => {
    try {
      const response = await fetch("/api/media")
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files)
      }
    } catch (error) {
      console.error("Error loading files:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFiles()
  }, [])

  const handleUpload = (newFile: any) => {
    setFiles((prev) => [{ ...newFile, uploadedAt: new Date().toISOString() }, ...prev])
  }

  const handleDelete = async (url: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      const response = await fetch("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (response.ok) {
        setFiles((prev) => prev.filter((file) => file.url !== url))
      }
    } catch (error) {
      console.error("Error deleting file:", error)
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    // You could add a toast notification here
  }

  const filteredFiles = files.filter((file) => filter === "all" || file.category === filter)

  const getFileIcon = (category: string) => {
    switch (category) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      default:
        return <ImageIcon className="h-4 w-4" />
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading media library...</div>
  }

  return (
    <div className="space-y-6">
      {showUpload && <FileUpload onUpload={handleUpload} />}

      <div className="flex gap-2">
        {(["all", "image", "video", "audio"] as const).map((type) => (
          <Button
            key={type}
            variant={filter === type ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFiles.map((file) => (
          <Card key={file.url} className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {file.category === "image" ? (
                <img src={file.url || "/placeholder.svg"} alt={file.filename} className="w-full h-full object-cover" />
              ) : file.category === "video" ? (
                <video src={file.url} className="w-full h-full object-cover" controls={false} />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  {getFileIcon(file.category)}
                  <span className="text-sm">Audio File</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                {getFileIcon(file.category)}
                <span className="text-sm font-medium truncate">{file.filename}</span>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(file.url)} className="flex-1">
                  <Copy className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => window.open(file.url, "_blank")}>
                  <ExternalLink className="h-3 w-3" />
                </Button>
                {onSelect && (
                  <Button size="sm" onClick={() => onSelect(file)} className="flex-1">
                    Select
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(file.url)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="mb-4">{getFileIcon(filter)}</div>
          <p>No {filter === "all" ? "" : filter} files found</p>
        </div>
      )}
    </div>
  )
}
