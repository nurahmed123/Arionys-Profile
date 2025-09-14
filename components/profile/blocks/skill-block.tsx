"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Code } from "lucide-react"

interface SkillEntry {
  id: string
  name: string
  percentage: number
  position: number
}

interface SkillBlockProps {
  block: any
  theme?: string
}

export function SkillBlock({ block, theme = "default" }: SkillBlockProps) {
  const entries = block.content?.entries || []

  const sortedEntries = [...entries].sort((a, b) => a.position - b.position)

  const getSkillColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-blue-500"
    if (percentage >= 40) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getSkillLevel = (percentage: number) => {
    if (percentage >= 80) return "Expert"
    if (percentage >= 60) return "Advanced"
    if (percentage >= 40) return "Intermediate"
    return "Beginner"
  }

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-semibold">{block.title || "Skills"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedEntries.map((entry: SkillEntry) => (
            <Card
              key={entry.id}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-blue-200 dark:border-blue-800"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {entry.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{entry.percentage}%</span>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${getSkillColor(entry.percentage)}`}>
                        {getSkillLevel(entry.percentage)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={entry.percentage} className="h-3 bg-gray-200 dark:bg-gray-700" />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
