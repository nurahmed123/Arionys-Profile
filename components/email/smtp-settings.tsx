"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Edit, Trash2, Server, CheckCircle2 } from "lucide-react"

interface SmtpSetting {
  id: string
  display_name: string
  host: string
  port: number
  username: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface SmtpSettingsProps {
  onSettingsChange?: () => void
}

export function SmtpSettings({ onSettingsChange }: SmtpSettingsProps) {
  const [smtpSettings, setSmtpSettings] = useState<SmtpSetting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<SmtpSetting | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    display_name: "",
    host: "",
    port: "587",
    username: "",
    password: "",
  })

  useEffect(() => {
    fetchSmtpSettings()
  }, [])

  const fetchSmtpSettings = async () => {
    try {
      const response = await fetch("/api/smtp-settings")
      if (response.ok) {
        const data = await response.json()
        setSmtpSettings(data.smtpSettings || [])
      }
    } catch (error) {
      console.error("Failed to fetch SMTP settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSetting = async () => {
    if (!formData.display_name || !formData.host || !formData.username || !formData.password) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/smtp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchSmtpSettings()
        setIsAddDialogOpen(false)
        resetForm()
        onSettingsChange?.()
      }
    } catch (error) {
      console.error("Failed to add SMTP setting:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditSetting = async () => {
    if (!editingSetting || !formData.display_name || !formData.host || !formData.username) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/smtp-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSetting.id,
          ...formData,
        }),
      })

      if (response.ok) {
        await fetchSmtpSettings()
        setEditingSetting(null)
        resetForm()
        onSettingsChange?.()
      }
    } catch (error) {
      console.error("Failed to update SMTP setting:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSetting = async (id: string) => {
    try {
      const response = await fetch(`/api/smtp-settings?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchSmtpSettings()
        onSettingsChange?.()
      }
    } catch (error) {
      console.error("Failed to delete SMTP setting:", error)
    }
  }

  const openEditDialog = (setting: SmtpSetting) => {
    setEditingSetting(setting)
    setFormData({
      display_name: setting.display_name,
      host: setting.host,
      port: setting.port.toString(),
      username: setting.username,
      password: "", // Don't pre-fill password for security
    })
  }

  const resetForm = () => {
    setFormData({
      display_name: "",
      host: "",
      port: "587",
      username: "",
      password: "",
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Loading SMTP settings...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Server className="h-5 w-5" />
              <span>SMTP Settings</span>
            </CardTitle>
            <CardDescription>Configure SMTP servers for sending emails with app passwords</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add SMTP
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add SMTP Configuration</DialogTitle>
                <DialogDescription>
                  Configure your email provider's SMTP settings to send emails using app passwords.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    placeholder="Your Name or Company"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="host">SMTP Host *</Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="port">Port *</Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                      placeholder="587"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="username">Username/Email *</Label>
                  <Input
                    id="username"
                    type="email"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="your-email@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">App Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Your app-specific password"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use an app-specific password, not your regular email password
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSetting}
                  disabled={
                    !formData.display_name || !formData.host || !formData.username || !formData.password || isSaving
                  }
                >
                  {isSaving ? "Adding..." : "Add SMTP"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {smtpSettings.length === 0 ? (
          <div className="text-center py-8">
            <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No SMTP Settings</h3>
            <p className="text-muted-foreground mb-4">
              Add SMTP configuration to send emails using app passwords from your email provider.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {smtpSettings.map((setting) => (
              <div key={setting.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{setting.display_name}</span>
                      <Badge variant="secondary">{setting.username}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {setting.host}:{setting.port}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(setting)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete SMTP Setting</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{setting.display_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSetting(setting.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingSetting} onOpenChange={() => setEditingSetting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit SMTP Configuration</DialogTitle>
            <DialogDescription>
              Update your SMTP settings. Leave password blank to keep current password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_display_name">Display Name *</Label>
              <Input
                id="edit_display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Your Name or Company"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_host">SMTP Host *</Label>
                <Input
                  id="edit_host"
                  value={formData.host}
                  onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="edit_port">Port *</Label>
                <Input
                  id="edit_port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  placeholder="587"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit_username">Username/Email *</Label>
              <Input
                id="edit_username"
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="your-email@gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="edit_password">App Password</Label>
              <Input
                id="edit_password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave blank to keep current password"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave blank to keep current password</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSetting(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSetting}
              disabled={!formData.display_name || !formData.host || !formData.username || isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
