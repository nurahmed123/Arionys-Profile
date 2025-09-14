import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Eye, Globe, Lock } from "lucide-react"

interface ProfilePreviewProps {
  profile: any
  blocks: any[]
}

export function ProfilePreview({ profile, blocks }: ProfilePreviewProps) {
  const initials = profile?.display_name
    ? profile.display_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Profile Preview
          <Badge variant={profile?.is_public ? "default" : "secondary"}>
            {profile?.is_public ? (
              <>
                <Globe className="h-3 w-3 mr-1" />
                Public
              </>
            ) : (
              <>
                <Lock className="h-3 w-3 mr-1" />
                Private
              </>
            )}
          </Badge>
        </CardTitle>
        <CardDescription>How your profile appears to visitors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Header */}
        <div className="text-center space-y-3">
          <Avatar className="h-20 w-20 mx-auto">
            <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.display_name || "User"} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{profile?.display_name || "Your Name"}</h3>
            {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
            {profile?.bio && <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>}
          </div>
        </div>

        {/* Content Blocks Preview */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Content Blocks ({blocks?.length || 0})</h4>
          {blocks && blocks.length > 0 ? (
            <div className="space-y-2">
              {blocks.slice(0, 3).map((block) => (
                <div key={block.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded text-xs">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="capitalize">{block.block_type}</span>
                  {block.title && <span className="text-muted-foreground">- {block.title}</span>}
                </div>
              ))}
              {blocks.length > 3 && <p className="text-xs text-muted-foreground">+{blocks.length - 3} more blocks</p>}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No content blocks yet</p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {profile?.username ? (
            <Link href={`/${profile.username}`} target="_blank">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <Eye className="h-4 w-4 mr-2" />
                View Public Profile
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" className="w-full bg-transparent" disabled>
              Set username to view profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
