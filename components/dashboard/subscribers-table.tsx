"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
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
import { Download, Search, Mail, Calendar, Plus, Edit, Trash2, Globe, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

interface Subscriber {
  id: string
  subscriber_email: string
  subscriber_name: string | null
  subscriber_phone: string | null
  subscriber_country: string | null
  subscriber_city: string | null
  created_at: string
  source: string
  is_active: boolean
}

interface SubscribersTableProps {
  subscribers: Subscriber[]
}

export function SubscribersTable({ subscribers }: SubscribersTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [editingSubscriber, setEditingSubscriber] = useState<Subscriber | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    country: "",
    city: "",
  })

  // Filter subscribers based on search and filters
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      const matchesSearch =
        subscriber.subscriber_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.subscriber_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (subscriber.subscriber_country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesSource = sourceFilter === "all" || subscriber.source === sourceFilter

      const matchesDate = (() => {
        if (dateFilter === "all") return true
        const subscribedDate = new Date(subscriber.created_at)
        const now = new Date()

        switch (dateFilter) {
          case "today":
            return subscribedDate.toDateString() === now.toDateString()
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return subscribedDate >= weekAgo
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return subscribedDate >= monthAgo
          default:
            return true
        }
      })()

      return matchesSearch && matchesSource && matchesDate
    })
  }, [subscribers, searchTerm, sourceFilter, dateFilter])

  // Get unique sources for filter dropdown
  const sources = useMemo(() => {
    const uniqueSources = [...new Set(subscribers.map((s) => s.source))]
    return uniqueSources
  }, [subscribers])

  const handleAddSubscriber = async () => {
    if (!formData.email) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/subscriptions/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          email: formData.email,
          name: formData.name || null,
          phone: formData.phone || null,
          country: formData.country || null,
          city: formData.city || null,
          source: "manual_add",
        }),
      })

      if (response.ok) {
        setIsAddDialogOpen(false)
        setFormData({ email: "", name: "", phone: "", country: "", city: "" })
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to add subscriber:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditSubscriber = async () => {
    if (!editingSubscriber) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/subscriptions/manage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          id: editingSubscriber.id,
          email: formData.email,
          name: formData.name || null,
          phone: formData.phone || null,
          country: formData.country || null,
          city: formData.city || null,
        }),
      })

      if (response.ok) {
        setEditingSubscriber(null)
        setFormData({ email: "", name: "", phone: "", country: "", city: "" })
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to edit subscriber:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSubscriber = async (id: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/subscriptions/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete subscriber:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = (subscriber: Subscriber) => {
    setEditingSubscriber(subscriber)
    setFormData({
      email: subscriber.subscriber_email,
      name: subscriber.subscriber_name || "",
      phone: subscriber.subscriber_phone || "",
      country: subscriber.subscriber_country || "",
      city: subscriber.subscriber_city || "",
    })
  }

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ["Email", "Name", "Phone", "Country", "City", "Subscribed Date", "Source"],
      ...filteredSubscribers.map((subscriber) => [
        subscriber.subscriber_email,
        subscriber.subscriber_name || "",
        subscriber.subscriber_phone || "",
        subscriber.subscriber_country || "",
        subscriber.subscriber_city || "",
        new Date(subscriber.created_at).toLocaleDateString(),
        subscriber.source,
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `subscribers-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
            <p className="text-xs text-muted-foreground">Active subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                subscribers.filter((s) => {
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  return new Date(s.created_at) >= weekAgo
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">New this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                subscribers.filter((s) => {
                  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  return new Date(s.created_at) >= monthAgo
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">New this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(subscribers.filter((s) => s.subscriber_country).map((s) => s.subscriber_country)).size}
            </div>
            <p className="text-xs text-muted-foreground">Different countries</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Subscriber List</CardTitle>
              <CardDescription>Manage and export your email subscribers</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="default">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    // Switch to campaigns tab
                    const campaignsTab = document.querySelector('[value="campaigns"]') as HTMLElement
                    campaignsTab?.click()
                  }}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </a>
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscriber
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Subscriber</DialogTitle>
                    <DialogDescription>Manually add a new subscriber to your list.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="subscriber@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          placeholder="United States"
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
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddSubscriber} disabled={!formData.email || isLoading}>
                      {isLoading ? "Adding..." : "Add Subscriber"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button onClick={exportToCSV} disabled={filteredSubscribers.length === 0} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV ({filteredSubscribers.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {sources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscribers Table */}
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {subscribers.length === 0 ? "No subscribers yet" : "No subscribers match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {subscribers.length === 0
                  ? "Add a subscription block to your profile to start collecting emails."
                  : "Try adjusting your search terms or filters."}
              </p>
              {subscribers.length === 0 && (
                <Button asChild>
                  <a href="/profile/blocks">Add Subscription Block</a>
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.subscriber_email}</TableCell>
                      <TableCell>
                        {subscriber.subscriber_name || (
                          <span className="text-muted-foreground italic">No name provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {subscriber.subscriber_country && (
                            <div className="flex items-center gap-1">
                              <Globe className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{subscriber.subscriber_country}</span>
                            </div>
                          )}
                          {subscriber.subscriber_city && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{subscriber.subscriber_city}</span>
                            </div>
                          )}
                          {!subscriber.subscriber_country && !subscriber.subscriber_city && (
                            <span className="text-muted-foreground italic text-sm">Unknown</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(subscriber.created_at).toLocaleDateString()}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(subscriber.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {subscriber.source.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(subscriber)}>
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
                                <AlertDialogTitle>Delete Subscriber</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {subscriber.subscriber_email}? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSubscriber(subscriber.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubscriber} onOpenChange={() => setEditingSubscriber(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscriber</DialogTitle>
            <DialogDescription>Update subscriber information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="subscriber@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                />
              </div>
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubscriber(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubscriber} disabled={!formData.email || isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
