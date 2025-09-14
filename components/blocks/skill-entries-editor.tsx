"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Plus, GripVertical, Trash2, Code } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface SkillEntry {
  id: string
  name: string
  percentage: number
  position: number
}

interface SkillEntriesEditorProps {
  entries: SkillEntry[]
  onChange: (entries: SkillEntry[]) => void
}

function SortableSkillItem({
  entry,
  onUpdate,
  onDelete,
}: {
  entry: SkillEntry
  onUpdate: (id: string, updates: Partial<SkillEntry>) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: entry.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 cursor-grab active:cursor-grabbing mt-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor={`skill-name-${entry.id}`}>Skill Name</Label>
                <Input
                  id={`skill-name-${entry.id}`}
                  value={entry.name}
                  onChange={(e) => onUpdate(entry.id, { name: e.target.value })}
                  placeholder="e.g., JavaScript, React, Python..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Proficiency Level: {entry.percentage}%</Label>
              <Slider
                value={[entry.percentage]}
                onValueChange={(value) => onUpdate(entry.id, { percentage: value[0] })}
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Expert</span>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(entry.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SkillEntriesEditor({ entries, onChange }: SkillEntriesEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const addEntry = () => {
    const newEntry: SkillEntry = {
      id: `skill-${Date.now()}`,
      name: "",
      percentage: 50,
      position: entries.length,
    }
    onChange([...entries, newEntry])
  }

  const updateEntry = (id: string, updates: Partial<SkillEntry>) => {
    onChange(entries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)))
  }

  const deleteEntry = (id: string) => {
    onChange(entries.filter((entry) => entry.id !== id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = entries.findIndex((entry) => entry.id === active.id)
      const newIndex = entries.findIndex((entry) => entry.id === over.id)

      const reorderedEntries = arrayMove(entries, oldIndex, newIndex).map((entry, index) => ({
        ...entry,
        position: index,
      }))

      onChange(reorderedEntries)
    }
  }

  const sortedEntries = [...entries].sort((a, b) => a.position - b.position)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Skills</h3>
          <Badge variant="secondary">{entries.length}</Badge>
        </div>
        <Button onClick={addEntry} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {entries.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Code className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No skills added yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
              Add your technical skills and proficiency levels to showcase your expertise.
            </p>
            <Button onClick={addEntry}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sortedEntries.map((e) => e.id)} strategy={verticalListSortingStrategy}>
            {sortedEntries.map((entry) => (
              <SortableSkillItem key={entry.id} entry={entry} onUpdate={updateEntry} onDelete={deleteEntry} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
