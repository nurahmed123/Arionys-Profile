"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageIcon, Edit2, Save, X, Upload } from "lucide-react"

interface ImageBlockProps {
  id: string
  data: {
    imageUrl?: string
    size?: "small" | "medium" | "large" | "full"
  }
  isEditing?: boolean
  onSave?: (data: any) => void
  onEdit?: () => void
  onCancel?: () => void
}

export function ImageBlock({ id, data, isEditing, onSave, onEdit, onCancel }: ImageBlockProps) {
  const [formData, setFormData] = useState({
    imageUrl: data.imageUrl || "",
    size: data.size || "medium",
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    onSave?.(formData)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        setFormData((prev) => ({ ...prev, imageUrl: url }))
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setUploading(false)
    }
  }

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "w-32 h-32"
      case "medium":
        return "w-48 h-48"
      case "large":
        return "w-64 h-64"
      case "full":
        return "w-full h-auto"
      default:
        return "w-48 h-48"
    }
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4" />
              <span className="font-medium">Image</span>
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Upload Image</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl">Or Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="size">Image Size</Label>
              <Select value={formData.size} onValueChange={(value) => setFormData({ ...formData, size: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (128px)</SelectItem>
                  <SelectItem value="medium">Medium (192px)</SelectItem>
                  <SelectItem value="large">Large (256px)</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.imageUrl && (
              <div className="mt-4">
                <Label>Preview</Label>
                <div className="mt-2 flex justify-center">
                  <img
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="Preview"
                    className={`${getSizeClass(formData.size)} object-cover rounded border`}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <ImageIcon className="h-4 w-4" />
            <span className="font-medium">Image</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center">
          {data.imageUrl ? (
            <img
              src={data.imageUrl || "/placeholder.svg"}
              alt="User uploaded image"
              className={`${getSizeClass(data.size || "medium")} object-cover rounded`}
            />
          ) : (
            <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">No image uploaded</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
