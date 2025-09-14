"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Settings, User, Home, ImageIcon, Mail, Menu, X, Plus, BarChart3 } from "lucide-react"
import { useState } from "react"

interface DashboardHeaderProps {
  user: any
  profile: any
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter()
  const pathname = usePathname() // Added pathname hook for active link detection
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    router.push("/")
  }

  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.[0]?.toUpperCase() || "U"

  const isActiveLink = (href: string) => {
    return pathname === href
  }

  const getLinkClasses = (href: string) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-sm transition-all duration-200 hover:scale-105"
    const activeClasses = "bg-gray-100 text-black border border-gray-200"
    const inactiveClasses = "hover:bg-gray-50 hover:text-black"

    return `${baseClasses} ${isActiveLink(href) ? activeClasses : inactiveClasses}`
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 glass animate-slide-up">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-sm flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 overflow-hidden">
              <img 
                src="/arionys-logo.png" 
                alt="Arionys Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-xl text-black">
              Arionys Profile
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
              Dashboard
            </Link>
            <Link href="/profile/edit" className={getLinkClasses("/profile/edit")}>
              Edit Profile
            </Link>
            <Link href="/profile/blocks" className={getLinkClasses("/profile/blocks")}>
              Content Blocks
            </Link>
            <Link href="/dashboard/subscribers" className={getLinkClasses("/dashboard/subscribers")}>
              Subscribers
            </Link>
            <Link href="/dashboard/analytics" className={getLinkClasses("/dashboard/analytics")}>
              Analytics
            </Link>
            <Link href="/dashboard/media" className={getLinkClasses("/dashboard/media")}>
              Media Library
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/" target="_blank">
            <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform">
              <Home className="h-4 w-4 mr-2" />
              View Site
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:scale-105 transition-transform"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-105 transition-transform">
                <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-gray-300 transition-all">
                  <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.display_name || "User"} />
                  <AvatarFallback className="bg-gray-900 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 animate-scale-in" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{profile?.display_name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/edit">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/blocks">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Content Blocks</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscribers">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Subscribers</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/media">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  <span>Media Library</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t glass animate-slide-up">
          <nav className="container mx-auto px-4 py-4 space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 py-2 text-sm font-medium transition-colors ${
                isActiveLink("/dashboard") ? "text-black font-semibold" : "hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/profile/edit"
              className={`flex items-center space-x-2 py-2 text-sm font-medium transition-colors ${
                isActiveLink("/profile/edit") ? "text-black font-semibold" : "hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/profile/blocks"
              className={`flex items-center space-x-2 py-2 text-sm font-medium transition-colors ${
                isActiveLink("/profile/blocks") ? "text-black font-semibold" : "hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Plus className="h-4 w-4" />
              <span>Content Blocks</span>
            </Link>
            <Link
              href="/dashboard/subscribers"
              className={`flex items-center space-x-2 py-2 text-sm font-medium transition-colors ${
                isActiveLink("/dashboard/subscribers") ? "text-black font-semibold" : "hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Mail className="h-4 w-4" />
              <span>Subscribers</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className={`flex items-center space-x-2 py-2 text-sm font-medium transition-colors ${
                isActiveLink("/dashboard/analytics") ? "text-black font-semibold" : "hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </Link>
            <Link
              href="/dashboard/media"
              className={`flex items-center space-x-2 py-2 text-sm font-medium transition-colors ${
                isActiveLink("/dashboard/media") ? "text-black font-semibold" : "hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ImageIcon className="h-4 w-4" />
              <span>Media Library</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
