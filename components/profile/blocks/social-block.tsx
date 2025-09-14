import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { SOCIAL_PLATFORMS } from "@/components/blocks/block-types"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"

interface SocialBlockProps {
  block: any
  theme?: string
}

export function SocialBlock({ block, theme = "default" }: SocialBlockProps) {
  const { platform, username, url } = block.content
  const platformData = SOCIAL_PLATFORMS[platform as keyof typeof SOCIAL_PLATFORMS]
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!platform || !platformData) return null

  const displayUrl = url || `${platformData.baseUrl}${username?.replace("@", "") || ""}`
  const displayName = username || platformData.name
  const platformName = platformData.name
  const platformIcon = platformData.icon
  const platformColor = platformData.color

  return (
    <Card className={`${classes.card} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between group"
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${platformColor} rounded-full flex items-center justify-center`}>
              <span className="text-white flex items-center justify-center">{platformIcon}</span>
            </div>
            <div>
              <h3 className={`${getTextClasses({theme, type: "heading", size: "base"})} group-hover:${classes.primary} transition-colors`}>
                {block.title || platformName}
              </h3>
              <p className={`${getTextClasses({theme, type: "muted", size: "sm"})}`}>{displayName}</p>
            </div>
          </div>
          <ExternalLink className={`h-5 w-5 ${classes.muted} group-hover:${classes.primary} transition-colors`} />
        </a>
      </CardContent>
    </Card>
  )
}
