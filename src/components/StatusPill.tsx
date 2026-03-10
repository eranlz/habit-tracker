import type { GoalStatus } from '../lib/statusUtils'
import { statusColors, statusLabels } from '../lib/statusUtils'

interface Props {
  status: GoalStatus
}

export function StatusPill({ status }: Props) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[status].pill}`}>
      {statusLabels[status]}
    </span>
  )
}
