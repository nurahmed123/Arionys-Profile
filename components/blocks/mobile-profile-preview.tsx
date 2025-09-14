"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { PublicProfile } from "@/components/profile/public-profile"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, GripHorizontal } from "lucide-react"

interface MobileProfilePreviewProps {
  profile: any
  blocks: any[]
}

export function MobileProfilePreview({ profile, blocks }: MobileProfilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const dragRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Simulate loading time for preview
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [blocks])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newX = e.clientX - startPos.current.x
    const newY = e.clientY - startPos.current.y

    // Keep within viewport bounds
    const maxX = window.innerWidth - 400 // modal width
    const maxY = window.innerHeight - 700 // modal height

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = "grabbing"
      document.body.style.userSelect = "none"
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isDragging])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={dragRef}
      className="h-full relative"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? "none" : "transform 0.2s ease",
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border mx-auto">
        {/* Drag Handle */}
        <div
          className="bg-gray-50 px-4 py-3 border-b cursor-grab active:cursor-grabbing select-none rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripHorizontal className="h-4 w-4 text-muted-foreground" />
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                Mobile View
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {blocks.filter((b) => b.is_visible).length} visible blocks
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <ScrollArea className="h-[600px]">
          <div className="p-1">
            <PublicProfile profile={profile} blocks={blocks.filter((block) => block.is_visible)} isPreview={true} />
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
