"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Edit2, Save, X } from "lucide-react"

interface LocationBlockProps {
  id: string
  data: {
    address?: string
    city?: string
    country?: string
  }
  isEditing?: boolean
  onSave?: (data: any) => void
  onEdit?: () => void
  onCancel?: () => void
}

export function LocationBlock({ id, data, isEditing, onSave, onEdit, onCancel }: LocationBlockProps) {
  const [formData, setFormData] = useState({
    address: data.address || "",
    city: data.city || "",
    country: data.country || "",
  })

  const handleSave = () => {
    onSave?.(formData)
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Location</span>
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
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United States"
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
            <MapPin className="h-4 w-4" />
            <span className="font-medium">Location</span>
          </div>
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1 text-sm">
          {data.address && <p>{data.address}</p>}
          {data.city && <p>{data.city}</p>}
          {data.country && <p>{data.country}</p>}
          {!data.address && !data.city && !data.country && <p className="text-muted-foreground">No location set</p>}
        </div>
      </CardContent>
    </Card>
  )
}
