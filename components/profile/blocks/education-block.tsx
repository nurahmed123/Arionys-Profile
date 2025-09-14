import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

interface EducationBlockProps {
  block: any
  theme?: string
}

export function EducationBlock({ block, theme = "default" }: EducationBlockProps) {
  const entries = block.content?.entries || []

  if (entries.length === 0) {
    return null
  }

  const formatDateRange = (fromDate?: string, toDate?: string) => {
    if (!fromDate) return ""
    const from = new Date(fromDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    if (!toDate) return `${from} - Present`
    const to = new Date(toDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    return `${from} - ${to}`
  }

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-semibold">{block.title || "Education"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-blue-400 to-blue-200 dark:from-blue-500 dark:to-blue-700"></div>

          <div className="space-y-12">
            {entries.map((entry: any, index: number) => (
              <div key={entry.id} className="relative flex items-start">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full border-4 border-white dark:border-gray-900 shadow-lg shadow-blue-500/25 z-10"></div>

                <div className={`w-5/12 ${entry.side === "right" ? "ml-auto" : ""}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {entry.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {entry.description}
                        </p>
                        {(entry.fromDate || entry.toDate) && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                              {formatDateRange(entry.fromDate, entry.toDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
