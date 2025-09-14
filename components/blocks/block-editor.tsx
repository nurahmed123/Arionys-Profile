"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, GripVertical, Edit, Trash2, Eye, EyeOff, Smartphone, X } from "lucide-react"
import { BlockCard } from "./block-card"
import { BlockEditDialog } from "./block-edit-dialog"
import { BLOCK_TYPES } from "./block-types"
import { MobileProfilePreview } from "./mobile-profile-preview"

interface BlockEditorProps {
  profile: any
  initialBlocks: any[]
  showMobilePreview?: boolean
  onToggleMobilePreview?: (show: boolean) => void
}

export function BlockEditor({
  profile,
  initialBlocks,
  showMobilePreview = false,
  onToggleMobilePreview,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState(initialBlocks)
  const [editingBlock, setEditingBlock] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [localShowMobilePreview, setLocalShowMobilePreview] = useState(showMobilePreview)
  const supabase = createClient()
  if (!supabase) {
    console.error("Supabase client not available")
    return null
  }

  const handleToggleMobilePreview = () => {
    const newState = !localShowMobilePreview
    setLocalShowMobilePreview(newState)
    onToggleMobilePreview?.(newState)
  }

  const handleAddBlock = useCallback(
    async (blockType: string) => {
      console.log("[v0] Adding block of type:", blockType)

      if (!profile?.id) {
        console.error("[v0] Profile ID not found:", profile)
        return
      }

      const newBlock = {
        profile_id: profile.id,
        block_type: blockType,
        title: "",
        content: {},
        position: blocks.length,
        is_visible: true,
      }

      console.log("[v0] Creating new block:", newBlock)

      try {
        const { data, error } = await supabase.from("profile_blocks").insert(newBlock).select().single()

        if (error) {
          console.error("[v0] Error inserting block:", error)
          throw error
        }

        console.log("[v0] Block created successfully:", data)
        setBlocks((prev) => [...prev, data])
        setEditingBlock(data)
        setIsDialogOpen(true)
      } catch (error) {
        console.error("[v0] Error adding block:", error)
      }
    },
    [blocks.length, profile, supabase],
  )

  const handleDropdownClick = (blockType: string) => {
    console.log("[v0] Dropdown item clicked:", blockType)
    handleAddBlock(blockType)
  }

  const handleEditBlock = useCallback((block: any) => {
    setEditingBlock(block)
    setIsDialogOpen(true)
  }, [])

  const handleSaveBlock = useCallback(
    async (blockData: any) => {
      try {
        const { error } = await supabase
          .from("profile_blocks")
          .update({
            title: blockData.title,
            content: blockData.content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", blockData.id)

        if (error) throw error

        setBlocks((prev) => prev.map((block) => (block.id === blockData.id ? { ...block, ...blockData } : block)))
        setIsDialogOpen(false)
        setEditingBlock(null)
      } catch (error) {
        console.error("Error saving block:", error)
      }
    },
    [supabase],
  )

  const handleDeleteBlock = useCallback(
    async (blockId: string) => {
      try {
        const { error } = await supabase.from("profile_blocks").delete().eq("id", blockId)

        if (error) throw error

        setBlocks((prev) => prev.filter((block) => block.id !== blockId))
      } catch (error) {
        console.error("Error deleting block:", error)
      }
    },
    [supabase],
  )

  const handleToggleVisibility = useCallback(
    async (blockId: string, isVisible: boolean) => {
      try {
        const { error } = await supabase.from("profile_blocks").update({ is_visible: isVisible }).eq("id", blockId)

        if (error) throw error

        setBlocks((prev) => prev.map((block) => (block.id === blockId ? { ...block, is_visible: isVisible } : block)))
      } catch (error) {
        console.error("Error updating visibility:", error)
      }
    },
    [supabase],
  )

  const handleReorderBlocks = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      const draggedBlock = blocks[dragIndex]
      const newBlocks = [...blocks]
      newBlocks.splice(dragIndex, 1)
      newBlocks.splice(hoverIndex, 0, draggedBlock)

      // Update positions
      const updatedBlocks = newBlocks.map((block, index) => ({
        ...block,
        position: index,
      }))

      setBlocks(updatedBlocks)

      // Update positions in database
      try {
        const updates = updatedBlocks.map((block) => ({
          id: block.id,
          position: block.position,
        }))

        for (const update of updates) {
          await supabase.from("profile_blocks").update({ position: update.position }).eq("id", update.id)
        }
      } catch (error) {
        console.error("Error reordering blocks:", error)
      }
    },
    [blocks, supabase],
  )

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/html", e.currentTarget.outerHTML)
    e.currentTarget.style.opacity = "0.5"
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.currentTarget.style.opacity = "1"
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        handleReorderBlocks(draggedIndex, dropIndex)
      }
      setDraggedIndex(null)
      setDragOverIndex(null)
    },
    [draggedIndex, handleReorderBlocks],
  )

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Profile not found. Please complete your profile setup first.
          </p>
        </CardContent>
      </Card>
    )
  }

  console.log("[v0] Rendering BlockEditor with profile:", profile?.id, "blocks:", blocks.length)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Block List */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Content Blocks ({blocks.length})</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleToggleMobilePreview}
              className="flex items-center space-x-2 bg-transparent"
            >
              <Smartphone className="h-4 w-4" />
              <span>{localShowMobilePreview ? "Hide Preview" : "Mobile Preview"}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button onClick={() => console.log("[v0] Add Block button clicked")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Block
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {Object.entries(BLOCK_TYPES).map(([key, blockType]) => (
                  <DropdownMenuItem key={key} onClick={() => handleDropdownClick(key)} className="cursor-pointer">
                    <span className="mr-2">{blockType.icon}</span>
                    {blockType.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {blocks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">No content blocks yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start building your profile by adding your first content block
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button onClick={() => console.log("[v0] First block button clicked")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Block
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-56">
                      {Object.entries(BLOCK_TYPES).map(([key, blockType]) => (
                        <DropdownMenuItem key={key} onClick={() => handleDropdownClick(key)} className="cursor-pointer">
                          <span className="mr-2">{blockType.icon}</span>
                          {blockType.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <div
                key={block.id}
                className={`group relative transition-all duration-200 ${
                  dragOverIndex === index ? "transform scale-105 shadow-lg" : ""
                } ${draggedIndex === index ? "opacity-50" : ""}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                {dragOverIndex === index && draggedIndex !== index && (
                  <div className="absolute -top-2 left-0 right-0 h-1 bg-blue-500 rounded-full z-10" />
                )}

                <Card
                  className={`transition-all hover:shadow-md ${
                    dragOverIndex === index ? "border-blue-500 border-2" : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="cursor-grab active:cursor-grabbing hover:bg-gray-100 p-1 rounded transition-colors">
                          <GripVertical className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {BLOCK_TYPES[block.block_type] && (
                            <span className="flex items-center justify-center">
                              {BLOCK_TYPES[block.block_type].icon}
                            </span>
                          )}
                          <div>
                            <h3 className="font-medium">
                              {block.title || BLOCK_TYPES[block.block_type]?.name || "Untitled Block"}
                            </h3>
                            <p className="text-sm text-muted-foreground capitalize">{block.block_type} block</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={block.is_visible ? "default" : "secondary"}>
                          {block.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(block.id, !block.is_visible)}
                          >
                            {block.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditBlock(block)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBlock(block.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <BlockCard block={block} />
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar - Modified to show mobile preview or block types */}
      <div className="space-y-6">
        {localShowMobilePreview ? (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5" />
                  <span>Mobile Preview</span>
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={handleToggleMobilePreview}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{blocks.filter((b) => b.is_visible).length} visible blocks</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <MobileProfilePreview profile={profile} blocks={blocks} />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Block Types</CardTitle>
                <CardDescription>Available content blocks for your profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(BLOCK_TYPES).map(([key, blockType]) => (
                  <div
                    key={key}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleAddBlock(key)}
                  >
                    <span className="flex items-center justify-center">{blockType.icon}</span>
                    <div>
                      <p className="font-medium text-sm">{blockType.name}</p>
                      <p className="text-xs text-muted-foreground">{blockType.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Drag blocks to reorder them</p>
                <p>• Use the eye icon to hide/show blocks</p>
                <p>• Add multiple social media blocks</p>
                <p>• Keep your about section concise</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <BlockEditDialog
        block={editingBlock}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingBlock(null)
        }}
        onSave={handleSaveBlock}
      />
    </div>
  )
}
