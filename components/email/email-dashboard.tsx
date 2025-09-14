"use client"

import { useState } from "react"
import { SubscriberSelector } from "./subscriber-selector"
import { EmailComposer } from "./email-composer"
import { EmailTemplates } from "./email-templates"
import { SmtpSettings } from "./smtp-settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Mail } from "lucide-react"

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

interface EmailData {
  subject: string
  body: string
  isHtml: boolean
  recipients: string[]
  sendType: "individual" | "bulk"
}

interface EmailTemplate {
  id: string
  name: string
  description: string
  subject: string
  htmlContent: string
  textContent: string
  category: "newsletter" | "announcement" | "welcome" | "promotional"
}

interface EmailDashboardProps {
  subscribers: Subscriber[]
  isGmailConnected: boolean
  gmailEmail?: string
}

export function EmailDashboard({ subscribers, isGmailConnected, gmailEmail }: EmailDashboardProps) {
  const [currentStep, setCurrentStep] = useState<"select" | "compose">("select")
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([])

  const handleSendEmail = async (emailData: EmailData) => {
    try {
      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(emailData),
      })

      if (!response.ok) {
        throw new Error("Failed to send email")
      }

      // Reset and go back to selection
      setSelectedSubscribers([])
      setCurrentStep("select")
    } catch (error) {
      throw error // Re-throw to let EmailComposer handle the error display
    }
  }

  const handleTemplateSelect = (template: EmailTemplate) => {
    // This would be handled by the EmailComposer component
    // For now, we'll just switch to compose step
    if (selectedSubscribers.length > 0) {
      setCurrentStep("compose")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Campaign</h1>
          <p className="text-muted-foreground">Send emails to your subscribers</p>
        </div>
        {currentStep === "compose" && (
          <Button variant="outline" onClick={() => setCurrentStep("select")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Selection
          </Button>
        )}
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div
              className={`flex items-center space-x-2 ${currentStep === "select" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "select" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <Users className="h-4 w-4" />
              </div>
              <span className="font-medium">Select Recipients</span>
            </div>
            <div className="flex-1 h-px bg-border" />
            <div
              className={`flex items-center space-x-2 ${currentStep === "compose" ? "text-primary" : "text-muted-foreground"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === "compose" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <Mail className="h-4 w-4" />
              </div>
              <span className="font-medium">Compose & Send</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {currentStep === "select" ? (
        <SubscriberSelector
          subscribers={subscribers}
          selectedSubscribers={selectedSubscribers}
          onSelectedSubscribersChange={setSelectedSubscribers}
          onProceedToCompose={() => setCurrentStep("compose")}
        />
      ) : (
        <Tabs defaultValue="compose" className="space-y-6">
          <TabsList>
            <TabsTrigger value="compose">Compose Email</TabsTrigger>
            <TabsTrigger value="templates">Email Templates</TabsTrigger>
            <TabsTrigger value="smtp-settings">SMTP Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <EmailComposer
              subscribers={subscribers}
              selectedSubscribers={selectedSubscribers}
              onSelectedSubscribersChange={setSelectedSubscribers}
              onSendEmail={handleSendEmail}
              isGmailConnected={isGmailConnected}
              gmailEmail={gmailEmail}
            />
          </TabsContent>

          <TabsContent value="templates">
            <EmailTemplates onSelectTemplate={handleTemplateSelect} />
          </TabsContent>

          <TabsContent value="smtp-settings">
            <SmtpSettings />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
