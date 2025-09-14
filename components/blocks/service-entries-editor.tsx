"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Upload, X, Briefcase } from "lucide-react"
import { FileUpload } from "@/components/media/file-upload"

interface ServiceEntry {
  id: string
  title: string
  description: string
  price?: string
  duration?: string
  photo?: string
  features?: string[]
}

interface ServiceEntriesEditorProps {
  entries: ServiceEntry[]
  onChange: (entries: ServiceEntry[]) => void
}

export function ServiceEntriesEditor({ entries, onChange }: ServiceEntriesEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newFeature, setNewFeature] = useState("")

  const addEntry = () => {
    const newEntry: ServiceEntry = {
      id: Date.now().toString(),
      title: "",
      description: "",
      price: "",
      duration: "",
      photo: "",
      features: [],
    }
    onChange([...entries, newEntry])
    setEditingIndex(entries.length)
  }

  const updateEntry = (index: number, field: keyof ServiceEntry, value: any) => {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  const removeEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index)
    onChange(updated)
    if (editingIndex === index) {
      setEditingIndex(null)
    } else if (editingIndex !== null && editingIndex > index) {
      setEditingIndex(editingIndex - 1)
    }
  }

  const addFeature = (index: number) => {
    if (newFeature.trim()) {
      const updated = [...entries]
      updated[index].features = [...(updated[index].features || []), newFeature.trim()]
      onChange(updated)
      setNewFeature("")
    }
  }

  const removeFeature = (index: number, featureIndex: number) => {
    const updated = [...entries]
    updated[index].features = updated[index].features?.filter((_, i) => i !== featureIndex) || []
    onChange(updated)
  }

  const handlePhotoUpload = (index: number, file: { url: string; filename: string; type: string; category: string }) => {
    updateEntry(index, "photo", file.url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Services</h3>
        <Button onClick={addEntry} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">No services added yet</p>
            <Button onClick={addEntry} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <Card key={entry.id} className="relative overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {entry.title || `Service ${index + 1}`}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    >
                      {editingIndex === index ? "Done" : "Edit"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-2">
                {editingIndex === index ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor={`title-${index}`} className="mb-2">Service Title</Label>
                        <Input
                          id={`title-${index}`}
                          value={entry.title}
                          onChange={(e) => updateEntry(index, "title", e.target.value)}
                          placeholder="e.g., Web Development"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`price-${index}`} className="mb-2">Price (Optional)</Label>
                        <Input
                          id={`price-${index}`}
                          value={entry.price || ""}
                          onChange={(e) => updateEntry(index, "price", e.target.value)}
                          placeholder="e.g., $500 - $2000"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${index}`} className="mb-2">Description</Label>
                      <Textarea
                        id={`description-${index}`}
                        value={entry.description}
                        onChange={(e) => updateEntry(index, "description", e.target.value)}
                        placeholder="Describe your service..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`duration-${index}`} className="mb-2">Duration (Optional)</Label>
                      <Input
                        id={`duration-${index}`}
                        value={entry.duration || ""}
                        onChange={(e) => updateEntry(index, "duration", e.target.value)}
                        placeholder="e.g., 2-4 weeks"
                      />
                    </div>
                    
                    <div className="mt-8">
                      <Label className="mb-4 block">Service Photo (Optional)</Label>
                      <div className="mt-4">
                        {entry.photo ? (
                          <div className="relative">
                            <img
                              src={entry.photo}
                              alt={entry.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                              onClick={() => updateEntry(index, "photo", "")}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="w-24 h-24">
                            <FileUpload
                              onUpload={(file) => handlePhotoUpload(index, file)}
                              accept="image/*"
                              className="w-24 h-24 flex items-center justify-center"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-12">
                      <Label className="mb-2">Features (Optional)</Label>
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add a feature..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              addFeature(index)
                            }
                          }}
                        />
                        <Button onClick={() => addFeature(index)} size="sm" className="w-full sm:w-auto">
                          Add
                        </Button>
                      </div>
                      {entry.features && entry.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {entry.features.map((feature, featureIndex) => (
                            <Badge
                              key={featureIndex}
                              variant="secondary"
                              className="flex items-center space-x-1"
                            >
                              <span>{feature}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => removeFeature(index, featureIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entry.photo && (
                      <img
                        src={entry.photo}
                        alt={entry.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{entry.title}</h4>
                        {entry.price && (
                          <span className="text-lg font-bold text-green-600">{entry.price}</span>
                        )}
                      </div>
                      {entry.duration && (
                        <p className="text-sm text-muted-foreground">Duration: {entry.duration}</p>
                      )}
                      <p className="text-sm">{entry.description}</p>
                      {entry.features && entry.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.features.map((feature, featureIndex) => (
                            <Badge key={featureIndex} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
