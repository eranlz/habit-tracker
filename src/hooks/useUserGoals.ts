import { useAuthStore } from '../store/useAuthStore'
import { useGoalStore } from '../store/useGoalStore'

const EMPTY_USER_DATA = { goals: [], lastOpenedAt: new Date().toISOString() }

export function useUserGoals() {
  const currentUserId = useAuthStore((s) => s.currentUserId)
  return useGoalStore((s) =>
    currentUserId ? (s.userData[currentUserId] ?? EMPTY_USER_DATA) : EMPTY_USER_DATA
  )
}
