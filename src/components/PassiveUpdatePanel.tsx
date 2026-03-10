import { CheckCircle2, XCircle } from 'lucide-react'
import type { PassiveGoal } from '../types'
import { useGoalStore } from '../store/useGoalStore'

interface Props {
  goal: PassiveGoal
  onClose: () => void
}

export function PassiveUpdatePanel({ goal, onClose }: Props) {
  const { markFailed, undoFailed } = useGoalStore()

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-2">
        {goal.isFailed ? (
          <XCircle size={64} className="text-danger" />
        ) : (
          <CheckCircle2 size={64} className="text-success" />
        )}
        <p className="text-xl font-bold text-white">
          {goal.isFailed ? "Marked as failed" : "On track!"}
        </p>
        <p className="text-sm text-white/50 text-center">
          {goal.isFailed
            ? "You can undo this if it was a mistake."
            : "This habit succeeds by default. Mark it failed if you didn't do it."}
        </p>
      </div>

      {goal.isFailed ? (
        <button
          onClick={() => { undoFailed(goal.id); onClose() }}
          className="w-full py-3 rounded-xl bg-warning/20 text-warning font-semibold hover:bg-warning/30 transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={18} /> Undo Failure
        </button>
      ) : (
        <button
          onClick={() => { markFailed(goal.id); onClose() }}
          className="w-full py-3 rounded-xl bg-danger/20 text-danger font-semibold hover:bg-danger/30 transition-colors flex items-center justify-center gap-2"
        >
          <XCircle size={18} /> Mark as Failed
        </button>
      )}

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-white/10 text-white/70 font-semibold hover:bg-white/20 transition-colors"
      >
        Close
      </button>
    </div>
  )
}
