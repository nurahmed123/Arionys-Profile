"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, FileText, ImageIcon, Download, Heart, Eye } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ProjectFile {
  id: string
  name: string
  url: string
  type: "pdf" | "image"
  size: number
}

interface ProjectEntry {
  id: string
  title: string
  description: string
  descriptionType: "markdown" | "plain"
  position: number
  fromDate?: string
  toDate?: string
  link?: string
  files: ProjectFile[]
  loves?: number
  isLoved?: boolean
}

interface ProjectBlockProps {
  content: {
    "project-entries": ProjectEntry[]
  }
  isPublic?: boolean
  currentUserId?: string
}

export function ProjectBlock({ content, isPublic = false, currentUserId }: ProjectBlockProps) {
  const entries = content["project-entries"] || []
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | null>(null)
  const [projectLoves, setProjectLoves] = useState<Record<string, { count: number; isLoved: boolean }>>({})

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No projects to display yet.</p>
      </div>
    )
  }

  const formatDateRange = (fromDate?: string, toDate?: string) => {
    if (!fromDate) return ""
    const from = new Date(fromDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    if (!toDate) return `${from} - Present`
    const to = new Date(toDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    return `${from} - ${to}`
  }

  const handleLoveProject = async (projectId: string, entry: ProjectEntry) => {
    if (!isPublic || !currentUserId) return

    const currentState = projectLoves[projectId] || { count: entry.loves || 0, isLoved: entry.isLoved || false }
    const newIsLoved = !currentState.isLoved
    const newCount = newIsLoved ? currentState.count + 1 : currentState.count - 1

    setProjectLoves((prev) => ({
      ...prev,
      [projectId]: {
        count: Math.max(0, newCount),
        isLoved: newIsLoved,
      },
    }))

    // TODO: Implement API call to save love state to database
    // await fetch('/api/projects/love', {
    //   method: 'POST',
    //   body: JSON.stringify({ projectId, userId: currentUserId, isLoved: newIsLoved })
    // })
  }

  const isDescriptionLong = (description: string) => {
    return description.length > 150 || description.split("\n").length > 3
  }

  const truncateDescription = (description: string, maxLength = 150) => {
    if (description.length <= maxLength) return description
    return description.substring(0, maxLength) + "..."
  }

  const sortedEntries = [...entries].sort((a, b) => a.position - b.position)

  return (
    <>
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Projects</h2>
          <div className="w-24 h-1 bg-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="space-y-6">
          {sortedEntries.map((entry) => {
            const loveState = projectLoves[entry.id] || { count: entry.loves || 0, isLoved: entry.isLoved || false }
            const hasLongDescription = isDescriptionLong(entry.description)

            return (
              <Card
                key={entry.id}
                className={`group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-purple-200 dark:border-purple-800 ${
                  hasLongDescription ? "cursor-pointer" : ""
                }`}
                onClick={() => hasLongDescription && setSelectedProject(entry)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {entry.files.some((f) => f.type === "image") && (
                      <div className="flex-shrink-0 w-32 h-24">
                        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={entry.files.find((f) => f.type === "image")?.url || "/placeholder.svg"}
                            alt={entry.files.find((f) => f.type === "image")?.name || "Project image"}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                          {entry.files.filter((f) => f.type === "image").length > 1 && (
                            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              +{entry.files.filter((f) => f.type === "image").length - 1}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="mb-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {entry.title}
                        </h3>
                      </div>

                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {entry.descriptionType === "markdown" ? (
                          <div className="prose prose-sm dark:prose-invert max-w-none prose-purple">
                            <ReactMarkdown
                              components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-1 mb-2">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside space-y-1 mb-2">{children}</ol>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-purple-600 dark:text-purple-400">
                                  {children}
                                </strong>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 dark:text-purple-400 hover:underline"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {children}
                                </a>
                              ),
                            }}
                            >
                              {hasLongDescription ? truncateDescription(entry.description) : entry.description}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">
                            {hasLongDescription ? truncateDescription(entry.description) : entry.description}
                          </p>
                        )}

                        {hasLongDescription && (
                          <div className="flex items-center mt-2 text-purple-600 dark:text-purple-400 text-sm font-medium">
                            <Eye className="h-3 w-3 mr-1" />
                            Click to read more
                          </div>
                        )}
                      </div>

                      {entry.files.some((f) => f.type === "pdf") && (
                        <div className="space-y-2 mb-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Attachments</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.files
                              .filter((f) => f.type === "pdf")
                              .map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                                >
                                  <FileText className="h-4 w-4 text-red-500" />
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                    {file.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-800"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      const link = document.createElement("a")
                                      link.href = file.url
                                      link.download = file.name
                                      link.click()
                                    }}
                                  >
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-shrink-0 flex flex-col items-end space-y-3">
                      {entry.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(entry.link, "_blank")
                          }}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}

                      {isPublic && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`flex items-center space-x-1 ${
                            loveState.isLoved ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLoveProject(entry.id, entry)
                          }}
                        >
                          <Heart className={`h-4 w-4 ${loveState.isLoved ? "fill-current" : ""}`} />
                          <span className="text-sm">{loveState.count}</span>
                        </Button>
                      )}

                      {(entry.fromDate || entry.toDate) && (
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-medium"
                        >
                          {formatDateRange(entry.fromDate, entry.toDate)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {selectedProject.title}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {selectedProject.files.some((f) => f.type === "image") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedProject.files
                      .filter((f) => f.type === "image")
                      .map((file) => (
                        <div
                          key={file.id}
                          className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
                        >
                          <img
                            src={file.url || "/placeholder.svg"}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                )}

                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedProject.descriptionType === "markdown" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-purple">
                      <ReactMarkdown
                        components={{
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4">{children}</ol>,
                        strong: ({ children }) => (
                          <strong className="font-semibold text-purple-600 dark:text-purple-400">{children}</strong>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {children}
                          </a>
                        ),
                      }}
                      >
                        {selectedProject.description}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{selectedProject.description}</p>
                  )}
                </div>

                {selectedProject.link && (
                  <Button
                    variant="outline"
                    className="border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 bg-transparent"
                    onClick={() => window.open(selectedProject.link, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Project
                  </Button>
                )}

                {selectedProject.files.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Files</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedProject.files.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
                        >
                          <div className="flex items-center space-x-3">
                            {file.type === "pdf" ? (
                              <FileText className="h-5 w-5 text-red-500" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-blue-500" />
                            )}
                            <span className="font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:bg-purple-100 dark:hover:bg-purple-800"
                            onClick={() => {
                              if (file.type === "image") {
                                window.open(file.url, "_blank")
                              } else {
                                const link = document.createElement("a")
                                link.href = file.url
                                link.download = file.name
                                link.click()
                              }
                            }}
                          >
                            {file.type === "image" ? (
                              <ExternalLink className="h-4 w-4" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-purple-200 dark:border-purple-800">
                  {(selectedProject.fromDate || selectedProject.toDate) && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 font-medium text-base px-3 py-1"
                    >
                      {formatDateRange(selectedProject.fromDate, selectedProject.toDate)}
                    </Badge>
                  )}

                  {isPublic && (
                    <Button
                      variant="ghost"
                      size="lg"
                      className={`flex items-center space-x-2 ${
                        projectLoves[selectedProject.id]?.isLoved
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-500 hover:text-red-500"
                      }`}
                      onClick={() => handleLoveProject(selectedProject.id, selectedProject)}
                    >
                      <Heart className={`h-5 w-5 ${projectLoves[selectedProject.id]?.isLoved ? "fill-current" : ""}`} />
                      <span>{projectLoves[selectedProject.id]?.count || selectedProject.loves || 0}</span>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
