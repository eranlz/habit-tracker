import { parseISO, startOfDay } from 'date-fns'
import type { Goal, ActiveGoal, PassiveGoal, HistoryEntry } from '../types'
import { dayKey, weekKey, addDays, daysBetween } from './dateUtils'
import { calculateStreak } from './streakEngine'

const MAX_HISTORY = 90

function capHistory(history: HistoryEntry[]): HistoryEntry[] {
  if (history.length <= MAX_HISTORY) return history
  return history.slice(history.length - MAX_HISTORY)
}

function rolloverActive(goal: ActiveGoal, _lastOpened: Date, today: Date): ActiveGoal {
  if (goal.frequency === 'weekly') {
    const todayWeek = weekKey(today)

    if (goal.currentPeriodKey !== todayWeek) {
      // New week — commit the current period and reset
      const newHistory = capHistory([
        ...goal.history,
        {
          periodKey: goal.currentPeriodKey,
          count: goal.currentCount,
          succeeded: goal.currentCount >= goal.target,
        },
      ])
      const updated = { ...goal, history: newHistory, currentCount: 0, currentPeriodKey: todayWeek }
      return { ...updated, streak: calculateStreak(updated, today) }
    }

    // Same week — the streak can still change day-to-day, so refresh it
    return { ...goal, streak: calculateStreak(goal, today) }
  }

  // Daily
  const todayStr = dayKey(today)
  if (goal.currentPeriodKey === todayStr) return goal

  const lastDate = parseISO(goal.currentPeriodKey)
  const newHistory: HistoryEntry[] = [...goal.history]

  // Commit last period
  newHistory.push({
    periodKey: goal.currentPeriodKey,
    count: goal.currentCount,
    succeeded: goal.currentCount >= goal.target,
  })

  // Fill gap days (last open + 1 → yesterday)
  const gapDays = daysBetween(lastDate, today) - 1
  for (let i = 1; i <= gapDays; i++) {
    const gapDate = addDays(lastDate, i)
    const gapKey = dayKey(gapDate)
    if (gapKey !== todayStr) {
      newHistory.push({ periodKey: gapKey, count: 0, succeeded: false })
    }
  }

  const capped = capHistory(newHistory)
  const updated = { ...goal, history: capped }
  return {
    ...updated,
    currentCount: 0,
    currentPeriodKey: todayStr,
    streak: calculateStreak(updated),
  }
}

function rolloverPassive(goal: PassiveGoal, _lastOpened: Date, today: Date): PassiveGoal {
  const todayStr = dayKey(today)
  if (goal.currentDayKey === todayStr) return goal

  const lastDate = parseISO(goal.currentDayKey)
  const newHistory: HistoryEntry[] = [...goal.history]

  // Commit last day
  newHistory.push({
    periodKey: goal.currentDayKey,
    count: 0,
    succeeded: !goal.isFailed,
  })

  // Fill gap days — passive succeeds by default
  const gapDays = daysBetween(lastDate, today) - 1
  for (let i = 1; i <= gapDays; i++) {
    const gapDate = addDays(lastDate, i)
    const gapKey = dayKey(gapDate)
    if (gapKey !== todayStr) {
      newHistory.push({ periodKey: gapKey, count: 0, succeeded: true })
    }
  }

  const capped = capHistory(newHistory)
  const updated = { ...goal, history: capped }
  return {
    ...updated,
    isFailed: false,
    currentDayKey: todayStr,
    streak: calculateStreak(updated),
  }
}

export interface RolloverResult {
  goals: Goal[]
  lastOpenedAt: string
}

export function computeRollover(
  goals: Goal[],
  lastOpenedAt: string,
  now: Date = new Date()
): RolloverResult {
  const today = startOfDay(now)
  const lastOpened = startOfDay(parseISO(lastOpenedAt))

  if (today.getTime() === lastOpened.getTime()) {
    return { goals, lastOpenedAt }
  }

  const updated = goals.map((goal) => {
    if (goal.type === 'active') return rolloverActive(goal, lastOpened, today)
    return rolloverPassive(goal, lastOpened, today)
  })

  return { goals: updated, lastOpenedAt: now.toISOString() }
}
