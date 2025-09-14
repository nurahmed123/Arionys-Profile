"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Globe, MapPin, Calendar, CheckSquare, Square, Mail, Filter, X } from "lucide-react"

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

interface SubscriberSelectorProps {
  subscribers: Subscriber[]
  selectedSubscribers: string[]
  onSelectedSubscribersChange: (ids: string[]) => void
  onProceedToCompose: () => void
}

export function SubscriberSelector({
  subscribers,
  selectedSubscribers,
  onSelectedSubscribersChange,
  onProceedToCompose,
}: SubscriberSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [countryFilter, setCountryFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  // Filter subscribers based on search and filters
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((subscriber) => {
      const matchesSearch =
        subscriber.subscriber_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (subscriber.subscriber_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (subscriber.subscriber_country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)

      const matchesCountry = countryFilter === "all" || subscriber.subscriber_country === countryFilter
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

      return matchesSearch && matchesCountry && matchesSource && matchesDate
    })
  }, [subscribers, searchTerm, countryFilter, sourceFilter, dateFilter])

  // Get unique values for filter dropdowns
  const countries = useMemo(() => {
    const uniqueCountries = [
      ...new Set(subscribers.filter((s) => s.subscriber_country).map((s) => s.subscriber_country)),
    ]
    return uniqueCountries.sort()
  }, [subscribers])

  const sources = useMemo(() => {
    const uniqueSources = [...new Set(subscribers.map((s) => s.source))]
    return uniqueSources
  }, [subscribers])

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedSubscribers.length === filteredSubscribers.length) {
      onSelectedSubscribersChange([])
    } else {
      onSelectedSubscribersChange(filteredSubscribers.map((s) => s.id))
    }
  }

  const handleSelectSubscriber = (subscriberId: string) => {
    if (selectedSubscribers.includes(subscriberId)) {
      onSelectedSubscribersChange(selectedSubscribers.filter((id) => id !== subscriberId))
    } else {
      onSelectedSubscribersChange([...selectedSubscribers, subscriberId])
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCountryFilter("all")
    setSourceFilter("all")
    setDateFilter("all")
  }

  const hasActiveFilters = searchTerm || countryFilter !== "all" || sourceFilter !== "all" || dateFilter !== "all"

  const selectedSubscribersList = subscribers.filter((s) => selectedSubscribers.includes(s.id))

  return (
    <div className="space-y-6">
      {/* Selection Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Select Recipients</span>
              </CardTitle>
              <CardDescription>Choose which subscribers will receive your email</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                {selectedSubscribers.length} of {filteredSubscribers.length} selected
              </Badge>
              <Button onClick={onProceedToCompose} disabled={selectedSubscribers.length === 0}>
                <Mail className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
            </div>
          </div>
        </CardHeader>

        {selectedSubscribers.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Selected Recipients:</span>
                <Button variant="outline" size="sm" onClick={() => onSelectedSubscribersChange([])}>
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {selectedSubscribersList.map((subscriber) => (
                  <Badge key={subscriber.id} variant="secondary" className="flex items-center space-x-1 pr-1">
                    <span className="text-xs">{subscriber.subscriber_email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleSelectSubscriber(subscriber.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Subscribers</span>
            </CardTitle>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email, name, country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All countries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country!}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscribers ({filteredSubscribers.length})</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll} disabled={filteredSubscribers.length === 0}>
                {selectedSubscribers.length === filteredSubscribers.length ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Select All
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {subscribers.length === 0 ? "No subscribers yet" : "No subscribers match your filters"}
              </h3>
              <p className="text-muted-foreground">
                {subscribers.length === 0
                  ? "Add a subscription block to your profile to start collecting emails."
                  : "Try adjusting your search terms or filters."}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all subscribers"
                      />
                    </TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSubscribers.includes(subscriber.id)}
                          onCheckedChange={() => handleSelectSubscriber(subscriber.id)}
                          aria-label={`Select ${subscriber.subscriber_email}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{subscriber.subscriber_email}</TableCell>
                      <TableCell>
                        {subscriber.subscriber_name || <span className="text-muted-foreground italic">No name</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
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
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{new Date(subscriber.created_at).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {subscriber.source.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
