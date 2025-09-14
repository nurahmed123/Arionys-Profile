import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface LocationBlockProps {
  block: any
  theme?: string
}

export function LocationBlock({ block, theme = "default" }: LocationBlockProps) {
  const { address, city, country, coordinates } = block.content
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!address && !city && !country) return null

  const fullAddress = [address, city, country].filter(Boolean).join(", ")

  return (
    <Card className={classes.card}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 ${classes.muted.replace("text-", "bg-").replace("-600", "-100")} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <MapPin className={`h-6 w-6 ${classes.muted}`} />
          </div>
          <div className="flex-1">
            {block.title && <h3 className={`${classes.heading} text-lg mb-3 text-balance`}>{block.title}</h3>}
            <p className={`${classes.muted} leading-relaxed text-pretty`}>{fullAddress}</p>
            {coordinates && (
              <p className="text-xs text-muted-foreground mt-2">
                {coordinates.lat}, {coordinates.lng}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
