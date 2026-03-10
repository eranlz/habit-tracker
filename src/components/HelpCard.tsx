import { Zap, Shield, Flame, RefreshCw } from 'lucide-react'

export function HelpCard() {
  return (
    <div className="flex flex-col gap-5">
      <Item icon={<Zap size={15} className="text-warning" />} title="Active habits">
        Track progress toward a numeric target — e.g. "Run 5 km". Tap <strong>Update</strong> to log progress. The habit succeeds when you reach the target within the period.
      </Item>
      <Item icon={<Shield size={15} className="text-success" />} title="Passive habits">
        These succeed automatically every day. Tap <strong>Update</strong> then <strong>Mark as failed</strong> only when you break them — e.g. "No junk food".
      </Item>
      <Item icon={<Flame size={15} className="text-danger" />} title="Streaks">
        Your streak counts consecutive days (or weeks) you succeeded. Missing a period resets it to zero.
      </Item>
      <Item icon={<RefreshCw size={15} className="text-accent" />} title="Rollover">
        When you open the app on a new day the previous period is automatically committed and a fresh period begins.
      </Item>
    </div>
  )
}

function Item({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-white/80">{title}</p>
        <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
