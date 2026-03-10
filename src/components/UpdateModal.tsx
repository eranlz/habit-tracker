import { motion, AnimatePresence } from 'framer-motion'
import type { Goal } from '../types'
import { ActiveUpdatePanel } from './ActiveUpdatePanel'
import { PassiveUpdatePanel } from './PassiveUpdatePanel'

interface Props {
  goal: Goal | null
  onClose: () => void
}

export function UpdateModal({ goal, onClose }: Props) {
  return (
    <AnimatePresence>
      {goal && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-surface border-t border-white/10 pb-safe"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />
            <div className="px-5 pb-8">
              <h2 className="text-lg font-bold text-white mb-4">{goal.name}</h2>
              {goal.type === 'active' ? (
                <ActiveUpdatePanel goal={goal} onClose={onClose} />
              ) : (
                <PassiveUpdatePanel goal={goal} onClose={onClose} />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
