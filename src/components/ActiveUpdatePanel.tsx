import { useState } from 'react'
import { Minus, Plus, Check } from 'lucide-react'
import type { ActiveGoal } from '../types'
import { useGoalStore } from '../store/useGoalStore'
import { ProgressRing } from './ProgressRing'

interface Props {
  goal: ActiveGoal
  onClose: () => void
}

export function ActiveUpdatePanel({ goal, onClose }: Props) {
  const { goals, incrementCount, setCount } = useGoalStore()
  const live = (goals.find((g) => g.id === goal.id) as ActiveGoal | undefined) ?? goal
  const [inputValue, setInputValue] = useState(String(live.currentCount))

  const handleIncrement = (delta: number) => {
    incrementCount(live.id, delta)
    setInputValue(String(Math.max(0, live.currentCount + delta)))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputBlur = () => {
    const parsed = parseInt(inputValue, 10)
    if (!isNaN(parsed) && parsed >= 0) {
      const clamped = Math.min(parsed, live.target)
      setCount(live.id, clamped)
      setInputValue(String(clamped))
    } else {
      setInputValue(String(live.currentCount))
    }
  }

  const progress = live.target > 0 ? Math.min(live.currentCount / live.target, 1) : 0
  const isComplete = live.currentCount >= live.target

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
        <ProgressRing current={live.currentCount} target={live.target} size={100} strokeWidth={8} />
        <div className="absolute text-center">
          <span className="text-xl font-bold text-white">{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-white/60 text-sm">
          {live.currentCount} of {live.target} {live.unit} · {live.frequency}
        </p>
        {isComplete && (
          <p className="text-success font-semibold text-sm mt-1 flex items-center justify-center gap-1">
            <Check size={14} /> Goal reached!
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => handleIncrement(-1)}
          disabled={live.currentCount <= 0}
          className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
        >
          <Minus size={20} />
        </button>

        <input
          type="number"
          min="0"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className="w-20 text-center text-2xl font-bold text-white bg-white/10 rounded-xl py-2 border border-white/20 focus:outline-none focus:border-accent"
        />

        <button
          onClick={() => handleIncrement(1)}
          disabled={live.currentCount >= live.target}
          className="w-12 h-12 rounded-2xl bg-accent hover:bg-accent/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-xl bg-white/10 text-white/70 font-semibold hover:bg-white/20 transition-colors"
      >
        Done
      </button>
    </div>
  )
}
