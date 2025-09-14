"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, CheckCircle, Loader2 } from "lucide-react"
import { useState } from "react"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"

interface SubscriptionBlockProps {
  block: any
  theme?: string
  profileId?: string
}

export function SubscriptionBlock({ block, theme = "default", profileId }: SubscriptionBlockProps) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  const { title, description, buttonText, successMessage, collectName } = block.content

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId,
          email,
          name: collectName === "yes" ? name : null,
          source: "profile_block",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to subscribe")
      }

      setIsSuccess(true)
      setEmail("")
      setName("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className={classes.card}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-gray-700" />
            </div>
            <div className="flex-1">
              <h3 className={`${getTextClasses({theme, type: "heading", size: "lg"})} mb-2`}>Success!</h3>
              <p className={`${getTextClasses({theme, type: "body"})}`}>{successMessage || "Thanks for subscribing! You'll hear from us soon."}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSuccess(false)}
                className="mt-3"
              >
                Subscribe another email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={classes.card}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0"
          >
            <Mail className="h-6 w-6 text-gray-700" />
          </div>
          <div className="flex-1">
            <h3 className={`${getTextClasses({theme, type: "heading", size: "lg"})} mb-2 text-balance`}>
              {block.title || title || "Subscribe to updates"}
            </h3>
            {description && <p className={`${getTextClasses({theme, type: "muted"})} mb-4 text-pretty`}>{description}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {collectName === "yes" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-white/90"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-white/90"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" disabled={isLoading || !email} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  buttonText || "Subscribe"
                )}
              </Button>
            </form>

            <p className={`text-xs ${getTextClasses({theme, type: "muted", size: "xs"})} mt-3`}>We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
