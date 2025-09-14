import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"
import ReactMarkdown from "react-markdown"

interface EventBlockProps {
  block: any
  theme?: string
}

export function EventBlock({ block, theme = "default" }: EventBlockProps) {
  const { title, date, time, location, description, descriptionType = "plain", link } = block.content || {}
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!title) return null

  const eventDate = date ? new Date(date) : null
  const isUpcoming = eventDate ? eventDate > new Date() : false

  return (
    <Card className={`${classes.card}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 rounded-sm flex items-center justify-center flex-shrink-0 bg-gray-100`}
          >
            <Calendar className={`h-6 w-6 text-gray-700`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <h3 className={`${getTextClasses({theme, type: "heading", size: "lg"})} text-balance`}>{block.title || title}</h3>
              {isUpcoming && (
                <span
                  className={`bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-sm font-medium`}
                >
                  Upcoming
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4">
              {eventDate && (
                <div className={`flex items-center space-x-2 text-sm ${getTextClasses({theme, type: "muted", size: "sm"})}`}>
                  <Calendar className="h-4 w-4" />
                  <span>
                    {eventDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}

              {time && (
                <div className={`flex items-center space-x-2 text-sm ${getTextClasses({theme, type: "muted", size: "sm"})}`}>
                  <Clock className="h-4 w-4" />
                  <span>{time}</span>
                </div>
              )}

              {location && (
                <div className={`flex items-center space-x-2 text-sm ${getTextClasses({theme, type: "muted", size: "sm"})}`}>
                  <MapPin className="h-4 w-4" />
                  <span>{location}</span>
                </div>
              )}
            </div>

            {description && (
              <div className="mb-4 prose prose-sm dark:prose-invert max-w-none">
                {descriptionType === "markdown" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className={`${getTextClasses({theme, type: "muted", size: "sm"})} leading-relaxed text-pretty mb-2 last:mb-0`}>
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className={`${getTextClasses({theme, type: "muted", size: "sm"})} list-disc list-inside space-y-1 mb-2`}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className={`${getTextClasses({theme, type: "muted", size: "sm"})} list-decimal list-inside space-y-1 mb-2`}>
                          {children}
                        </ol>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-700">{children}</strong>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-700 font-medium hover:underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {description}
                  </ReactMarkdown>
                ) : (
                  <p className={`${getTextClasses({theme, type: "muted", size: "sm"})} leading-relaxed text-pretty`}>{description}</p>
                )}
              </div>
            )}

            {link && (
              <Button asChild size="sm" variant="outline" className="border-gray-300 hover:bg-gray-100 hover:text-gray-900">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {isUpcoming ? "Register Now" : "View Event"}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
