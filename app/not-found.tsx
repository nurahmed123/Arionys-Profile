"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Home, Search, ArrowLeft, MessageCircle, Compass } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <Card className="border-0 shadow-2xl glass backdrop-blur-xl animate-fade-in">
          <CardHeader className="text-center pb-8">
            <div className="relative mx-auto mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl flex items-center justify-center mx-auto animate-bounce-subtle">
                <div className="text-6xl font-bold text-primary">404</div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-secondary rounded-full animate-pulse"></div>
            </div>

            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Oops! You're Lost in Space
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground max-w-md mx-auto">
              The page you're looking for doesn't exist in our digital universe. But don't worry, we'll help you find
              your way back!
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center">Search for what you need</h3>
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search profiles, features, or help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 h-12 text-base focus-ring"
                />
                <Button type="submit" size="lg" className="px-6 animate-scale-in">
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/" className="group">
                <Button className="w-full h-14 text-base font-medium group-hover:scale-105 transition-transform">
                  <Home className="h-5 w-5 mr-3" />
                  Go Home
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full h-14 text-base font-medium hover:scale-105 transition-transform bg-transparent"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5 mr-3" />
                Go Back
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/explore" className="group">
                <Button
                  variant="secondary"
                  className="w-full h-12 text-base group-hover:scale-105 transition-transform"
                >
                  <Compass className="h-5 w-5 mr-3" />
                  Explore Profiles
                </Button>
              </Link>

              <Link href="/help" className="group">
                <Button
                  variant="outline"
                  className="w-full h-12 text-base group-hover:scale-105 transition-transform bg-transparent"
                >
                  <MessageCircle className="h-5 w-5 mr-3" />
                  Get Help
                </Button>
              </Link>
            </div>

            <div className="text-center space-y-3 pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground">Common reasons for this error:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                  Broken link
                </div>
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  Moved page
                </div>
                <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Typo in URL
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
