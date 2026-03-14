import { useState, useRef, useEffect } from 'react'
import { Pencil, Trash2, ChevronRight, GripVertical, History, Info, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { parseISO } from 'date-fns'
import type { Goal } from '../types'
import { deriveStatus, statusColors } from '../lib/statusUtils'
import { useGoalStore } from '../store/useGoalStore'
import { dayKey, addDays } from '../lib/dateUtils'
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
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const status = deriveStatus(goal)
  const colors = statusColors[status]

  useEffect(() => {
    if (!showMenu) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`relative rounded-2xl border-l-4 pl-2 pr-4 py-4 ${colors.border} ${colors.bg} bg-card`}
    >
      {/* Top-right: ... menu */}
      <div ref={menuRef} className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={16} />
        </button>
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-xl bg-surface border border-white/10 shadow-xl overflow-hidden"
            >
              {goal.details && (
                <button
                  onClick={() => { setShowDetails((v) => !v); setShowMenu(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Info size={14} /> Details
                </button>
              )}
              <button
                onClick={() => { onHistory(goal); setShowMenu(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <History size={14} /> History
              </button>
              <button
                onClick={() => { onEdit(goal); setShowMenu(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                onClick={() => { setConfirmDelete(true); setShowMenu(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-stretch gap-0">
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
            <h3 className="font-semibold text-white text-base leading-tight">{goal.name}</h3>
          </div>
          {goal.type === 'active' && (
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-white/60">
                {goal.currentCount} / {goal.target} {goal.unit}
                {goal.frequency === 'weekly' && <span className="ml-1 text-white/40"></span>}
              </p>
              {goal.frequency === 'weekly' && (() => {
                const weekStart = parseISO(goal.currentPeriodKey)
                const logged = new Set(goal.activeDaysInPeriod ?? [])
                return (
                  <div className="flex gap-1">
                    {Array.from({ length: 7 }, (_, i) => {
                      const dk = dayKey(addDays(weekStart, i))
                      return (
                        <div key={i} className={`w-2 h-3 rounded-sm ${logged.has(dk) ? 'bg-white/50' : 'bg-white/10'}`} />
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          )}

          <div className="mt-1.5 flex items-center gap-2">
            <StatusPill status={status} />
            {goal.type === 'active' && (
              <div className="relative flex-shrink-0" style={{ width: 36, height: 36 }}>
                <ProgressRing current={goal.currentCount} target={goal.target} size={36} strokeWidth={2.5} />
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                  {Math.round(goal.currentCount >= goal.target ? 100 : (goal.currentCount / goal.target) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: update button */}
        <div className="flex-shrink-0 flex flex-col justify-end items-end gap-2">
          <button
            onClick={() => onUpdate(goal)}
            className="flex items-center gap-1 text-xs font-semibold border border-white/40 text-white/70 px-3 py-1.5 rounded-lg transition-colors hover:bg-white/10 hover:text-white hover:border-white/70"
          >
            Update 
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
