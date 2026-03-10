import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, ActiveGoal, PassiveGoal } from '../types'
import { dayKey, periodKey } from '../lib/dateUtils'
import type { RolloverResult } from '../lib/rollover'

type ActiveDraft = Omit<ActiveGoal, 'id' | 'createdAt' | 'streak' | 'history' | 'currentCount' | 'currentPeriodKey'>
type PassiveDraft = Omit<PassiveGoal, 'id' | 'createdAt' | 'streak' | 'history' | 'isFailed' | 'currentDayKey'>

export type GoalDraft = ActiveDraft | PassiveDraft

interface GoalStore {
  goals: Goal[]
  lastOpenedAt: string
  addGoal: (draft: GoalDraft) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  incrementCount: (id: string, delta: number) => void
  setCount: (id: string, value: number) => void
  markFailed: (id: string) => void
  undoFailed: (id: string) => void
  applyRollover: (result: RolloverResult) => void
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],
      lastOpenedAt: new Date().toISOString(),

      addGoal: (draft) => set((state) => {
        const id = typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
              const r = Math.random() * 16 | 0
              return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
            })
        const now = new Date()
        let goal: Goal

        if (draft.type === 'active') {
          goal = {
            ...(draft as ActiveDraft),
            id,
            createdAt: now.toISOString(),
            streak: 0,
            history: [],
            currentCount: 0,
            currentPeriodKey: periodKey(draft.frequency, now),
          } as ActiveGoal
        } else {
          goal = {
            ...(draft as PassiveDraft),
            id,
            createdAt: now.toISOString(),
            streak: 0,
            history: [],
            isFailed: false,
            currentDayKey: dayKey(now),
          } as PassiveGoal
        }

        return { goals: [...state.goals, goal] }
      }),

      updateGoal: (id, patch) => set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...patch } as Goal : g)),
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
      })),

      incrementCount: (id, delta) => set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id !== id || g.type !== 'active') return g
          const newCount = Math.max(0, g.currentCount + delta)
          const newHistory = g.currentCount >= g.target && newCount < g.target
            ? g.history
            : g.history
          return { ...g, currentCount: newCount, history: newHistory }
        }),
      })),

      setCount: (id, value) => set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id !== id || g.type !== 'active') return g
          return { ...g, currentCount: Math.max(0, value) }
        }),
      })),

      markFailed: (id) => set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id !== id || g.type !== 'passive') return g
          return { ...g, isFailed: true }
        }),
      })),

      undoFailed: (id) => set((state) => ({
        goals: state.goals.map((g) => {
          if (g.id !== id || g.type !== 'passive') return g
          const today = dayKey()
          if (g.currentDayKey !== today) return g
          return { ...g, isFailed: false }
        }),
      })),

      applyRollover: (result) => set(() => ({
        goals: result.goals,
        lastOpenedAt: result.lastOpenedAt,
      })),
    }),
    {
      name: 'nexus-goals-v1',
    }
  )
)

