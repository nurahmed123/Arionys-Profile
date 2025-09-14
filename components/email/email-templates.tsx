"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Sparkles, Megaphone, Heart } from "lucide-react"

interface EmailTemplate {
  id: string
  name: string
  description: string
  subject: string
  htmlContent: string
  textContent: string
  category: "newsletter" | "announcement" | "welcome" | "promotional"
}

interface EmailTemplatesProps {
  onSelectTemplate: (template: EmailTemplate) => void
}

const templates: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Welcome Email",
    description: "Welcome new subscribers to your community",
    subject: "Welcome to our community! 🎉",
    category: "welcome",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; text-align: center;">Welcome!</h1>
        <p>Hi there!</p>
        <p>Thank you for subscribing to our updates. We're excited to have you as part of our community!</p>
        <p>You can expect to receive:</p>
        <ul>
          <li>Regular updates about our latest content</li>
          <li>Exclusive insights and tips</li>
          <li>Special announcements</li>
        </ul>
        <p>Best regards,<br>Your Team</p>
      </div>
    `,
    textContent: `Hi there!

Thank you for subscribing to our updates. We're excited to have you as part of our community!

You can expect to receive:
- Regular updates about our latest content
- Exclusive insights and tips  
- Special announcements

Best regards,
Your Team`,
  },
  {
    id: "newsletter",
    name: "Newsletter Template",
    description: "Regular newsletter format with sections",
    subject: "Your Weekly Update",
    category: "newsletter",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Weekly Update</h1>
        
        <h2 style="color: #374151;">📰 This Week's Highlights</h2>
        <p>Add your main content here...</p>
        
        <h2 style="color: #374151;">🔗 Featured Links</h2>
        <ul>
          <li><a href="#" style="color: #2563eb;">Link 1</a></li>
          <li><a href="#" style="color: #2563eb;">Link 2</a></li>
        </ul>
        
        <hr style="margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Thanks for reading! Reply to this email if you have any questions.
        </p>
      </div>
    `,
    textContent: `Weekly Update

📰 This Week's Highlights
Add your main content here...

🔗 Featured Links
- Link 1
- Link 2

---
Thanks for reading! Reply to this email if you have any questions.`,
  },
  {
    id: "announcement",
    name: "Announcement",
    description: "Important announcements and updates",
    subject: "Important Update",
    category: "announcement",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h1 style="color: #92400e; margin: 0;">📢 Important Announcement</h1>
        </div>
        
        <p>We have an important update to share with you:</p>
        
        <div style="background: #f9fafb; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Add your announcement details here...</strong></p>
        </div>
        
        <p>If you have any questions, please don't hesitate to reach out.</p>
        
        <p>Best regards,<br>Your Team</p>
      </div>
    `,
    textContent: `📢 IMPORTANT ANNOUNCEMENT

We have an important update to share with you:

Add your announcement details here...

If you have any questions, please don't hesitate to reach out.

Best regards,
Your Team`,
  },
]

export function EmailTemplates({ onSelectTemplate }: EmailTemplatesProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "welcome":
        return <Heart className="h-4 w-4" />
      case "newsletter":
        return <FileText className="h-4 w-4" />
      case "announcement":
        return <Megaphone className="h-4 w-4" />
      case "promotional":
        return <Sparkles className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "welcome":
        return "bg-pink-100 text-pink-800"
      case "newsletter":
        return "bg-blue-100 text-blue-800"
      case "announcement":
        return "bg-yellow-100 text-yellow-800"
      case "promotional":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Email Templates</h3>
        <p className="text-muted-foreground text-sm">Choose a template to get started quickly</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center space-x-2">
                  {getCategoryIcon(template.category)}
                  <span>{template.name}</span>
                </CardTitle>
                <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Subject:</p>
                  <p className="text-sm">{template.subject}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-transparent"
                  onClick={() => onSelectTemplate(template)}
                >
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
