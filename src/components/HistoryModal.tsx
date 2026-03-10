import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { parseISO, format } from 'date-fns'
import type { Goal } from '../types'

function formatPeriod(periodKey: string): string {
  if (periodKey.includes('W')) {
    const [year, week] = periodKey.split('-W')
    return `Wk ${week} '${year.slice(2)}`
  }
  return format(parseISO(periodKey), 'MMM d')
}

interface Props {
  goal: Goal | null
  onClose: () => void
}

export function HistoryModal({ goal, onClose }: Props) {
  const entries = goal ? [...goal.history].sort((a, b) => b.periodKey.localeCompare(a.periodKey)) : []
  const gridEntries = goal ? [...goal.history].sort((a, b) => a.periodKey.localeCompare(b.periodKey)) : []
  const total = entries.length
  const succeeded = entries.filter((e) => e.succeeded).length
  const rate = total > 0 ? Math.round((succeeded / total) * 100) : 0

  return (
    <AnimatePresence>
      {goal && (
        <>
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            key="history-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-surface border-t border-white/10 pb-safe overflow-y-auto max-h-[85vh]"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 pb-8">
              <h2 className="text-lg font-bold text-white">{goal.name}</h2>
              <p className="text-xs text-white/40 mb-5">History · last {total} {goal.type === 'active' && goal.frequency === 'weekly' ? 'weeks' : 'days'}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{goal.streak}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">day streak</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{rate}%</div>
                  <div className="text-[11px] text-white/40 mt-0.5">success rate</div>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold text-white">{succeeded}</div>
                  <div className="text-[11px] text-white/40 mt-0.5">of {total} done</div>
                </div>
              </div>

              {/* Dot grid — oldest → newest */}
              {gridEntries.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5 p-3 bg-white/5 rounded-xl">
                  {gridEntries.map((entry) => (
                    <div
                      key={entry.periodKey}
                      title={`${formatPeriod(entry.periodKey)}: ${entry.succeeded ? 'succeeded' : 'failed'}`}
                      className={`w-4 h-4 rounded-sm ${entry.succeeded ? 'bg-success/70' : 'bg-danger/60'}`}
                    />
                  ))}
                </div>
              )}

              {/* Entry list — newest first */}
              {entries.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-10">No history yet — check back after the first day rolls over.</p>
              ) : (
                <div className="flex flex-col">
                  {entries.map((entry) => (
                    <div
                      key={entry.periodKey}
                      className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0"
                    >
                      {entry.succeeded ? (
                        <CheckCircle2 size={15} className="text-success flex-shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-danger flex-shrink-0" />
                      )}
                      <span className="text-sm text-white/70 w-16 flex-shrink-0">{formatPeriod(entry.periodKey)}</span>
                      <span className={`text-xs flex-shrink-0 ${entry.succeeded ? 'text-success/70' : 'text-danger/70'}`}>
                        {entry.succeeded ? 'Completed' : 'Missed'}
                      </span>
                      {goal.type === 'active' && (
                        <span className="text-xs text-white/30 ml-auto">
                          {entry.count} / {goal.target} {goal.unit}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
