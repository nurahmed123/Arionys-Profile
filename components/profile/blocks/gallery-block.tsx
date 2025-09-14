"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, X } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import { getTheme, getThemeClasses } from "@/lib/themes"

interface GalleryBlockProps {
  block: any
  theme?: string
}

export function GalleryBlock({ block, theme = "default" }: GalleryBlockProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const { title, description, images } = block.content
  const themeConfig = getTheme(theme)
  const classes = getThemeClasses(themeConfig)

  const imageList = images && Array.isArray(images) ? images.filter(Boolean) : []

  return (
    <>
      <Card className={classes.card}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div
              className={`w-12 h-12 ${classes.accent.replace("text-", "bg-").replace("-600", "-100")} rounded-full flex items-center justify-center flex-shrink-0`}
            >
              <ImageIcon className={`h-6 w-6 ${classes.accent}`} />
            </div>
            <div className="flex-1">
              <h3 className={`${classes.heading} text-lg mb-2 text-balance`}>{block.title || title || "Gallery"}</h3>
              {description && <p className={`${classes.muted} mb-4 text-pretty`}>{description}</p>}

              {imageList.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageList.map((image: string, index: number) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Gallery image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`${classes.background.replace("bg-", "bg-").includes("gray") ? "bg-gray-50" : "bg-white/50"} rounded-lg p-8 text-center`}
                >
                  <ImageIcon className={`h-12 w-12 ${classes.muted} mx-auto mb-3`} />
                  <p className={`text-sm ${classes.muted} mb-2`}>No images to display</p>
                  <Badge variant="secondary">Gallery is empty</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <Image
              src={selectedImage || "/placeholder.svg"}
              alt="Gallery image"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
