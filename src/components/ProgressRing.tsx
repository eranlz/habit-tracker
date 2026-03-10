interface Props {
  current: number
  target: number
  size?: number
  strokeWidth?: number
}

export function ProgressRing({ current, target, size = 56, strokeWidth = 5 }: Props) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = target > 0 ? Math.min(current / target, 1) : 0
  const offset = circumference - progress * circumference

  const color = progress >= 1 ? '#22c55e' : progress > 0 ? '#f59e0b' : '#ffffff20'

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#ffffff10"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
      />
    </svg>
  )
}
