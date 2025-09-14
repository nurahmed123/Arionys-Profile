import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"
import ReactMarkdown from "react-markdown"

interface TestimonialBlockProps {
  block: any
  theme?: string
}

export function TestimonialBlock({ block, theme = "default" }: TestimonialBlockProps) {
  const { quote, descriptionType = "plain", author, position, avatar } = block.content || {}
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!quote || !author) return null

  const initials = author
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Card className={`${classes.card}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center flex-shrink-0`}
          >
            <Star className={`h-6 w-6 text-gray-700`} />
          </div>
          <div className="flex-1">
            {block.title && <h3 className={`${classes.heading} text-lg mb-3 text-balance`}>{block.title}</h3>}

            <div className="relative">
              <Quote className="h-8 w-8 text-gray-300 absolute -top-2 -left-2" />
              <div className="pl-6 prose prose-sm dark:prose-invert max-w-none">
                {descriptionType === "markdown" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className={`${getTextClasses({theme, type: "muted", size: "sm"})} italic leading-relaxed text-pretty mb-2 last:mb-0`}>
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className={`${getTextClasses({theme, type: "muted", size: "sm"})} italic list-disc list-inside space-y-1 mb-2`}>{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className={`${getTextClasses({theme, type: "muted", size: "sm"})} italic list-decimal list-inside space-y-1 mb-2`}>
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
                    {quote}
                  </ReactMarkdown>
                ) : (
                  <blockquote className={`${classes.muted} italic leading-relaxed text-pretty`}>"{quote}"</blockquote>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
              <Avatar className="h-10 w-10">
                <AvatarImage src={avatar || "/placeholder.svg"} alt={author} />
                <AvatarFallback className="bg-gray-100 text-gray-700">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className={`${classes.heading} text-sm`}>{author}</p>
                {position && <p className={`text-xs ${classes.muted}`}>{position}</p>}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
