import { useEffect } from 'react'
import { useGoalStore } from '../store/useGoalStore'
import { useUserGoals } from './useUserGoals'
import { computeRollover } from '../lib/rollover'

export function useRollover() {
  const { goals, lastOpenedAt } = useUserGoals()
  const { applyRollover } = useGoalStore()

  useEffect(() => {
    const result = computeRollover(goals, lastOpenedAt)
    if (result.lastOpenedAt !== lastOpenedAt) {
      applyRollover(result)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
