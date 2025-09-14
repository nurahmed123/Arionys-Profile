import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { getTheme, getThemeClasses } from "@/lib/themes"
import { getTextClasses } from "@/lib/text-formatting"
import ReactMarkdown from "react-markdown"

interface TextBlockProps {
  block: any
  theme?: string
}

export function TextBlock({ block, theme = "default" }: TextBlockProps) {
  const { title, content, descriptionType = "plain" } = block.content || {}
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!content) return null

  return (
    <Card className={classes.card}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 ${classes.muted.replace("text-", "bg-").replace("-600", "-100")} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <FileText className={`h-6 w-6 ${classes.muted}`} />
          </div>
          <div className="flex-1">
            {(block.title || title) && (
              <h3 className={`${getTextClasses({theme, type: "heading", size: "lg"})} mb-3 text-balance`}>{block.title || title}</h3>
            )}
            <div className="prose prose-sm max-w-none">
              {descriptionType === "markdown" ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className={`${getTextClasses({theme, type: "body"})} leading-relaxed text-pretty mb-2 last:mb-0`}>{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className={`${getTextClasses({theme, type: "body"})} list-disc list-inside space-y-1 mb-2`}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className={`${getTextClasses({theme, type: "body"})} list-decimal list-inside space-y-1 mb-2`}>{children}</ol>
                    ),
                    strong: ({ children }) => (
                      <strong className={`${getTextClasses({theme, weight: "semibold"})}`}>{children}</strong>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {children}
                      </a>
                    ),
                  }}
                >
                    {content}
                  </ReactMarkdown>
              ) : (
                <p className={`${getTextClasses({theme, type: "body"})} whitespace-pre-wrap leading-relaxed text-pretty`}>{content}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
