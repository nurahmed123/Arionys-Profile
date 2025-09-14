"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, GripVertical, Edit, Trash2, Upload, X, ImageIcon, FileText, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MediaLibrary } from "@/components/media/media-library"

interface AchievementFile {
  id: string
  name: string
  url: string
  type: "image" | "pdf"
}

interface AchievementEntry {
  id: string
  title: string
  description: string
  date: string
  position: number
  side?: "left" | "right"
  files: AchievementFile[]
  link?: string
  descriptionType?: "plain" | "markdown"
  photo?: string
}

interface AchievementEntriesEditorProps {
  entries: AchievementEntry[]
  onChange: (entries: AchievementEntry[]) => void
}

export function AchievementEntriesEditor({ entries = [], onChange }: AchievementEntriesEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<AchievementEntry | null>(null)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    side: "left" as "left" | "right",
    files: [] as AchievementFile[],
    link: "",
    descriptionType: "plain" as "plain" | "markdown",
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      side: "left",
      files: [],
      link: "",
      descriptionType: "plain",
    })
  }

  const handleAddEntry = () => {
    const newEntry: AchievementEntry = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      position: entries.length,
      side: formData.side,
      files: formData.files,
      link: formData.link,
      descriptionType: formData.descriptionType,
    }

    onChange([...entries, newEntry])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditEntry = (entry: AchievementEntry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      description: entry.description,
      date: entry.date,
      side: entry.side || "left",
      files: entry.files || [],
      link: entry.link || "",
      descriptionType: entry.descriptionType || "plain",
    })
    setIsAddDialogOpen(true)
  }

  const handleUpdateEntry = () => {
    if (!editingEntry) return

    const updatedEntries = entries.map((entry) =>
      entry.id === editingEntry.id
        ? {
            ...entry,
            title: formData.title,
            description: formData.description,
            date: formData.date,
            side: formData.side,
            files: formData.files,
            link: formData.link,
            descriptionType: formData.descriptionType,
          }
        : entry,
    )

    onChange(updatedEntries)
    resetForm()
    setEditingEntry(null)
    setIsAddDialogOpen(false)
  }

  const handleDeleteEntry = (entryId: string) => {
    const updatedEntries = entries
      .filter((entry) => entry.id !== entryId)
      .map((entry, index) => ({ ...entry, position: index }))
    onChange(updatedEntries)
  }

  const handleReorder = (dragIndex: number, hoverIndex: number) => {
    const draggedEntry = entries[dragIndex]
    const newEntries = [...entries]
    newEntries.splice(dragIndex, 1)
    newEntries.splice(hoverIndex, 0, draggedEntry)

    const updatedEntries = newEntries.map((entry, index) => ({
      ...entry,
      position: index,
    }))

    onChange(updatedEntries)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.currentTarget.style.opacity = "0.5"
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.style.opacity = "1"
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      handleReorder(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleMediaSelect = (file: any) => {
    if (formData.files.length >= 2) {
      alert("You can only add up to 2 media files per achievement.")
      return
    }

    const newFile: AchievementFile = {
      id: Date.now().toString(),
      name: file.name || file.url.split("/").pop() || "Unknown file",
      url: file.url,
      type: file.type?.startsWith("image/") ? "image" : "pdf",
    }

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, newFile],
    }))
    setShowMediaLibrary(false)
  }

  const removeFile = (fileId: string) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((file) => file.id !== fileId),
    }))
  }

  const closeDialog = () => {
    setIsAddDialogOpen(false)
    setEditingEntry(null)
    resetForm()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Achievement Entries ({entries.length})</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Achievement
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No achievements yet. Click "Add Achievement" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`group relative transition-all duration-200 ${
                dragOverIndex === index ? "transform scale-105 shadow-lg" : ""
              } ${draggedIndex === index ? "opacity-50" : ""}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
            >
              {dragOverIndex === index && draggedIndex !== index && (
                <div className="absolute -top-2 left-0 right-0 h-1 bg-yellow-500 rounded-full z-10" />
              )}

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded transition-colors">
                        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{entry.title || "Untitled Achievement"}</CardTitle>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entry.description || "No description"}
                        </p>
                        {entry.date && (
                          <p className="text-xs text-yellow-600 font-medium mt-1">{formatDate(entry.date)}</p>
                        )}
                        {entry.link && (
                          <p className="text-xs text-blue-600 font-medium mt-1 flex items-center">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Link attached
                          </p>
                        )}
                        {entry.files.length > 0 && (
                          <div className="flex items-center space-x-1 mt-1">
                            {entry.files.map((file) => (
                              <Badge key={file.id} variant="outline" className="text-xs">
                                {file.type === "image" ? (
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                ) : (
                                  <FileText className="h-3 w-3 mr-1" />
                                )}
                                {file.name.length > 10 ? `${file.name.substring(0, 10)}...` : file.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={entry.side === "left" ? "default" : "secondary"}>{entry.side}</Badge>
                      <Button variant="ghost" size="sm" onClick={() => handleEditEntry(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Achievement" : "Add New Achievement"}</DialogTitle>
            <DialogDescription>
              {editingEntry
                ? "Update the achievement details."
                : "Add a new achievement to showcase your accomplishments."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Achievement Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Best Developer Award 2024"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="flex items-center gap-2 mb-2">
                <Label className="text-sm text-muted-foreground">Format:</Label>
                <Select
                  value={formData.descriptionType}
                  onValueChange={(value: "plain" | "markdown") =>
                    setFormData((prev) => ({ ...prev, descriptionType: value }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain Text</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={
                  formData.descriptionType === "markdown"
                    ? "e.g., **Awarded** for outstanding contribution to the development team..."
                    : "e.g., Awarded for outstanding contribution to the development team..."
                }
                rows={4}
              />
              {formData.descriptionType === "markdown" && (
                <p className="text-xs text-muted-foreground">
                  Supports **bold**, *italic*, and other markdown formatting
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Achievement Date</Label>
              <Input
                id="date"
                type="month"
                value={formData.date}
                onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="side">Display Side (for zigzag style)</Label>
              <Select
                value={formData.side}
                onValueChange={(value: "left" | "right") => setFormData((prev) => ({ ...prev, side: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Media Files ({formData.files.length}/2)</Label>
              {formData.files.length > 0 && (
                <div className="space-y-2">
                  {formData.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 p-2 border rounded">
                      {file.type === "image" ? (
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      <Button size="sm" variant="outline" onClick={() => removeFile(file.id)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {formData.files.length < 2 && (
                <Button type="button" variant="outline" onClick={() => setShowMediaLibrary(true)} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Add Media ({formData.files.length}/2)
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                placeholder="e.g., https://example.com/certificate"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={editingEntry ? handleUpdateEntry : handleAddEntry}>
              {editingEntry ? "Update Achievement" : "Add Achievement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showMediaLibrary} onOpenChange={setShowMediaLibrary}>
        <DialogContent className="sm:max-w-[800px] max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
            <DialogDescription>Choose an image or PDF file for your achievement</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto">
            <MediaLibrary onSelect={handleMediaSelect} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
