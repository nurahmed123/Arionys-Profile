"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, ExternalLink, Play } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface VideoBlockProps {
  block: any
  theme?: string
}

export function VideoBlock({ block, theme = "default" }: VideoBlockProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { title, url, description, thumbnail } = block.content
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  if (!url) return null

  const getVideoId = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.split("v=")[1]?.split("&")[0]
    }
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1]?.split("?")[0]
    }
    if (url.includes("vimeo.com/")) {
      return url.split("vimeo.com/")[1]?.split("?")[0]
    }
    return null
  }

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  const getEmbedUrl = (url: string, videoId: string) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`
    }
    if (url.includes("vimeo.com")) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`
    }
    return null
  }

  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be")
  const isVimeo = url.includes("vimeo.com")
  const videoId = getVideoId(url)
  const embedUrl = videoId ? getEmbedUrl(url, videoId) : null

  const displayThumbnail = thumbnail || (isYouTube && videoId ? getYouTubeThumbnail(videoId) : null)

  return (
    <Card className={classes.card}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div
            className={`w-12 h-12 ${classes.accent.replace("text-", "bg-").replace("-600", "-100")} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <Video className={`h-6 w-6 ${classes.accent}`} />
          </div>
          <div className="flex-1">
            <h3 className={`${classes.heading} text-lg mb-2 text-balance`}>{block.title || title || "Video"}</h3>
            {description && <p className={`${classes.muted} mb-4 text-pretty`}>{description}</p>}

            {embedUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                {isPlaying ? (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative w-full h-full cursor-pointer group" onClick={() => setIsPlaying(true)}>
                    {displayThumbnail ? (
                      <Image
                        src={displayThumbnail || "/placeholder.svg"}
                        alt="Video thumbnail"
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <span className="text-white text-lg">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-white transition-colors">
                        <Play className="h-6 w-6 text-gray-900 ml-1" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-2">Unsupported video format</p>
                <div className="flex items-center justify-center space-x-2">
                  {isYouTube && <Badge variant="secondary">YouTube</Badge>}
                  {isVimeo && <Badge variant="secondary">Vimeo</Badge>}
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 mt-3"
                >
                  <span>Watch on external site</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="flex items-center space-x-2 mt-3">
              {isYouTube && (
                <Badge variant="outline" className="text-xs">
                  YouTube
                </Badge>
              )}
              {isVimeo && (
                <Badge variant="outline" className="text-xs">
                  Vimeo
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
