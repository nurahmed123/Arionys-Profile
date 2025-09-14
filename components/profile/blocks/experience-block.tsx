import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase } from "lucide-react"

interface ExperienceBlockProps {
  block: any
  theme?: string
}

export function ExperienceBlock({ block, theme = "default" }: ExperienceBlockProps) {
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
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
            <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="font-semibold">{block.title || "Experience"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-200 dark:from-emerald-500 dark:to-emerald-700"></div>

          <div className="space-y-12">
            {entries.map((entry: any, index: number) => (
              <div key={entry.id} className="relative flex items-start">
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-emerald-600 dark:bg-emerald-400 rounded-full border-4 border-white dark:border-gray-900 shadow-lg shadow-emerald-500/25 z-10"></div>

                <div className={`w-5/12 ${entry.side === "right" ? "ml-auto" : ""}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {entry.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                          {entry.description}
                        </p>
                        {(entry.fromDate || entry.toDate) && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
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
