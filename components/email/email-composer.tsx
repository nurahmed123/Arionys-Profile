"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Eye, Users, User, Mail, Type, Code, X, CheckCircle2, Server } from "lucide-react"

interface Subscriber {
  id: string
  subscriber_email: string
  subscriber_name?: string
  subscriber_country?: string
  subscriber_city?: string
  created_at: string
}

interface SmtpSetting {
  id: string
  display_name: string
  host: string
  port: number
  username: string
  is_active: boolean
}

interface EmailComposerProps {
  subscribers: Subscriber[]
  selectedSubscribers: string[]
  onSelectedSubscribersChange: (ids: string[]) => void
  onSendEmail: (emailData: EmailData) => Promise<void>
  isGmailConnected: boolean
  gmailEmail?: string
}

interface EmailData {
  subject: string
  body: string
  isHtml: boolean
  recipients: string[]
  sendType: "individual" | "bulk"
  method?: "gmail" | "smtp"
  smtpSettingId?: string
}

export function EmailComposer({
  subscribers,
  selectedSubscribers,
  onSelectedSubscribersChange,
  onSendEmail,
  isGmailConnected,
  gmailEmail,
}: EmailComposerProps) {
  const [subject, setSubject] = useState("")
  const [textBody, setTextBody] = useState("")
  const [htmlBody, setHtmlBody] = useState("")
  const [emailType, setEmailType] = useState<"text" | "html">("text")
  const [sendType, setSendType] = useState<"individual" | "bulk">("bulk")
  const [sendMethod, setSendMethod] = useState<"gmail" | "smtp">("gmail")
  const [selectedSmtpId, setSelectedSmtpId] = useState<string>("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendStatus, setSendStatus] = useState<"idle" | "success" | "error">("idle")
  const [smtpSettings, setSmtpSettings] = useState<SmtpSetting[]>([])

  const selectedSubscribersList = subscribers.filter((sub) => selectedSubscribers.includes(sub.id))

  useEffect(() => {
    fetchSmtpSettings()
  }, [])

  const fetchSmtpSettings = async () => {
    try {
      const response = await fetch("/api/smtp-settings")
      if (response.ok) {
        const data = await response.json()
        setSmtpSettings(data.smtpSettings || [])
        // Auto-select first SMTP setting if available and Gmail not connected
        if (!isGmailConnected && data.smtpSettings?.length > 0) {
          setSendMethod("smtp")
          setSelectedSmtpId(data.smtpSettings[0].id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch SMTP settings:", error)
    }
  }

  const handleSend = async () => {
    if (!subject.trim() || (!textBody.trim() && !htmlBody.trim())) {
      return
    }

    if (sendMethod === "smtp" && !selectedSmtpId) {
      return
    }

    setIsSending(true)
    setSendStatus("idle")

    try {
      const emailData: EmailData = {
        subject,
        body: emailType === "html" ? htmlBody : textBody,
        isHtml: emailType === "html",
        recipients: selectedSubscribersList.map((sub) => sub.subscriber_email),
        sendType,
        method: sendMethod,
      }

      if (sendMethod === "smtp") {
        emailData.smtpSettingId = selectedSmtpId
        // Send via SMTP
        const response = await fetch("/api/smtp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailData),
        })

        if (!response.ok) {
          throw new Error("Failed to send email via SMTP")
        }
      } else {
        // Send via Gmail (existing functionality)
        await onSendEmail(emailData)
      }

      setSendStatus("success")
      // Reset form after successful send
      setTimeout(() => {
        setSubject("")
        setTextBody("")
        setHtmlBody("")
        setSendStatus("idle")
      }, 3000)
    } catch (error) {
      setSendStatus("error")
    } finally {
      setIsSending(false)
    }
  }

  const removeSubscriber = (subscriberId: string) => {
    onSelectedSubscribersChange(selectedSubscribers.filter((id) => id !== subscriberId))
  }

  const canSend =
    selectedSubscribersList.length > 0 &&
    subject.trim() &&
    (textBody.trim() || htmlBody.trim()) &&
    ((sendMethod === "gmail" && isGmailConnected) || (sendMethod === "smtp" && selectedSmtpId))

  return (
    <div className="space-y-6">
      {/* Email Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Email Sending Method</CardTitle>
          <CardDescription>Choose how you want to send your emails</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gmail Option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                sendMethod === "gmail" ? "border-primary bg-primary/5" : "border-border"
              } ${!isGmailConnected ? "opacity-50" : ""}`}
              onClick={() => isGmailConnected && setSendMethod("gmail")}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${sendMethod === "gmail" ? "border-primary bg-primary" : "border-border"}`}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span className="font-medium">Gmail OAuth</span>
                    {isGmailConnected && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isGmailConnected ? `Connected: ${gmailEmail}` : "Not connected"}
                  </p>
                </div>
              </div>
              {!isGmailConnected && (
                <Button
                  className="mt-3 w-full bg-transparent"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.location.href = "/api/gmail/auth"
                  }}
                >
                  Connect Gmail
                </Button>
              )}
            </div>

            {/* SMTP Option */}
            <div
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                sendMethod === "smtp" ? "border-primary bg-primary/5" : "border-border"
              } ${smtpSettings.length === 0 ? "opacity-50" : ""}`}
              onClick={() => smtpSettings.length > 0 && setSendMethod("smtp")}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${sendMethod === "smtp" ? "border-primary bg-primary" : "border-border"}`}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4" />
                    <span className="font-medium">SMTP (App Password)</span>
                    {smtpSettings.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {smtpSettings.length > 0 ? `${smtpSettings.length} configuration(s)` : "No SMTP configured"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SMTP Selection */}
          {sendMethod === "smtp" && smtpSettings.length > 0 && (
            <div className="mt-4">
              <Label>Select SMTP Configuration</Label>
              <Select value={selectedSmtpId} onValueChange={setSelectedSmtpId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose SMTP configuration" />
                </SelectTrigger>
                <SelectContent>
                  {smtpSettings.map((setting) => (
                    <SelectItem key={setting.id} value={setting.id}>
                      <div className="flex items-center space-x-2">
                        <span>{setting.display_name}</span>
                        <Badge variant="secondary">{setting.username}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Recipients ({selectedSubscribersList.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSubscribersList.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No subscribers selected. Go back to select recipients.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedSubscribersList.map((subscriber) => (
                  <Badge key={subscriber.id} variant="secondary" className="flex items-center space-x-1 pr-1">
                    <span>{subscriber.subscriber_email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => removeSubscriber(subscriber.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>

              <Separator />

              <div className="flex items-center space-x-4">
                <Label>Send Type:</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={sendType === "bulk" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSendType("bulk")}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Bulk Email
                  </Button>
                  <Button
                    variant={sendType === "individual" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSendType("individual")}
                  >
                    <User className="h-4 w-4 mr-1" />
                    Individual Emails
                  </Button>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {sendType === "bulk"
                  ? "All recipients will receive the same email with all addresses visible"
                  : "Each recipient will receive a personalized email"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Compose Email</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
            />
          </div>

          {/* Email Type Tabs */}
          <Tabs value={emailType} onValueChange={(value) => setEmailType(value as "text" | "html")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <Type className="h-4 w-4" />
                <span>Plain Text</span>
              </TabsTrigger>
              <TabsTrigger value="html" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>HTML</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="textBody">Message</Label>
              <Textarea
                id="textBody"
                value={textBody}
                onChange={(e) => setTextBody(e.target.value)}
                placeholder="Write your message here..."
                rows={10}
                className="font-mono"
              />
            </TabsContent>

            <TabsContent value="html" className="space-y-2">
              <Label htmlFor="htmlBody">HTML Content</Label>
              <Textarea
                id="htmlBody"
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                placeholder="<h1>Your HTML content here...</h1>"
                rows={10}
                className="font-mono"
              />
              <p className="text-sm text-muted-foreground">
                Write HTML content directly or paste from your HTML editor
              </p>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
              disabled={!subject.trim() || (!textBody.trim() && !htmlBody.trim())}
            >
              <Eye className="h-4 w-4 mr-2" />
              {isPreviewOpen ? "Hide Preview" : "Preview"}
            </Button>

            <div className="flex items-center space-x-2">
              {sendStatus === "success" && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Sent Successfully
                </Badge>
              )}
              {sendStatus === "error" && <Badge variant="destructive">Failed to Send</Badge>}

              <Button onClick={handleSend} disabled={isSending || !canSend}>
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {isPreviewOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Email Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white">
              <div className="border-b pb-2 mb-4">
                <p className="text-sm text-muted-foreground">Subject:</p>
                <p className="font-medium">{subject || "No subject"}</p>
              </div>

              {emailType === "html" ? (
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: htmlBody || "<p>No content</p>" }}
                />
              ) : (
                <div className="whitespace-pre-wrap font-mono text-sm">{textBody || "No content"}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
