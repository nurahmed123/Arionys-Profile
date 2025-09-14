import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface CalendarBlockProps {
  block: any
  theme?: string
}

export function CalendarBlock({ block, theme = "default" }: CalendarBlockProps) {
  const { eventName, startDate, endDate, description } = block.content
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!eventName && !startDate) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Card className={classes.card}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 ${classes.muted.replace("text-", "bg-").replace("-600", "-100")} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Calendar className={`h-6 w-6 ${classes.muted}`} />
          </div>
          <div className="flex-1">
            {(block.title || eventName) && (
              <h3 className={`${classes.heading} text-lg mb-3 text-balance`}>{block.title || eventName}</h3>
            )}
            {startDate && (
              <div className="space-y-1">
                <p className={`${classes.muted} font-medium`}>
                  {formatDate(startDate)}
                  {endDate && endDate !== startDate && ` - ${formatDate(endDate)}`}
                </p>
                {description && <p className={`${classes.muted} text-sm leading-relaxed text-pretty`}>{description}</p>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
