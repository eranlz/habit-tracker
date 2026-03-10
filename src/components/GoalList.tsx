import { DndContext, closestCenter, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Goal } from '../types'
import { GoalCard } from './GoalCard'
import { EmptyState } from './EmptyState'
import { useGoalStore } from '../store/useGoalStore'

interface SortableItemProps {
  goal: Goal
  onUpdate: (goal: Goal) => void
  onEdit: (goal: Goal) => void
  onHistory: (goal: Goal) => void
}

function SortableItem({ goal, onUpdate, onEdit, onHistory }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <GoalCard
        goal={goal}
        onUpdate={onUpdate}
        onEdit={onEdit}
        onHistory={onHistory}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

interface Props {
  goals: Goal[]
  onUpdate: (goal: Goal) => void
  onEdit: (goal: Goal) => void
  onHistory: (goal: Goal) => void
  onAdd: () => void
}

export function GoalList({ goals, onUpdate, onEdit, onHistory, onAdd }: Props) {
  const { reorderGoals } = useGoalStore()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  )

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over && active.id !== over.id) {
      const oldIndex = goals.findIndex((g) => g.id === active.id)
      const newIndex = goals.findIndex((g) => g.id === over.id)
      reorderGoals(arrayMove(goals, oldIndex, newIndex))
    }
  }

  if (goals.length === 0) return <EmptyState onAdd={onAdd} />

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={goals.map((g) => g.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 px-4">
          {goals.map((goal) => (
            <SortableItem key={goal.id} goal={goal} onUpdate={onUpdate} onEdit={onEdit} onHistory={onHistory} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
