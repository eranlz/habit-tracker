import { Flame } from 'lucide-react'

interface Props {
  streak: number
}

export function StreakBadge({ streak }: Props) {
  const active = streak > 0
  return (
    <div className={`flex flex-col items-center justify-center w-14 flex-shrink-0 ${
      active ? '' : 'opacity-25'
    }`}>
      <Flame
        size={24}
        className={active ? 'fill-warning text-warning drop-shadow-[0_0_6px_rgba(245,158,11,0.7)]' : 'text-white/50'}
      />
      <span className={`text-3xl font-black leading-none mt-0.5 ${active ? 'text-warning' : 'text-white/50'}`}>
        {streak}
      </span>
      <span className={`text-[12px] font-semibold uppercase tracking-wide ${active ? 'text-warning/70' : 'text-white/30'}`}>
        days
      </span>
    </div>
  )
}
