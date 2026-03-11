import { format, startOfWeek } from 'date-fns'

export function dayKey(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd')
}

/** Returns the Date object for the Sunday that starts the week containing `date`. */
export function startOfSundayWeek(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 0 })
}

/** Returns the ISO date string of the Sunday that starts the week containing `date`. */
export function weekKey(date: Date = new Date()): string {
  return format(startOfSundayWeek(date), 'yyyy-MM-dd')
}

export function periodKey(frequency: 'daily' | 'weekly', date: Date = new Date()): string {
  return frequency === 'weekly' ? weekKey(date) : dayKey(date)
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function daysBetween(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  const aDay = new Date(a.getFullYear(), a.getMonth(), a.getDate())
  const bDay = new Date(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.round((bDay.getTime() - aDay.getTime()) / msPerDay)
}
