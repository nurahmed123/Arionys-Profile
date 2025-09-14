import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"

interface ServicesBlockProps {
  block: any
  theme?: string
}

export function ServicesBlock({ block, theme = "default" }: ServicesBlockProps) {
  const { entries = [] } = block.content || {}
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!entries || entries.length === 0) return null

  return (
    <div className={classes.spacing}>
      <h2 className={`${getTextClasses({ theme, type: "heading", size: "xl" })} mb-6`}>
        {block.title || "Services"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((service: any, index: number) => (
          <Card key={index} className={`${classes.card} hover:shadow-lg transition-all duration-300 group`}>
            <CardContent className="p-6">
              {service.photo && (
                <div className="mb-4">
                  <img
                    src={service.photo}
                    alt={service.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className={`${getTextClasses({ theme, type: "heading", size: "lg" })} group-hover:${classes.primary} transition-colors`}>
                    {service.title}
                  </h3>
                  {service.price && (
                    <span className={`${getTextClasses({ theme, type: "body", size: "lg" })} font-bold ${classes.accent}`}>
                      {service.price}
                    </span>
                  )}
                </div>

                {service.duration && (
                  <p className={`${getTextClasses({ theme, type: "muted", size: "sm" })}`}>
                    Duration: {service.duration}
                  </p>
                )}

                {service.description && (
                  <p className={`${getTextClasses({ theme, type: "body", size: "sm" })}`}>
                    {service.description}
                  </p>
                )}

                {service.features && service.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature: string, featureIndex: number) => (
                      <Badge
                        key={featureIndex}
                        variant="secondary"
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
