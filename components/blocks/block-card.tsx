import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  Clock,
  ImageIcon,
  GraduationCap,
  Briefcase,
} from "lucide-react"
import { SOCIAL_PLATFORMS } from "./block-types"

interface BlockCardProps {
  block: any
}

export function BlockCard({ block }: BlockCardProps) {
  const renderBlockContent = () => {
    switch (block.block_type) {
      case "about":
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {block.content.content || "No content added yet"}
            </p>
          </div>
        )

      case "education":
        const educationEntries = block.content.entries || []
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">Education Timeline</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {educationEntries.length > 0 ? (
                <div className="space-y-1">
                  {educationEntries.slice(0, 2).map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="truncate">{entry.title || "Untitled"}</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.side}
                      </Badge>
                    </div>
                  ))}
                  {educationEntries.length > 2 && (
                    <p className="text-center">+{educationEntries.length - 2} more entries</p>
                  )}
                </div>
              ) : (
                <p>No education entries added yet</p>
              )}
            </div>
          </div>
        )

      case "experience":
        const experienceEntries = block.content.entries || []
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">Experience Timeline</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {experienceEntries.length > 0 ? (
                <div className="space-y-1">
                  {experienceEntries.slice(0, 2).map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="truncate">{entry.title || "Untitled"}</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.side}
                      </Badge>
                    </div>
                  ))}
                  {experienceEntries.length > 2 && (
                    <p className="text-center">+{experienceEntries.length - 2} more entries</p>
                  )}
                </div>
              ) : (
                <p>No experience entries added yet</p>
              )}
            </div>
          </div>
        )

      case "social":
        const platform = SOCIAL_PLATFORMS[block.content.platform as keyof typeof SOCIAL_PLATFORMS]
        return (
          <div className="flex items-center space-x-3">
            {platform && (
              <>
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <span className="text-white">{platform.icon}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{platform.name}</p>
                  <p className="text-xs text-muted-foreground">{block.content.username || "No username set"}</p>
                </div>
              </>
            )}
          </div>
        )

      case "contact":
        const contactIcons = {
          email: Mail,
          phone: Phone,
          address: MapPin,
          website: ExternalLink,
        }
        const ContactIcon = contactIcons[block.content.type as keyof typeof contactIcons] || Mail
        return (
          <div className="flex items-center space-x-3">
            <ContactIcon className="h-5 w-5 text-black" />
            <div>
              <p className="font-medium text-sm">{block.content.label || "Contact"}</p>
              <p className="text-xs text-muted-foreground">{block.content.value || "No value set"}</p>
            </div>
          </div>
        )

      case "link":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ExternalLink className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">{block.content.title || "Untitled Link"}</p>
            </div>
            {block.content.description && <p className="text-xs text-muted-foreground">{block.content.description}</p>}
          </div>
        )

      case "gallery":
        return (
          <div className="space-y-2">
            <p className="font-medium text-sm">{block.content.title || "Gallery"}</p>
            <p className="text-xs text-muted-foreground">{block.content.description || "No description added"}</p>
            <Badge variant="secondary">Coming soon - Image upload</Badge>
          </div>
        )

      case "video":
        return (
          <div className="space-y-2">
            <p className="font-medium text-sm">{block.content.title || "Video"}</p>
            {block.content.url && (
              <p className="text-xs text-muted-foreground font-mono truncate">{block.content.url}</p>
            )}
            {block.content.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{block.content.description}</p>
            )}
          </div>
        )

      case "audio":
        return (
          <div className="space-y-2">
            <p className="font-medium text-sm">{block.content.title || "Audio"}</p>
            {block.content.url && (
              <p className="text-xs text-muted-foreground font-mono truncate">{block.content.url}</p>
            )}
            {block.content.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{block.content.description}</p>
            )}
          </div>
        )

      case "text":
        return (
          <div className="space-y-2">
            <p className="font-medium text-sm">{block.content.title || "Text Block"}</p>
            <p className="text-xs text-muted-foreground line-clamp-3">{block.content.content || "No content added"}</p>
          </div>
        )

      case "testimonial":
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">Testimonial</p>
            </div>
            {block.content.quote && (
              <p className="text-xs text-muted-foreground italic line-clamp-2">"{block.content.quote}"</p>
            )}
            {block.content.author && (
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={block.content.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {block.content.author
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-medium">{block.content.author}</p>
                  {block.content.position && <p className="text-xs text-muted-foreground">{block.content.position}</p>}
                </div>
              </div>
            )}
          </div>
        )

      case "event":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">{block.content.title || "Event"}</p>
            </div>
            {block.content.date && (
              <p className="text-xs text-muted-foreground">
                {new Date(block.content.date).toLocaleDateString()}
                {block.content.time && ` at ${block.content.time}`}
              </p>
            )}
            {block.content.location && (
              <p className="text-xs text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {block.content.location}
              </p>
            )}
          </div>
        )

      case "subscription":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">{block.content.title || "Email Subscription"}</p>
            </div>
            {block.content.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{block.content.description}</p>
            )}
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{block.content.collectName === "yes" ? "With name" : "Email only"}</Badge>
              <Badge variant="outline">{block.content.buttonText || "Subscribe"}</Badge>
            </div>
          </div>
        )

      case "timezone":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">Timezone Clock</p>
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Timezone: {block.content.timezone || "UTC"}</p>
              <p>Format: {block.content.format === "24" ? "24-hour" : "12-hour"}</p>
              {block.content.customLabel && <p>Label: {block.content.customLabel}</p>}
            </div>
            <Badge variant="secondary">Live Clock</Badge>
          </div>
        )

      case "location":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">Location</p>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              {block.content.address && <p>{block.content.address}</p>}
              {block.content.city && <p>{block.content.city}</p>}
              {block.content.country && <p>{block.content.country}</p>}
              {!block.content.address && !block.content.city && !block.content.country && <p>No location set</p>}
            </div>
          </div>
        )

      case "calendar":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-black" />
              <p className="font-medium text-sm">{block.content.title || "Calendar Event"}</p>
            </div>
            <div className="text-xs text-muted-foreground">
              {block.content.date && (
                <p>
                  {new Date(block.content.date).toLocaleDateString()}
                  {block.content.endDate && ` - ${new Date(block.content.endDate).toLocaleDateString()}`}
                </p>
              )}
              {block.content.description && <p className="line-clamp-2">{block.content.description}</p>}
              {!block.content.title && !block.content.date && <p>No event set</p>}
            </div>
          </div>
        )

      case "image":
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-blue-600" />
              <p className="font-medium text-sm">Image</p>
            </div>
            {block.content.imageUrl ? (
              <div className="flex justify-center">
                <img
                  src={block.content.imageUrl || "/placeholder.svg"}
                  alt="Block image"
                  className="w-16 h-16 object-cover rounded border"
                />
              </div>
            ) : (
              <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded flex items-center justify-center mx-auto">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="text-xs text-muted-foreground text-center">
              <Badge variant="secondary">{block.content.size || "medium"} size</Badge>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Unknown block type: {block.block_type}</p>
          </div>
        )
    }
  }

  return <div className="min-h-[60px]">{renderBlockContent()}</div>
}
