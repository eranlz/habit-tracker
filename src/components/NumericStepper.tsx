import { useRef } from 'react'
import { Minus, Plus } from 'lucide-react'

interface Props {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export function NumericStepper({ value, min = 1, max = 9999, onChange }: Props) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    onChange(clamp(value + (e.deltaY < 0 ? 1 : -1)))
  }

  // Long-press repeat
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startRepeat = (delta: number) => {
    intervalRef.current = setInterval(() => onChange(clamp(value + delta)), 100)
  }
  const stopRepeat = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div
      className="flex items-center h-[46px] bg-white/10 border border-white/20 rounded-xl overflow-hidden"
      onWheel={handleWheel}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        onMouseDown={() => startRepeat(-1)}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchStart={() => startRepeat(-1)}
        onTouchEnd={stopRepeat}
        disabled={value <= min}
        className="px-3 py-3 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="flex-1 text-center text-white font-semibold text-sm select-none">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        onMouseDown={() => startRepeat(1)}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchStart={() => startRepeat(1)}
        onTouchEnd={stopRepeat}
        disabled={value >= max}
        className="px-3 py-3 text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
  )
}
