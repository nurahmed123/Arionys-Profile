"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BLOCK_TYPES } from "./block-types"
import { MediaLibrary } from "@/components/media/media-library"
import { TimelineEntriesEditor } from "./timeline-entries-editor"
import { ProjectEntriesEditor } from "./project-entries-editor" // Added ProjectEntriesEditor import
import { AchievementEntriesEditor } from "./achievement-entries-editor" // Added AchievementEntriesEditor import
import { SkillEntriesEditor } from "./skill-entries-editor" // Added SkillEntriesEditor import
import { ServiceEntriesEditor } from "./service-entries-editor" // Added ServiceEntriesEditor import
import { ImageIcon, Upload, X } from "lucide-react"

interface BlockEditDialogProps {
  block: any
  isOpen: boolean
  onClose: () => void
  onSave: (block: any) => void
}

export function BlockEditDialog({ block, isOpen, onClose, onSave }: BlockEditDialogProps) {
  const [formData, setFormData] = useState<any>({})
  const [title, setTitle] = useState("")
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [currentFileField, setCurrentFileField] = useState<string | null>(null)

  useEffect(() => {
    if (block) {
      setFormData(block.content || {})
      setTitle(block.title || "")
    }
  }, [block])

  const handleSave = () => {
    if (!block) return

    onSave({
      ...block,
      title,
      content: formData,
    })
  }

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleMediaSelect = (file: any) => {
    if (currentFileField) {
      if (currentFileField === "images") {
        const currentImages = formData.images || []
        handleFieldChange(currentFileField, [...currentImages, file.url])
      } else {
        handleFieldChange(currentFileField, file.url)
      }
      setShowMediaLibrary(false)
      setCurrentFileField(null)
    }
  }

  const removeImageFromGallery = (index: number) => {
    const currentImages = formData.images || []
    const newImages = currentImages.filter((_: any, i: number) => i !== index)
    handleFieldChange("images", newImages)
  }

  const renderField = (field: any) => {
    const value = formData[field.key] || ""

    switch (field.type) {
      case "text":
      case "url":
      case "email":
      case "tel":
      case "date":
      case "time":
        return (
          <Input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        )

      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleFieldChange(field.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "timeline-entries":
        return (
          <TimelineEntriesEditor
            entries={formData[field.key] || []}
            onChange={(entries) => handleFieldChange(field.key, entries)}
          />
        )

      case "project-entries":
        return (
          <ProjectEntriesEditor
            entries={formData[field.key] || []}
            onChange={(entries) => handleFieldChange(field.key, entries)}
          />
        )

      case "achievement-entries":
        return (
          <AchievementEntriesEditor
            entries={formData[field.key] || []}
            onChange={(entries) => handleFieldChange(field.key, entries)}
          />
        )

      case "skill-entries":
        return (
          <SkillEntriesEditor
            entries={formData[field.key] || []}
            onChange={(entries) => handleFieldChange(field.key, entries)}
          />
        )

      case "service-entries":
        return (
          <ServiceEntriesEditor
            entries={formData[field.key] || []}
            onChange={(entries) => handleFieldChange(field.key, entries)}
          />
        )

      case "file":
        return (
          <div className="space-y-2">
            {value && (
              <div className="flex items-center gap-2 p-2 border rounded">
                <ImageIcon className="h-4 w-4" />
                <span className="text-sm truncate flex-1">{value.split("/").pop()}</span>
                <Button size="sm" variant="outline" onClick={() => handleFieldChange(field.key, "")}>
                  Remove
                </Button>
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentFileField(field.key)
                setShowMediaLibrary(true)
              }}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {value ? "Change File" : "Select File"}
            </Button>
          </div>
        )

      case "image-array":
        const images = formData.images || []
        return (
          <div className="space-y-3">
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {images.map((imageUrl: string, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-20 object-cover rounded border"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImageFromGallery(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentFileField("images")
                setShowMediaLibrary(true)
              }}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Add Images ({images.length})
            </Button>
          </div>
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={field.placeholder}
          />
        )
    }
  }

  if (!block) return null

  const blockType = BLOCK_TYPES[block.block_type]

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {blockType && <span className="flex items-center justify-center">{blockType.icon}</span>}
              <span>Edit {blockType?.name || "Block"}</span>
            </DialogTitle>
            <DialogDescription>{blockType?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Block Title (Optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give this block a title"
              />
            </div>

            {blockType?.fields.map((field) => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                {renderField(field)}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="sm:max-w-[800px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
            <DialogDescription>Choose a file from your media library or upload a new one</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <MediaLibrary onSelect={handleMediaSelect} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
