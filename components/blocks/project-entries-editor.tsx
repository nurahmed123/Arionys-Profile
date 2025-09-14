"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, GripVertical, Edit, Trash2, Upload, X, FileText, ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"

interface ProjectFile {
  id: string
  name: string
  url: string
  type: "pdf" | "image"
  size: number
}

interface ProjectEntry {
  id: string
  title: string
  description: string
  descriptionType: "markdown" | "plain"
  position: number
  fromDate?: string
  toDate?: string
  link?: string
  photo?: string
  files: ProjectFile[]
}

interface ProjectEntriesEditorProps {
  entries: ProjectEntry[]
  onChange: (entries: ProjectEntry[]) => void
}

export function ProjectEntriesEditor({ entries = [], onChange }: ProjectEntriesEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<ProjectEntry | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    descriptionType: "plain" as "markdown" | "plain",
    fromDate: "",
    toDate: "",
    link: "",
    files: [] as ProjectFile[],
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      descriptionType: "plain",
      fromDate: "",
      toDate: "",
      link: "",
      files: [],
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || formData.files.length >= 2) return

    setIsUploading(true)
    const newFiles: ProjectFile[] = []

    for (let i = 0; i < Math.min(files.length, 2 - formData.files.length); i++) {
      const file = files[i]
      const fileType = file.type.startsWith("image/") ? "image" : "pdf"

      // Create a blob URL for preview (in real app, upload to your storage)
      const url = URL.createObjectURL(file)

      newFiles.push({
        id: Date.now().toString() + i,
        name: file.name,
        url,
        type: fileType,
        size: file.size,
      })
    }

    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }))
    setIsUploading(false)
  }

  const removeFile = (fileId: string) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }))
  }

  const handleAddEntry = () => {
    const newEntry: ProjectEntry = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      descriptionType: formData.descriptionType,
      position: entries.length,
      fromDate: formData.fromDate || undefined,
      toDate: formData.toDate || undefined,
      link: formData.link || undefined,
      files: formData.files,
    }

    onChange([...entries, newEntry])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditEntry = (entry: ProjectEntry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      description: entry.description,
      descriptionType: entry.descriptionType,
      fromDate: entry.fromDate || "",
      toDate: entry.toDate || "",
      link: entry.link || "",
      files: entry.files,
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
            descriptionType: formData.descriptionType,
            fromDate: formData.fromDate || undefined,
            toDate: formData.toDate || undefined,
            link: formData.link || undefined,
            files: formData.files,
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

  const closeDialog = () => {
    setIsAddDialogOpen(false)
    setEditingEntry(null)
    resetForm()
  }

  const formatDateRange = (fromDate?: string, toDate?: string) => {
    if (!fromDate) return ""
    const from = new Date(fromDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    if (!toDate) return `${from} - Present`
    const to = new Date(toDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    return `${from} - ${to}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Project Entries ({entries.length})</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No projects yet. Click "Add Project" to get started.</p>
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
                <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-10" />
              )}

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded transition-colors">
                        <GripVertical className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-medium">{entry.title || "Untitled Project"}</CardTitle>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entry.description || "No description"}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {entry.link && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Link
                            </Badge>
                          )}
                          {entry.files.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {entry.files.length} file{entry.files.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                          <Badge
                            variant={entry.descriptionType === "markdown" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {entry.descriptionType}
                          </Badge>
                        </div>
                        {(entry.fromDate || entry.toDate) && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {formatDateRange(entry.fromDate, entry.toDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {editingEntry ? "Update the project details." : "Add a new project to your timeline."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., E-commerce Platform"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="markdown-toggle" className="text-sm">
                    Markdown
                  </Label>
                  <Switch
                    id="markdown-toggle"
                    checked={formData.descriptionType === "markdown"}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, descriptionType: checked ? "markdown" : "plain" }))
                    }
                  />
                </div>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder={
                  formData.descriptionType === "markdown"
                    ? "**Built with React and Node.js**\n\n- User authentication\n- Payment integration\n- Real-time notifications"
                    : "Built with React and Node.js. Features include user authentication, payment integration, and real-time notifications."
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {formData.descriptionType === "markdown"
                  ? "Use markdown syntax for formatting (bold, lists, links, etc.)"
                  : "Plain text description"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link">Project Link (Optional)</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={(e) => setFormData((prev) => ({ ...prev, link: e.target.value }))}
                placeholder="https://github.com/username/project or https://project-demo.com"
              />
            </div>

            <div className="space-y-2">
              <Label>Files (PDFs & Images - Max 2)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept=".pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={formData.files.length >= 2 || isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center cursor-pointer ${
                    formData.files.length >= 2 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isUploading ? "Uploading..." : `Click to upload files (${formData.files.length}/2)`}
                  </p>
                  <p className="text-xs text-gray-500">PDFs and images only</p>
                </label>
              </div>

              {formData.files.length > 0 && (
                <div className="space-y-2">
                  {formData.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        {file.type === "pdf" ? (
                          <FileText className="h-4 w-4 text-red-500" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                        )}
                        <span className="text-sm font-medium">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">Start Date</Label>
                <Input
                  id="fromDate"
                  type="month"
                  value={formData.fromDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fromDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">End Date</Label>
                <Input
                  id="toDate"
                  type="month"
                  value={formData.toDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, toDate: e.target.value }))}
                  placeholder="Leave empty for 'Present'"
                />
                <p className="text-xs text-muted-foreground">Leave empty for ongoing projects</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={editingEntry ? handleUpdateEntry : handleAddEntry}>
              {editingEntry ? "Update Project" : "Add Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
