import { Card, CardContent } from "@/components/ui/card"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface ImageBlockProps {
  block: any
  theme?: string
}

export function ImageBlock({ block, theme = "default" }: ImageBlockProps) {
  const { imageUrl, size } = block.content
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!imageUrl) return null

  const getSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "max-w-xs"
      case "medium":
        return "max-w-md"
      case "large":
        return "max-w-lg"
      case "full":
        return "w-full"
      default:
        return "max-w-md"
    }
  }

  return (
    <Card className={classes.card}>
      <CardContent className="p-6">
        <div className={`${getSizeClass(size)} mx-auto`}>
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={block.title || "Image"}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      </CardContent>
    </Card>
  )
}
