"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface WhatsAppBlockProps {
  block: any
  theme?: string
  profileId?: string
}

export function WhatsAppBlock({ block, theme = "default", profileId }: WhatsAppBlockProps) {
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  const { phoneNumber, message, buttonText, description } = block.content || {}

  if (!phoneNumber) return null

  // Format phone number for WhatsApp API
  const formattedPhone = phoneNumber.replace(/[\s+\-()]/g, "")
  
  // Create WhatsApp URL with optional pre-filled message
  const whatsappUrl = `https://wa.me/${formattedPhone}${message ? `?text=${encodeURIComponent(message)}` : ""}`

  return (
    <Card className={`${classes.card} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${classes.primary.replace(
              "text-",
              "bg-"
            ).replace("-600", "-100")}`}
          >
            <MessageSquare className={`h-8 w-8 ${classes.primary}`} />
          </div>
          
          <div>
            <h3 className={`${classes.heading} text-lg mb-2`}>{block.title || "WhatsApp"}</h3>
            {description && <p className={`${classes.muted} mb-4`}>{description}</p>}
          </div>
          
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button className="w-full" size="lg">
              <MessageSquare className="h-5 w-5 mr-2" />
              {buttonText || "Chat on WhatsApp"}
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}