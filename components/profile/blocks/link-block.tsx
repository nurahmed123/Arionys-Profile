import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Globe } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"

interface LinkBlockProps {
  block: any
  theme?: string
}

export function LinkBlock({ block, theme = "default" }: LinkBlockProps) {
  const { title, url, description } = block.content
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!url) return null

  return (
    <Card className={`${classes.card} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <Globe className={`h-6 w-6 text-gray-700`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3
                  className={`${getTextClasses({theme, type: "heading", size: "base"})} group-hover:text-gray-700 transition-colors text-balance`}
                >
                  {block.title || title || "Link"}
                </h3>
                <ExternalLink
                  className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors flex-shrink-0"
                />
              </div>
              {description && <p className={`${getTextClasses({theme, type: "muted", size: "sm"})} mt-1 text-pretty`}>{description}</p>}
              <p className="text-gray-700 text-xs mt-2 truncate font-mono">{url}</p>
            </div>
          </div>
        </a>
      </CardContent>
    </Card>
  )
}
