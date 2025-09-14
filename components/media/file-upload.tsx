"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, ImageIcon, Video, Music } from "lucide-react"

interface FileUploadProps {
  onUpload: (file: { url: string; filename: string; type: string; category: string }) => void
  accept?: string
  maxSize?: number
  className?: string
}

export function FileUpload({ onUpload, accept = "image/*,video/*,audio/*", maxSize = 10, className }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (!file) return
    
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxSize}MB.`)
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()
      onUpload(result)
    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8" />
    if (type.startsWith("video/")) return <Video className="h-8 w-8" />
    if (type.startsWith("audio/")) return <Music className="h-8 w-8" />
    return <Upload className="h-8 w-8" />
  }

  return (
    <Card
      className={`border border-dashed transition-all duration-200 shadow-sm hover:shadow ${
        dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      } ${className}`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
    >
      <div className="p-3 text-center">
        <div className="mt-1 mb-2 flex flex-col items-center justify-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Upload className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mb-3 space-y-1">
          <p className="text-xs font-medium">Drop files here</p>
          <p className="text-[11px] text-muted-foreground font-light">Up to {maxSize}MB</p>
        </div>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} variant="secondary" size="sm" className="text-xs font-medium px-4 h-8 shadow-sm hover:shadow">
          {uploading ? "Uploading..." : "Choose File"}
        </Button>
        <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileInput} className="hidden" />
      </div>
    </Card>
  )
}
