"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Edit2, Save, X } from "lucide-react"

interface CalendarBlockProps {
  id: string
  data: {
    title?: string
    date?: string
    endDate?: string
    description?: string
  }
  isEditing?: boolean
  onSave?: (data: any) => void
  onEdit?: () => void
  onCancel?: () => void
}

export function CalendarBlock({ id, data, isEditing, onSave, onEdit, onCancel }: CalendarBlockProps) {
  const [formData, setFormData] = useState({
    title: data.title || "",
    date: data.date || "",
    endDate: data.endDate || "",
    description: data.description || "",
  })

  const handleSave = () => {
    onSave?.(formData)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString()
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Calendar Event</span>
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
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Start Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Event description"
                rows={3}
              />
            </div>
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
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Calendar Event</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {data.title && <h4 className="font-medium">{data.title}</h4>}
          <div className="text-sm text-muted-foreground">
            {data.date && (
              <p>
                {formatDate(data.date)}
                {data.endDate && ` - ${formatDate(data.endDate)}`}
              </p>
            )}
          </div>
          {data.description && <p className="text-sm">{data.description}</p>}
          {!data.title && !data.date && <p className="text-muted-foreground text-sm">No event set</p>}
        </div>
      </CardContent>
    </Card>
  )
}
