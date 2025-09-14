"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ImageIcon, FileText, Download, ExternalLink } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AchievementFile {
  id: string
  name: string
  url: string
  type: "image" | "pdf"
}

interface AchievementEntry {
  id: string
  title: string
  description: string
  date: string
  position: number
  side?: "left" | "right"
  files: AchievementFile[]
  link?: string
  descriptionType?: "plain" | "markdown"
}

interface AchievementBlockProps {
  block: any
  theme?: string
}

export function AchievementBlock({ block, theme = "default" }: AchievementBlockProps) {
  const entries = block.content?.entries || []
  const displayStyle = block.content?.displayStyle || "zigzag"
  const [selectedEntry, setSelectedEntry] = useState<AchievementEntry | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ url: string; name: string } | null>(null)

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const sortedEntries = [...entries].sort((a, b) => a.position - b.position)

  const renderDescription = (description: string, type: "plain" | "markdown" = "plain", truncate = false) => {
    let content = description

    if (truncate && content.length > 150) {
      content = content.substring(0, 150) + "..."
    }

    if (type === "markdown") {
      content = content
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br>")

      return <div dangerouslySetInnerHTML={{ __html: content }} />
    }

    return <p className="whitespace-pre-wrap">{content}</p>
  }

  const isDescriptionLong = (description: string) => description.length > 150

  if (displayStyle === "cards") {
    return (
      <>
        <Card className="w-full border-0 shadow-none bg-transparent">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-semibold">{block.title || "Achievements"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="space-y-6">
              {sortedEntries.map((entry: AchievementEntry) => (
                <Card
                  key={entry.id}
                  className={`group hover:shadow-xl transition-all duration-300 hover:scale-[1.01] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-yellow-200 dark:border-yellow-800 ${
                    isDescriptionLong(entry.description) ? "cursor-pointer" : ""
                  }`}
                  onClick={() => isDescriptionLong(entry.description) && setSelectedEntry(entry)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {entry.files.some((f) => f.type === "image") && (
                        <div className="flex-shrink-0 w-32 h-24">
                          <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                              src={entry.files.find((f) => f.type === "image")?.url || "/placeholder.svg"}
                              alt={entry.files.find((f) => f.type === "image")?.name || "Achievement image"}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation()
                                const imageFile = entry.files.find((f) => f.type === "image")
                                if (imageFile) {
                                  setSelectedImage({ url: imageFile.url, name: imageFile.name })
                                }
                              }}
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
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                            {entry.title}
                          </h3>
                        </div>

                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                          {renderDescription(entry.description, entry.descriptionType, true)}
                          {isDescriptionLong(entry.description) && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-blue-600 hover:text-blue-700"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEntry(entry)
                              }}
                            >
                              Read more...
                            </Button>
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
                                    className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                                  >
                                    <FileText className="h-4 w-4 text-red-500" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                      {file.name}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-800"
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
                        {entry.date && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 font-medium"
                          >
                            {formatDate(entry.date)}
                          </Badge>
                        )}
                        {entry.link && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(entry.link, "_blank")
                            }}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Link
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {selectedEntry?.title}
              </DialogTitle>
              <DialogDescription>{selectedEntry?.date && formatDate(selectedEntry.date)}</DialogDescription>
            </DialogHeader>

            {selectedEntry && (
              <div className="space-y-6">
                {selectedEntry.files.some((f) => f.type === "image") && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedEntry.files
                      .filter((f) => f.type === "image")
                      .map((file) => (
                        <div key={file.id} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={file.url || "/placeholder.svg"}
                            alt={file.name}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      ))}
                  </div>
                )}

                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {renderDescription(selectedEntry.description, selectedEntry.descriptionType)}
                </div>

                {selectedEntry.files.some((f) => f.type === "pdf") && (
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Attachments</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEntry.files
                        .filter((f) => f.type === "pdf")
                        .map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                          >
                            <FileText className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement("a")
                                link.href = file.url
                                link.download = file.name
                                link.click()
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {selectedEntry.link && (
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 bg-transparent"
                      onClick={() => window.open(selectedEntry.link, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View External Link
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-[800px] p-0">
            <div className="relative">
              <img
                src={selectedImage?.url || "/placeholder.svg"}
                alt={selectedImage?.name || "Achievement image"}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Zigzag style (default)
  return (
    <>
      <Card className="w-full border-0 shadow-none bg-transparent">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="font-semibold">{block.title || "Achievements"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6">
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-0.5 w-0.5 h-full bg-gradient-to-b from-yellow-400 to-yellow-200 dark:from-yellow-500 dark:to-yellow-700"></div>

            <div className="space-y-12">
              {sortedEntries.map((entry: AchievementEntry, index: number) => (
                <div key={entry.id} className="relative flex items-start">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-yellow-600 dark:bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900 shadow-lg shadow-yellow-500/25 z-10"></div>

                  <div className={`w-5/12 ${entry.side === "right" ? "ml-auto" : ""}`}>
                    <Card
                      className={`group hover:shadow-xl transition-all duration-300 border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:scale-[1.02] ${
                        isDescriptionLong(entry.description) ? "cursor-pointer" : ""
                      }`}
                      onClick={() => isDescriptionLong(entry.description) && setSelectedEntry(entry)}
                    >
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                            {entry.title}
                          </h3>

                          <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {renderDescription(entry.description, entry.descriptionType, true)}
                            {isDescriptionLong(entry.description) && (
                              <Button
                                variant="link"
                                className="p-0 h-auto text-blue-600 hover:text-blue-700 text-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedEntry(entry)
                                }}
                              >
                                Read more...
                              </Button>
                            )}
                          </div>

                          {entry.files.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {entry.files.map((file) => (
                                <Badge key={file.id} variant="outline" className="text-xs">
                                  {file.type === "image" ? (
                                    <ImageIcon className="h-3 w-3 mr-1" />
                                  ) : (
                                    <FileText className="h-3 w-3 mr-1" />
                                  )}
                                  {file.name.length > 15 ? `${file.name.substring(0, 15)}...` : file.name}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {entry.files.some((f) => f.type === "image") && (
                            <div className="pt-2">
                              <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                  src={entry.files.find((f) => f.type === "image")?.url || "/placeholder.svg"}
                                  alt={entry.files.find((f) => f.type === "image")?.name || "Achievement image"}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const imageFile = entry.files.find((f) => f.type === "image")
                                    if (imageFile) {
                                      setSelectedImage({ url: imageFile.url, name: imageFile.name })
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {entry.date && (
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                                {formatDate(entry.date)}
                              </span>
                            </div>
                          )}

                          {entry.link && (
                            <div className="pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 w-full bg-transparent"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.open(entry.link, "_blank")
                                }}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Link
                              </Button>
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

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {selectedEntry?.title}
            </DialogTitle>
            <DialogDescription>{selectedEntry?.date && formatDate(selectedEntry.date)}</DialogDescription>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6">
              {selectedEntry.files.some((f) => f.type === "image") && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedEntry.files
                    .filter((f) => f.type === "image")
                    .map((file) => (
                      <div key={file.id} className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={file.url || "/placeholder.svg"}
                          alt={file.name}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    ))}
                </div>
              )}

              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {renderDescription(selectedEntry.description, selectedEntry.descriptionType)}
              </div>

              {selectedEntry.files.some((f) => f.type === "pdf") && (
                <div className="space-y-2">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.files
                      .filter((f) => f.type === "pdf")
                      .map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                        >
                          <FileText className="h-5 w-5 text-red-500" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{file.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = file.url
                              link.download = file.name
                              link.click()
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedEntry.link && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300 bg-transparent"
                    onClick={() => window.open(selectedEntry.link, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View External Link
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="sm:max-w-[800px] p-0">
          <div className="relative">
            <img
              src={selectedImage?.url || "/placeholder.svg"}
              alt={selectedImage?.name || "Achievement image"}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
