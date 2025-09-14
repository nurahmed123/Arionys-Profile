"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart3,
  Mail,
  Users,
  TrendingUp,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Clock,
  Trash2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Campaign {
  id: string
  subject: string
  body: string
  is_html: boolean
  send_type: "individual" | "bulk"
  recipients_count: number
  sent_count: number
  failed_count: number
  sent_at: string
  created_at: string
}

interface CampaignStats {
  totalCampaigns: number
  totalEmailsSent: number
  totalRecipients: number
  averageSuccessRate: number
  recentCampaigns: Campaign[]
}

interface SentEmail {
  id: string
  campaign_id: string
  recipient_email: string
  recipient_name: string | null
  status: "sent" | "failed" | "pending"
  error_message: string | null
  sent_at: string
  created_at: string
}

export function CampaignAnalytics() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [sentEmails, setSentEmails] = useState<SentEmail[]>([])
  const [emailsLoading, setEmailsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/gmail/campaigns?limit=100")

      if (!response.ok) {
        throw new Error("Failed to fetch campaigns")
      }

      const data = await response.json()
      setCampaigns(data.campaigns || [])

      const totalCampaigns = data.campaigns?.length || 0
      const totalEmailsSent = data.campaigns?.reduce((sum: number, c: Campaign) => sum + c.sent_count, 0) || 0
      const totalRecipients = data.campaigns?.reduce((sum: number, c: Campaign) => sum + c.recipients_count, 0) || 0
      const totalSuccessful = data.campaigns?.reduce((sum: number, c: Campaign) => sum + c.sent_count, 0) || 0
      const totalAttempted = data.campaigns?.reduce((sum: number, c: Campaign) => sum + c.recipients_count, 0) || 0
      const averageSuccessRate = totalAttempted > 0 ? (totalSuccessful / totalAttempted) * 100 : 0

      setStats({
        totalCampaigns,
        totalEmailsSent,
        totalRecipients,
        averageSuccessRate,
        recentCampaigns: data.campaigns?.slice(0, 5) || [],
      })

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchSentEmails = async (campaignId: string) => {
    setEmailsLoading(true)
    try {
      const response = await fetch(`/api/gmail/campaigns/${campaignId}/emails`)
      if (!response.ok) {
        throw new Error("Failed to fetch sent emails")
      }
      const data = await response.json()
      setSentEmails(data.emails || [])

      const sentCount = data.emails?.filter((email: SentEmail) => email.status === "sent").length || 0
      const failedCount = data.emails?.filter((email: SentEmail) => email.status === "failed").length || 0

      // Update the campaign in state with real counts
      setCampaigns((prev) =>
        prev.map((c) => (c.id === campaignId ? { ...c, sent_count: sentCount, failed_count: failedCount } : c)),
      )

      // Update selected campaign
      setSelectedCampaign((prev) =>
        prev?.id === campaignId ? { ...prev, sent_count: sentCount, failed_count: failedCount } : prev,
      )
    } catch (err) {
      console.error("Error fetching sent emails:", err)
      setSentEmails([])
    } finally {
      setEmailsLoading(false)
    }
  }

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    fetchSentEmails(campaign.id)
  }

  const getSuccessRate = (campaign: Campaign) => {
    if (campaign.recipients_count === 0) return 0
    return ((campaign.sent_count / campaign.recipients_count) * 100).toFixed(1)
  }

  const getStatusBadge = (campaign: Campaign) => {
    const totalProcessed = campaign.sent_count + campaign.failed_count
    const successRate = campaign.recipients_count > 0 ? (campaign.sent_count / campaign.recipients_count) * 100 : 0

    if (campaign.recipients_count > 0 && campaign.sent_count === campaign.recipients_count) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      )
    }

    // If no emails have been processed yet, show processing
    if (totalProcessed === 0 && campaign.recipients_count > 0) {
      return (
        <Badge variant="secondary" className="bg-blue-500 text-white">
          <Clock className="h-3 w-3 mr-1" />
          Processing
        </Badge>
      )
    }

    if (successRate === 100) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Success
        </Badge>
      )
    } else if (successRate > 80) {
      return (
        <Badge variant="secondary">
          <TrendingUp className="h-3 w-3 mr-1" />
          Mostly Sent
        </Badge>
      )
    } else if (successRate > 0) {
      return (
        <Badge variant="outline">
          <Send className="h-3 w-3 mr-1" />
          Partial
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      )
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    setDeleting(true)
    try {
      console.log("[v0] Attempting to delete campaign:", campaignId)

      const response = await fetch(`/api/gmail/campaigns/${campaignId}`, {
        method: "DELETE",
      })

      console.log("[v0] Delete response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Delete error response:", errorData)
        throw new Error(errorData.error || "Failed to delete campaign")
      }

      const responseData = await response.json()
      console.log("[v0] Delete success response:", responseData)

      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId))

      // Update stats immediately
      if (stats) {
        const deletedCampaign = campaigns.find((c) => c.id === campaignId)
        if (deletedCampaign) {
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  totalCampaigns: prev.totalCampaigns - 1,
                  totalEmailsSent: prev.totalEmailsSent - deletedCampaign.sent_count,
                  totalRecipients: prev.totalRecipients - deletedCampaign.recipients_count,
                  recentCampaigns: prev.recentCampaigns.filter((c) => c.id !== campaignId),
                }
              : null,
          )
        }
      }

      // Close dialogs
      setDeleteDialogOpen(false)
      setCampaignToDelete(null)
      if (selectedCampaign?.id === campaignId) {
        setSelectedCampaign(null)
      }

      setTimeout(() => {
        fetchCampaigns()
      }, 500)
    } catch (err) {
      console.error("[v0] Error deleting campaign:", err)
      setError(err instanceof Error ? err.message : "Failed to delete campaign")
      await fetchCampaigns()
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent campaign details from opening
    setCampaignToDelete(campaign)
    setDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading campaign analytics...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchCampaigns} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.totalCampaigns === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
            <p className="text-muted-foreground">Send your first email campaign to see analytics here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Campaign Analytics</h2>
          <p className="text-muted-foreground">Track your email campaign performance</p>
        </div>
        <Button onClick={fetchCampaigns} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">Email campaigns sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Delivered</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmailsSent}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipients}</div>
            <p className="text-xs text-muted-foreground">Email addresses reached</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average delivery rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Campaigns</TabsTrigger>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
              <CardDescription>Your last 5 email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{campaign.subject}</h4>
                        {getStatusBadge(campaign)}
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => handleDeleteClick(campaign, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(campaign.sent_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {campaign.recipients_count} recipients
                        </span>
                        <span className="flex items-center">
                          <Send className="h-3 w-3 mr-1" />
                          {campaign.sent_count} sent
                        </span>
                        {campaign.failed_count > 0 && (
                          <span className="flex items-center text-destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {campaign.failed_count} failed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{getSuccessRate(campaign)}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Campaigns</CardTitle>
              <CardDescription>Complete history of your email campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCampaignClick(campaign)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium">{campaign.subject}</h4>
                        {getStatusBadge(campaign)}
                        <Badge variant="outline" className="text-xs">
                          {campaign.send_type}
                        </Badge>
                        <Button variant="ghost" size="sm" className="ml-2">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => handleDeleteClick(campaign, e)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(campaign.sent_at), { addSuffix: true })}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {campaign.recipients_count} recipients
                        </span>
                        <span className="flex items-center">
                          <Send className="h-3 w-3 mr-1" />
                          {campaign.sent_count} sent
                        </span>
                        {campaign.failed_count > 0 && (
                          <span className="flex items-center text-destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            {campaign.failed_count} failed
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{getSuccessRate(campaign)}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Campaign Details: {selectedCampaign?.subject}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedCampaign && (
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="emails" className="h-full flex flex-col">
                <div className="px-6">
                  <TabsList>
                    <TabsTrigger value="emails">Sent Emails ({selectedCampaign.sent_count})</TabsTrigger>
                    <TabsTrigger value="content">Email Content</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="emails" className="flex-1 px-6 pb-6">
                  <ScrollArea className="h-[500px]">
                    {emailsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                        <span>Loading sent emails...</span>
                      </div>
                    ) : sentEmails.length === 0 ? (
                      <div className="text-center py-12">
                        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No emails found</h3>
                        <p className="text-muted-foreground">No sent emails found for this campaign.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Recipient</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Sent At</TableHead>
                            <TableHead>Error</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sentEmails.map((email) => (
                            <TableRow key={email.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{email.recipient_email}</div>
                                  {email.recipient_name && (
                                    <div className="text-sm text-muted-foreground">{email.recipient_name}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    email.status === "sent"
                                      ? "default"
                                      : email.status === "failed"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                  className={email.status === "sent" ? "bg-green-500" : ""}
                                >
                                  {email.status === "sent" && <CheckCircle className="h-3 w-3 mr-1" />}
                                  {email.status === "failed" && <XCircle className="h-3 w-3 mr-1" />}
                                  {email.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                                  {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {new Date(email.sent_at).toLocaleDateString()}
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(email.sent_at).toLocaleTimeString()}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {email.error_message ? (
                                  <div className="text-sm text-red-600 max-w-xs truncate" title={email.error_message}>
                                    {email.error_message}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="content" className="flex-1 px-6 pb-6">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Subject</h4>
                        <p className="text-sm bg-gray-50 p-3 rounded">{selectedCampaign.subject}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Content</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          {selectedCampaign.is_html ? (
                            <div
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: selectedCampaign.body }}
                            />
                          ) : (
                            <pre className="text-sm whitespace-pre-wrap">{selectedCampaign.body}</pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="stats" className="flex-1 px-6 pb-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Recipients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{selectedCampaign.recipients_count}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Successfully Sent</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">{selectedCampaign.sent_count}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Failed</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{selectedCampaign.failed_count}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{getSuccessRate(selectedCampaign)}%</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the campaign "{campaignToDelete?.subject}"? This action cannot be undone
              and will also delete all associated email records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => campaignToDelete && deleteCampaign(campaignToDelete.id)}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Campaign
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
