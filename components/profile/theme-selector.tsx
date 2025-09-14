"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, Eye, Palette } from "lucide-react"
import { THEMES, getTheme } from "@/lib/themes"
import { ThemePreview } from "./theme-preview"

interface ThemeSelectorProps {
  selectedTheme: string
  onThemeChange: (theme: string) => void
}

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)
  // Default to classic theme for black and white styling
  const currentTheme = getTheme(selectedTheme || "classic")

  const handleThemeClick = (themeId: string) => {
    console.log("[v0] Theme clicked:", themeId)
    onThemeChange(themeId)
  }

  console.log("[v0] ThemeSelector rendered with selectedTheme:", selectedTheme)

  return (
    <div className="space-y-4">
      {/* Current Theme Display */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 ${currentTheme.preview} rounded-full border`}></div>
          <div>
            <p className="font-medium">{currentTheme.name}</p>
            <p className="text-sm text-muted-foreground">{currentTheme.description}</p>
          </div>
        </div>
        <Badge variant="secondary">Current</Badge>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(THEMES).map((theme) => (
          <Card
            key={theme.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTheme === theme.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => handleThemeClick(theme.id)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-8 ${theme.preview} rounded border`}></div>
                  {selectedTheme === theme.id && <Check className="h-5 w-5 text-blue-600" />}
                </div>
                <div>
                  <h3 className="font-medium">{theme.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{theme.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <div className={`w-3 h-3 rounded-full ${theme.colors.primary.replace("text-", "bg-")}`}></div>
                    <div className={`w-3 h-3 rounded-full ${theme.colors.secondary.replace("text-", "bg-")}`}></div>
                    <div className={`w-3 h-3 rounded-full ${theme.colors.accent.replace("text-", "bg-")}`}></div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("[v0] Theme preview clicked:", theme.id)
                          setPreviewTheme(theme.id)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <Palette className="h-5 w-5" />
                          <span>{theme.name} Theme Preview</span>
                        </DialogTitle>
                      </DialogHeader>
                      <ThemePreview theme={theme} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
