import { AnimatePresence } from 'framer-motion'
import type { Goal } from '../types'
import { GoalCard } from './GoalCard'
import { EmptyState } from './EmptyState'

interface Props {
  goals: Goal[]
  onUpdate: (goal: Goal) => void
  onEdit: (goal: Goal) => void
  onAdd: () => void
}

export function GoalList({ goals, onUpdate, onEdit, onAdd }: Props) {
  if (goals.length === 0) {
    return <EmptyState onAdd={onAdd} />
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      <AnimatePresence mode="popLayout">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdate={onUpdate}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
