"use client"

import type React from "react"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Lock, Mail, User, Eye, EyeOff, Upload, Save, Palette, Globe, Shield, AtSign } from "lucide-react"
import { ThemeSelector } from "@/components/profile/theme-selector"
import { createClient } from "@/lib/supabase/client"

interface ProfileEditFormProps {
  profile: any
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const [authData, setAuthData] = useState({ email: "", newPassword: "", confirmPassword: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [authSuccess, setAuthSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(profile?.theme || "default")
  const [profileData, setProfileData] = useState({
    display_name: profile?.display_name || "",
    bio: profile?.bio || "",
    avatar_url: profile?.avatar_url || "",
    is_public: profile?.is_public ?? true,
    username: profile?.username || "",
    show_username: profile?.show_username ?? true,
  })
  const router = useRouter()
  const supabase = createClient()

  const handleEmailUpdate = () => {
    // Email update logic here
  }

  const handlePasswordUpdate = () => {
    // Password update logic here
  }

  const handleChange = (name: string, value: string) => {
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingImage(true)
      setError("")

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Upload failed")
      }

      const { url } = await response.json()

      const { error: updateError } = await supabase!.from("profiles").update({ avatar_url: url }).eq("id", profile.id)

      if (updateError) throw updateError

      setProfileData((prev) => ({ ...prev, avatar_url: url }))
      setSuccess("Profile picture updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error: any) {
      console.error("Error uploading image:", error)
      setError(error.message || "Failed to upload image. Please try again.")
      setTimeout(() => setError(""), 5000)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleThemeChange = async (themeId: string) => {
    try {
      setSelectedTheme(themeId)

      const { error } = await supabase!.from("profiles").update({ theme: themeId }).eq("id", profile.id)

      if (error) throw error

      setSuccess("Theme updated successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (error) {
      console.error("Error updating theme:", error)
      setError("Failed to update theme. Please try again.")
      setTimeout(() => setError(""), 3000)
    }
  }

  const validateUsername = (username: string) => {
    if (username.length < 3 || username.length > 50) {
      return "Username must be between 3 and 50 characters"
    }
    if (!/^[a-z0-9_]+$/.test(username)) {
      return "Username can only contain lowercase letters, numbers, and underscores"
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)
      setError("")

      if (profileData.username) {
        const usernameError = validateUsername(profileData.username)
        if (usernameError) {
          setError(usernameError)
          return
        }
      }

      const { error } = await supabase!
        .from("profiles")
        .update({
          display_name: profileData.display_name,
          bio: profileData.bio,
          is_public: profileData.is_public,
          username: profileData.username.toLowerCase(),
          show_username: profileData.show_username,
        })
        .eq("id", profile.id)

      if (error) {
        if (error.code === "23505" && error.message.includes("username")) {
          throw new Error("Username is already taken. Please choose a different one.")
        }
        throw error
      }

      setSuccess("Profile updated successfully!")
      setTimeout(() => {
        setSuccess("")
        router.push("/dashboard")
      }, 2000)
    } catch (error: any) {
      console.error("Error updating profile:", error)
      setError(error.message || "Failed to update profile. Please try again.")
      setTimeout(() => setError(""), 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const initials = profileData.display_name
    ? profileData.display_name
        .split(" ")
        .map((name) => name[0])
        .join("")
    : ""

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Account Settings */}
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Lock className="h-5 w-5 text-accent" />
            </div>
            <span>Account Settings</span>
          </CardTitle>
          <CardDescription>Update your email address and password securely</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-accent" />
              <Label htmlFor="email" className="font-medium">
                Update Email Address
              </Label>
            </div>
            <div className="flex space-x-3">
              <Input
                id="email"
                type="email"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                placeholder="Enter new email address"
                className="flex-1 focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <Button
                type="button"
                onClick={handleEmailUpdate}
                disabled={isLoading || !authData.email.trim()}
                variant="outline"
                className="hover:scale-105 transition-transform bg-transparent"
              >
                {isLoading ? "Updating..." : "Update Email"}
              </Button>
            </div>
          </div>

          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-accent" />
              <Label className="font-medium">Update Password</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={authData.newPassword}
                    onChange={(e) => setAuthData({ ...authData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="focus:ring-2 focus:ring-accent/20 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:scale-110 transition-transform"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={authData.confirmPassword}
                  onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={handlePasswordUpdate}
              disabled={isLoading || !authData.newPassword || !authData.confirmPassword}
              variant="outline"
              className="w-full md:w-auto hover:scale-105 transition-transform bg-transparent"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <User className="h-5 w-5 text-accent" />
              </div>
              <span>Profile Picture</span>
            </CardTitle>
            <CardDescription>Upload a profile picture to personalize your profile</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-8">
            <div className="relative group">
              <Avatar className="h-28 w-28 ring-4 ring-accent/20 group-hover:ring-accent/40 transition-all duration-300">
                <AvatarImage
                  src={profileData.avatar_url || "/placeholder.svg"}
                  alt={profileData.display_name || "User"}
                />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="avatar-upload" />
              <Button
                type="button"
                variant="outline"
                disabled={isUploadingImage}
                onClick={() => document.getElementById("avatar-upload")?.click()}
                className="hover:scale-105 transition-transform"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploadingImage ? "Uploading..." : "Upload Photo"}
              </Button>
              <p className="text-xs text-muted-foreground">
                {isUploadingImage ? "Uploading your photo..." : "JPG, PNG or GIF (max 10MB)"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <User className="h-5 w-5 text-accent" />
              </div>
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your display name, username, and bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={profileData.display_name}
                onChange={(e) => setProfileData((prev) => ({ ...prev, display_name: e.target.value }))}
                placeholder="Enter your display name"
                className="focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, username: e.target.value.toLowerCase() }))}
                  placeholder="your-username"
                  className="pl-10 focus:ring-2 focus:ring-accent/20 transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your profile will be available at: /{profileData.username || "your-username"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself"
                className="focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Shield className="h-5 w-5 text-accent" />
              </div>
              <span>Privacy Settings</span>
            </CardTitle>
            <CardDescription>Control who can see your profile and what information is displayed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-accent" />
                  <Label htmlFor="is_public" className="font-medium">
                    Public Profile
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profileData.is_public
                    ? "Your profile is visible to everyone with the link"
                    : "Your profile is private and only visible to you"}
                </p>
              </div>
              <Switch
                id="is_public"
                checked={profileData.is_public}
                onCheckedChange={(checked) => setProfileData((prev) => ({ ...prev, is_public: checked }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <AtSign className="h-4 w-4 text-accent" />
                  <Label htmlFor="show_username" className="font-medium">
                    Show Username
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {profileData.show_username
                    ? "Your username will be displayed on your public profile"
                    : "Your username will be hidden from your public profile"}
                </p>
              </div>
              <Switch
                id="show_username"
                checked={profileData.show_username}
                onCheckedChange={(checked) => setProfileData((prev) => ({ ...prev, show_username: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Palette className="h-5 w-5 text-accent" />
              </div>
              <span>Profile Theme</span>
            </CardTitle>
            <CardDescription>Choose a theme that matches your style and personality</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelector selectedTheme={selectedTheme} onThemeChange={handleThemeChange} />
          </CardContent>
        </Card>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 p-4 rounded-lg animate-bounce-subtle">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-black bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 p-4 rounded-lg animate-bounce-subtle">
            Profile updated successfully! Redirecting to dashboard...
          </div>
        )}

        {authSuccess && (
          <div className="text-sm text-black bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 p-4 rounded-lg animate-bounce-subtle">
            {authSuccess}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            className="hover:scale-105 transition-transform"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="hover:scale-105 transition-transform">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
