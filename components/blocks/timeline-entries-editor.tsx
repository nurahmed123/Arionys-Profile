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
import { Plus, GripVertical, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TimelineEntry {
  id: string
  title: string
  description: string
  side: "left" | "right"
  position: number
  fromDate?: string
  toDate?: string
}

interface TimelineEntriesEditorProps {
  entries: TimelineEntry[]
  onChange: (entries: TimelineEntry[]) => void
}

export function TimelineEntriesEditor({ entries = [], onChange }: TimelineEntriesEditorProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimelineEntry | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    side: "left" as "left" | "right",
    fromDate: "",
    toDate: "",
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      side: "left",
      fromDate: "",
      toDate: "",
    })
  }

  const handleAddEntry = () => {
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      side: formData.side,
      position: entries.length,
      fromDate: formData.fromDate || undefined,
      toDate: formData.toDate || undefined,
    }

    onChange([...entries, newEntry])
    resetForm()
    setIsAddDialogOpen(false)
  }

  const handleEditEntry = (entry: TimelineEntry) => {
    setEditingEntry(entry)
    setFormData({
      title: entry.title,
      description: entry.description,
      side: entry.side,
      fromDate: entry.fromDate || "",
      toDate: entry.toDate || "",
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
            side: formData.side,
            fromDate: formData.fromDate || undefined,
            toDate: formData.toDate || undefined,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Timeline Entries ({entries.length})</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No entries yet. Click "Add Entry" to get started.</p>
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
                        <CardTitle className="text-sm font-medium">{entry.title || "Untitled"}</CardTitle>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {entry.description || "No description"}
                        </p>
                        {(entry.fromDate || entry.toDate) && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {formatDateRange(entry.fromDate, entry.toDate)}
                          </p>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Add New Entry"}</DialogTitle>
            <DialogDescription>
              {editingEntry ? "Update the timeline entry details." : "Add a new entry to your timeline."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Bachelor of Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., University of California, Berkeley"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromDate">From Date</Label>
                <Input
                  id="fromDate"
                  type="month"
                  value={formData.fromDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fromDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toDate">To Date</Label>
                <Input
                  id="toDate"
                  type="month"
                  value={formData.toDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, toDate: e.target.value }))}
                  placeholder="Leave empty for 'Present'"
                />
                <p className="text-xs text-muted-foreground">Leave empty to show "Present"</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="side">Timeline Side</Label>
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button onClick={editingEntry ? handleUpdateEntry : handleAddEntry}>
              {editingEntry ? "Update Entry" : "Add Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
