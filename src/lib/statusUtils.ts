import type { Goal } from '../types'
import { addDays, daysBetween, startOfSundayWeek } from './dateUtils'
import { startOfDay } from 'date-fns'

export type GoalStatus = 'success' | 'in-progress' | 'pending' | 'failed'

export function deriveStatus(goal: Goal, now: Date = new Date()): GoalStatus {
  if (goal.type === 'passive') return goal.isFailed ? 'failed' : 'success'

  if (goal.type === 'active' && goal.frequency === 'weekly') {
    if (goal.currentCount >= goal.target) return 'success'
    const today = startOfDay(now)
    const currentWeekSunday = startOfSundayWeek(today)
    const daysRemaining = daysBetween(today, addDays(currentWeekSunday, 7))
    if (goal.currentCount + daysRemaining < goal.target) return 'failed'
    if (goal.currentCount > 0) return 'in-progress'
    return 'pending'
  }

  if (goal.currentCount >= goal.target) return 'success'
  if (goal.currentCount > 0) return 'in-progress'
  return 'pending'
}

export const statusColors: Record<GoalStatus, {
  border: string
  bg: string
  text: string
  pill: string
}> = {
  success: {
    border: 'border-success',
    bg: 'bg-success/10',
    text: 'text-success',
    pill: 'bg-success/20 text-success',
  },
  'in-progress': {
    border: 'border-warning',
    bg: 'bg-warning/10',
    text: 'text-warning',
    pill: 'bg-warning/20 text-warning',
  },
  pending: {
    border: 'border-white/10',
    bg: 'bg-white/5',
    text: 'text-white/50',
    pill: 'bg-white/10 text-white/50',
  },
  failed: {
    border: 'border-danger',
    bg: 'bg-danger/10',
    text: 'text-danger',
    pill: 'bg-danger/20 text-danger',
  },
}

export const statusLabels: Record<GoalStatus, string> = {
  success: 'Success',
  'in-progress': 'In Progress',
  pending: 'Pending',
  failed: 'Failed',
}
