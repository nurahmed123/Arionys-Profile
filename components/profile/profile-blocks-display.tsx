import { BlockRenderer } from "./block-renderer"

interface ProfileBlocksDisplayProps {
  blocks: any[]
  theme?: string
  profileId?: string // Add profileId prop
}

export function ProfileBlocksDisplay({ blocks, theme = "classic", profileId }: ProfileBlocksDisplayProps) {
  const visibleBlocks = blocks.filter((block) => block.is_visible).sort((a, b) => a.position - b.position)

  if (visibleBlocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No content blocks to display</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {visibleBlocks.map((block) => (
        <BlockRenderer key={block.id} block={block} theme={theme} profileId={profileId} />
      ))}
    </div>
  )
}
