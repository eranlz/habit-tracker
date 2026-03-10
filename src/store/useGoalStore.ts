import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, ActiveGoal, PassiveGoal } from '../types'
import { dayKey, periodKey } from '../lib/dateUtils'
import type { RolloverResult } from '../lib/rollover'
import { useAuthStore } from './useAuthStore'

type ActiveDraft = Omit<ActiveGoal, 'id' | 'createdAt' | 'streak' | 'history' | 'currentCount' | 'currentPeriodKey'>
type PassiveDraft = Omit<PassiveGoal, 'id' | 'createdAt' | 'streak' | 'history' | 'isFailed' | 'currentDayKey'>

export type GoalDraft = ActiveDraft | PassiveDraft

interface UserData {
  goals: Goal[]
  lastOpenedAt: string
}

interface GoalStore {
  userData: Record<string, UserData>
  addGoal: (draft: GoalDraft) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  incrementCount: (id: string, delta: number) => void
  setCount: (id: string, value: number) => void
  markFailed: (id: string) => void
  undoFailed: (id: string) => void
  applyRollover: (result: RolloverResult) => void
}

const uid = () => useAuthStore.getState().currentUserId

const EMPTY_USER_DATA: UserData = {
  goals: [],
  lastOpenedAt: new Date().toISOString(),
}

const getUD = (state: GoalStore, id: string): UserData =>
  state.userData[id] ?? EMPTY_USER_DATA

const setUD = (state: GoalStore, id: string, patch: Partial<UserData>): Partial<GoalStore> => ({
  userData: {
    ...state.userData,
    [id]: { ...getUD(state, id), ...patch },
  },
})

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      userData: {},

      addGoal: (draft) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        const id =
          typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0
                return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
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

        const ud = getUD(state, userId)
        return setUD(state, userId, { goals: [...ud.goals, goal] })
      }),

      updateGoal: (id, patch) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        const ud = getUD(state, userId)
        return setUD(state, userId, {
          goals: ud.goals.map((g) => (g.id === id ? { ...g, ...patch } as Goal : g)),
        })
      }),

      deleteGoal: (id) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        const ud = getUD(state, userId)
        return setUD(state, userId, {
          goals: ud.goals.filter((g) => g.id !== id),
        })
      }),

      incrementCount: (id, delta) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        const ud = getUD(state, userId)
        return setUD(state, userId, {
          goals: ud.goals.map((g) => {
            if (g.id !== id || g.type !== 'active') return g
            const newCount = Math.max(0, g.currentCount + delta)
            return { ...g, currentCount: newCount }
          }),
        })
      }),

      setCount: (id, value) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        const ud = getUD(state, userId)
        return setUD(state, userId, {
          goals: ud.goals.map((g) => {
            if (g.id !== id || g.type !== 'active') return g
            return { ...g, currentCount: Math.max(0, value) }
          }),
        })
      }),

      markFailed: (id) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        const ud = getUD(state, userId)
        return setUD(state, userId, {
          goals: ud.goals.map((g) => {
            if (g.id !== id || g.type !== 'passive') return g
            return { ...g, isFailed: true }
          }),
        })
      }),

      undoFailed: (id) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        const ud = getUD(state, userId)
        return setUD(state, userId, {
          goals: ud.goals.map((g) => {
            if (g.id !== id || g.type !== 'passive') return g
            const today = dayKey()
            if (g.currentDayKey !== today) return g
            return { ...g, isFailed: false }
          }),
        })
      }),

      applyRollover: (result) => set((state) => {
        const userId = uid()
        if (!userId) return {}
        return setUD(state, userId, {
          goals: result.goals,
          lastOpenedAt: result.lastOpenedAt,
        })
      }),
    }),
    { name: 'nexus-goals-v1' }
  )
)
