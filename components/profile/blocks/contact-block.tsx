"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Globe, Copy, Send, CheckCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"

interface ContactBlockProps {
  block: any
  theme?: string
  profileId?: string
}

export function ContactBlock({ block, theme = "default", profileId }: ContactBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  })

  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  const {
    mode = "display",
    type,
    label,
    value,
    formTitle,
    formDescription,
    notificationEmail,
    successMessage,
  } = block.content || {}

  console.log("[v0] ContactBlock rendered with profileId:", profileId)

  // Display mode (existing functionality)
  if (mode === "display") {
    if (!type || !value) return null

    const contactIcons = {
      email: Mail,
      phone: Phone,
      address: MapPin,
      website: Globe,
    }

    const ContactIcon = contactIcons[type as keyof typeof contactIcons] || Mail

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }

    const getHref = () => {
      switch (type) {
        case "email":
          return `mailto:${value}`
        case "phone":
          return `tel:${value}`
        case "website":
          return value.startsWith("http") ? value : `https://${value}`
        default:
          return "#"
      }
    }

    const isClickable = type !== "address"

    return (
      <Card className={`${classes.card} hover:shadow-md transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div
                className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center"
              >
                <ContactIcon className="h-6 w-6 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`${getTextClasses({ theme, type: "heading", size: "base" })} text-base`}>{block.title || label || "Contact"}</h3>
                {isClickable ? (
                  <a
                    href={getHref()}
                    className="text-sm text-gray-700 hover:opacity-80 transition-colors truncate block"
                    target={type === "website" ? "_blank" : undefined}
                    rel={type === "website" ? "noopener noreferrer" : undefined}
                  >
                    {value}
                  </a>
                ) : (
                  <p className={`text-sm ${getTextClasses({ theme, type: "muted", size: "sm" })} truncate`}>{value}</p>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="flex-shrink-0">
              <Copy className="h-4 w-4" />
              {copied && <span className="ml-1 text-xs">Copied!</span>}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Form mode (new functionality)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setError("All fields are required")
      return
    }

    console.log("[v0] Submitting contact form with profileId:", profileId)

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/contact-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          blockId: block.id,
          name: formData.name,
          subject: formData.subject,
          message: formData.message,
          notificationEmail,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Contact form submission failed:", errorData)
        throw new Error(errorData.error || "Failed to send message")
      }

      setIsSuccess(true)
      setFormData({ name: "", subject: "", message: "" })
    } catch (err) {
      console.error("[v0] Contact form error:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("")
  }

  if (isSuccess) {
    return (
      <Card className={`${classes.card}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className={`${getTextClasses({ theme, type: "heading", size: "lg" })} mb-2`}>Message Sent!</h3>
              <p className={`${getTextClasses({ theme, type: "muted", size: "base" })}`}>
                {successMessage || "Thanks for your message! I'll get back to you soon."}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSuccess(false)}
                className="mt-3 text-gray-700 hover:text-black"
              >
                Send another message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`${classes.card}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0"
          >
            <Mail className="h-6 w-6 text-gray-700" />
          </div>
          <div className="flex-1">
            <h3 className={`${getTextClasses({ theme, type: "heading", size: "lg" })} mb-2 text-balance`}>
              {block.title || formTitle || "Get in Touch"}
            </h3>
            {formDescription && <p className={`${getTextClasses({ theme, type: "muted", size: "base" })} mb-4 text-pretty`}>{formDescription}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Email *</Label>
                <Input
                  id="name"
                  type="Email"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Your Email"
                  required
                  className="bg-white/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  placeholder="What's this about?"
                  required
                  className="bg-white/90"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Your message..."
                  required
                  rows={4}
                  className="bg-white/90 resize-none"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button
                type="submit"
                disabled={isLoading || !formData.name.trim() || !formData.subject.trim() || !formData.message.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>

            <p className={`${getTextClasses({ theme, type: "muted", size: "xs" })} mt-3`}>
              All fields are required. Your message will be sent directly to the profile owner.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
