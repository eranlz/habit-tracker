import { useState } from 'react'
import { useGoalStore } from '../store/useGoalStore'
import { NumericStepper } from './NumericStepper'
import type { GoalType, Frequency } from '../types'

interface Props {
  onClose: () => void
}

export function AddGoalForm({ onClose }: Props) {
  const { addGoal } = useGoalStore()
  const [name, setName] = useState('')
  const [type, setType] = useState<GoalType>('active')
  const [frequency, setFrequency] = useState<Frequency>('daily')
  const [target, setTarget] = useState(1)
  const [unit, setUnit] = useState('times')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (type === 'active') {
      addGoal({ type: 'active', name: name.trim(), frequency, target, unit })
    } else {
      addGoal({ type: 'passive', name: name.trim(), frequency: 'daily' })
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
          placeholder="e.g. Morning run"
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent text-sm"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(['active', 'passive'] as GoalType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                type === t
                  ? 'bg-accent text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/40 mt-1.5">
          {type === 'active'
            ? 'Log progress toward a numeric target'
            : 'Succeeds by default — mark failed if needed'}
        </p>
      </div>

      {type === 'active' && (
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
                placeholder="e.g. km, pages"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent text-sm"
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
          Add Habit
        </button>
      </div>
    </form>
  )
}
