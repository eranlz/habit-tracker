import { useState } from 'react'
import { useGoalStore } from '../store/useGoalStore'
import { NumericStepper } from './NumericStepper'
import type { Goal, Frequency } from '../types'

interface Props {
  goal: Goal
  onClose: () => void
}

export function EditGoalForm({ goal, onClose }: Props) {
  const { updateGoal } = useGoalStore()
  const [name, setName] = useState(goal.name)
  const [details, setDetails] = useState(goal.details ?? '')
  const [frequency, setFrequency] = useState<Frequency>(
    goal.type === 'active' ? goal.frequency : 'daily'
  )
  const [target, setTarget] = useState(goal.type === 'active' ? goal.target : 1)
  const [unit, setUnit] = useState(goal.type === 'active' ? goal.unit : '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (goal.type === 'active') {
      updateGoal(goal.id, { name: name.trim(), frequency, target, unit, details: details.trim() || undefined })
    } else {
      updateGoal(goal.id, { name: name.trim(), details: details.trim() || undefined })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Habit name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent text-sm"
          autoFocus
        />
      </div>

      <div>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Details (optional)"
          rows={2}
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent text-sm resize-none"
        />
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 rounded-xl">
        <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Type:</span>
        <span className="text-xs text-white/70 font-semibold capitalize">{goal.type}</span>
      </div>

      {goal.type === 'active' && (
        <>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Frequency</label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'weekly'] as Frequency[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    frequency === f
                      ? 'bg-accent text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Target</label>
              <NumericStepper value={target} onChange={setTarget} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full h-[46px] bg-white/10 border border-white/20 rounded-xl px-4 text-white focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>
        </>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 font-semibold hover:bg-white/20 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  )
}
