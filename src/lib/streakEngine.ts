import type { Goal } from '../types'

export function calculateStreak(goal: Goal): number {
  const sorted = [...goal.history].sort((a, b) =>
    b.periodKey.localeCompare(a.periodKey)
  )

  let periods = 0
  for (const entry of sorted) {
    if (entry.succeeded) {
      periods++
    } else {
      break
    }
  }

  // Streak is always expressed in days.
  // Weekly goals: each successful period represents 7 days.
  const isWeekly = goal.type === 'active' && goal.frequency === 'weekly'
  return isWeekly ? periods * 7 : periods
}
