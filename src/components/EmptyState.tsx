import { Target } from 'lucide-react'

interface Props {
  onAdd: () => void
}

export function EmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
        <Target size={32} className="text-accent" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No habits yet</h2>
      <p className="text-white/50 text-sm mb-6 max-w-xs">
        Start building better habits. Add your first goal and track your progress daily.
      </p>
      <button
        onClick={onAdd}
        className="bg-accent hover:bg-accent/90 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        Add your first habit
      </button>
    </div>
  )
}
