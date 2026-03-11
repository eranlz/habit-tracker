import { parseISO, startOfDay } from 'date-fns'
import type { Goal, ActiveGoal } from '../types'
import { addDays, daysBetween, startOfSundayWeek } from './dateUtils'

/**
 * Weekly streak logic (Sunday–Saturday weeks):
 *
 * - Each unit of progress requires a separate calendar day (max 1 per day).
 * - The streak counts PAST days (not today) where the goal was still achievable.
 * - "Still achievable" on day D = currentCount + daysRemaining(D..Sat) >= target.
 * - When impossible this week the streak resets to 0.
 * - The streak restarts from 0 on the next Sunday after a break (Monday shows 1).
 * - For the very first (possibly partial) week the count starts on the creation day.
 */
function calculateWeeklyStreak(goal: ActiveGoal, today: Date): number {
  const createdAt = startOfDay(parseISO(goal.createdAt))

  // --- Past completed weeks (most-recent first) ---
  const sorted = [...goal.history].sort((a, b) =>
    b.periodKey.localeCompare(a.periodKey)
  )

  let pastDays = 0
  for (const entry of sorted) {
    if (!entry.succeeded) break

    const weekSunday = parseISO(entry.periodKey)
    // Guard against legacy ISO-week keys ("2026-W10") that parseISO can't handle
    if (isNaN(weekSunday.getTime())) break

    // First week may start on the creation day rather than Sunday
    const weekStart = createdAt.getTime() > weekSunday.getTime() ? createdAt : weekSunday
    const weekEnd = addDays(weekSunday, 7) // exclusive (next Sunday)
    pastDays += daysBetween(weekStart, weekEnd)
  }

  // --- Current (live) week ---
  const currentWeekSunday = startOfSundayWeek(today)
  // First week may start on the creation day rather than Sunday
  const currentWeekStart =
    createdAt.getTime() > currentWeekSunday.getTime() ? createdAt : currentWeekSunday

  // Days from streak-start to yesterday (today itself is not yet committed)
  const daysElapsed = daysBetween(currentWeekStart, today)

  // Days remaining in this week including today (today .. Saturday)
  const nextSunday = addDays(currentWeekSunday, 7)
  const daysRemainingInWeek = daysBetween(today, nextSunday)

  if (goal.currentCount + daysRemainingInWeek >= goal.target) {
    return pastDays + daysElapsed
  }
  // Goal is no longer achievable this week — streak is broken
  return 0
}

export function calculateStreak(goal: Goal, now: Date = new Date()): number {
  if (goal.type === 'active' && goal.frequency === 'weekly') {
    return calculateWeeklyStreak(goal, startOfDay(now))
  }

  // Daily active + passive: count consecutive succeeded periods
  const sorted = [...goal.history].sort((a, b) =>
    b.periodKey.localeCompare(a.periodKey)
  )
  let periods = 0
  for (const entry of sorted) {
    if (entry.succeeded) periods++
    else break
  }
  return periods
}
