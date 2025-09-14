import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, ExternalLink } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface AudioBlockProps {
  block: any
  theme?: string
}

export function AudioBlock({ block, theme = "default" }: AudioBlockProps) {
  const { title, url, description } = block.content
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!url) return null

  const isSpotify = url.includes("spotify.com")
  const isSoundCloud = url.includes("soundcloud.com")

  return (
    <Card className={classes.card}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 ${classes.accent.replace("text-", "bg-").replace("-600", "-100")} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Music className={`h-6 w-6 ${classes.accent}`} />
          </div>
          <div className="flex-1">
            <h3 className={`${classes.heading} text-lg mb-2 text-balance`}>{block.title || title || "Audio"}</h3>
            {description && <p className={`${classes.muted} mb-4 text-pretty`}>{description}</p>}

            <div
              className={`${classes.background.replace("bg-", "bg-").includes("gray") ? "bg-gray-50" : "bg-white/50"} rounded-lg p-8 text-center`}
            >
              <Music className={`h-12 w-12 ${classes.muted} mx-auto mb-3`} />
              <p className={`text-sm ${classes.muted} mb-2`}>Audio player coming soon</p>
              <div className="flex items-center justify-center space-x-2">
                {isSpotify && <Badge variant="secondary">Spotify</Badge>}
                {isSoundCloud && <Badge variant="secondary">SoundCloud</Badge>}
                <Badge variant="secondary">Feature in development</Badge>
              </div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-1 text-sm ${classes.primary} hover:opacity-80 mt-3`}
              >
                <span>Listen on external site</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
