import { useState } from 'react'
import { Pencil, Trash2, ChevronRight, GripVertical, History, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Goal } from '../types'
import { deriveStatus, statusColors } from '../lib/statusUtils'
import { useGoalStore } from '../store/useGoalStore'
import { StreakBadge } from './StreakBadge'
import { StatusPill } from './StatusPill'
import { ProgressRing } from './ProgressRing'

interface Props {
  goal: Goal
  onUpdate: (goal: Goal) => void
  onEdit: (goal: Goal) => void
  onHistory: (goal: Goal) => void
  dragHandleProps?: React.HTMLAttributes<HTMLElement>
}

export function GoalCard({ goal, onUpdate, onEdit, onHistory, dragHandleProps }: Props) {
  const { deleteGoal } = useGoalStore()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const status = deriveStatus(goal)
  const colors = statusColors[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`relative rounded-2xl border-l-4 pl-2 pr-4 py-4 ${colors.border} ${colors.bg} bg-card`}
    >
      <div className="flex items-center gap-0">
        {/* Leftmost: drag handle */}
        <button
          {...dragHandleProps}
          className="p-0 -mr-3 rounded-lg text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical size={30} />
        </button>

        {/* Streak badge */}
        <StreakBadge streak={goal.streak} />

        {/* Name, progress text, status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Progress ring (active only) — left-aligned with name */}
            {goal.type === 'active' && (
              <div className="flex-shrink-0 relative" style={{ width: 36, height: 36 }}>
                <ProgressRing current={goal.currentCount} target={goal.target} size={36} strokeWidth={3} />
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
                  {Math.round(goal.currentCount >= goal.target ? 100 : (goal.currentCount / goal.target) * 100)}%
                </span>
              </div>
            )}
            <h3 className="font-semibold text-white text-base leading-tight">{goal.name}</h3>
          </div>
          {goal.type === 'active' && (
            <p className="text-sm text-white/60 mt-0.5">
              {goal.currentCount} / {goal.target} {goal.unit}
              {goal.frequency === 'weekly' && <span className="ml-1 text-white/40">(weekly)</span>}
            </p>
          )}

          <div className="mt-1.5 flex items-center gap-2">
            <StatusPill status={status} />
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            {goal.details && (
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                aria-label="Show details"
              >
                <Info size={14} />
              </button>
            )}
            <button
              onClick={() => onHistory(goal)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
              aria-label="View history"
            >
              <History size={14} />
            </button>
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
              aria-label="Edit goal"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg text-white/40 hover:text-danger hover:bg-danger/10 transition-colors"
              aria-label="Delete goal"
            >
              <Trash2 size={14} />
            </button>
          </div>

          <button
            onClick={() => onUpdate(goal)}
            className={`flex items-center gap-1 text-xs font-semibold border px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10 ${colors.text} ${colors.border}`}
          >
            Update <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && goal.details && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-card border-t border-white/10 px-4 py-3 flex items-start justify-between gap-3"
          >
            <p className="text-sm text-white/70 leading-snug">{goal.details}</p>
            <button
              onClick={() => setShowDetails(false)}
              className="flex-shrink-0 text-xs text-white/40 hover:text-white/70 transition-colors mt-0.5"
              aria-label="Close details"
            >
              ✕
            </button>
          </motion.div>
        )}
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-card border-t border-white/10 px-4 py-3 flex items-center justify-between"
          >
            <p className="text-sm text-white/80">Delete this habit?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-danger text-white hover:bg-danger/80 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
