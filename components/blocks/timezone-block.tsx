"use client"

import { useState, useEffect } from "react"
import { Clock, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface TimezoneBlockProps {
  block: {
    content: {
      timezone?: string
      format?: string
      showDate?: boolean
      showSeconds?: boolean
      customLabel?: string
    }
  }
}

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "Mumbai (IST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Dhaka", label: "Dhaka (BST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST/NZDT)" },
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
]

export function TimezoneBlock({ block }: TimezoneBlockProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const { timezone = "UTC", format = "12", showDate = true, showSeconds = false, customLabel } = block.content

  useEffect(() => {
    const timer = setInterval(
      () => {
        setCurrentTime(new Date())
      },
      showSeconds ? 1000 : 60000,
    )

    return () => clearInterval(timer)
  }, [showSeconds])

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: format === "12",
    }

    if (showSeconds) {
      options.second = "2-digit"
    }

    return date.toLocaleTimeString("en-US", options)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getTimezoneLabel = () => {
    const option = TIMEZONE_OPTIONS.find((opt) => opt.value === timezone)
    return customLabel || option?.label || timezone
  }

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-500 rounded-full">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{getTimezoneLabel()}</span>
            </div>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-4xl md:text-5xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
            {formatTime(currentTime)}
          </div>

          {showDate && <div className="text-lg text-muted-foreground font-medium">{formatDate(currentTime)}</div>}
        </div>

        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { TIMEZONE_OPTIONS }
