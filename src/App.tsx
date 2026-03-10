import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGoalStore } from './store/useGoalStore'
import { useRollover } from './hooks/useRollover'
import { GoalList } from './components/GoalList'
import { UpdateModal } from './components/UpdateModal'
import { AddGoalForm } from './components/AddGoalForm'
import { EditGoalForm } from './components/EditGoalForm'
import type { Goal } from './types'

type ModalMode = 'none' | 'add' | 'edit' | 'update'

export default function App() {
  useRollover()

  const { goals } = useGoalStore()
  const [modalMode, setModalMode] = useState<ModalMode>('none')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const openUpdate = (goal: Goal) => {
    setSelectedGoal(goal)
    setModalMode('update')
  }

  const openEdit = (goal: Goal) => {
    setSelectedGoal(goal)
    setModalMode('edit')
  }

  const openAdd = () => {
    setSelectedGoal(null)
    setModalMode('add')
  }

  const closeModal = () => {
    setModalMode('none')
    setSelectedGoal(null)
  }

  const isSheetOpen = modalMode === 'add' || modalMode === 'edit'

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Nexus</h1>
            <p className="text-xs text-white/40">
              {goals.length} {goals.length === 1 ? 'habit' : 'habits'}
            </p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent/80 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </header>

      {/* Goal list */}
      <main className="max-w-lg mx-auto pt-4 pb-24">
        <GoalList
          goals={goals}
          onUpdate={openUpdate}
          onEdit={openEdit}
          onAdd={openAdd}
        />
      </main>

      {/* Update modal (bottom sheet for active/passive updates) */}
      <UpdateModal
        goal={modalMode === 'update' ? selectedGoal : null}
        onClose={closeModal}
      />

      {/* Add / Edit bottom sheet */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div
              key="form-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeModal}
            />
            <motion.div
              key="form-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-surface border-t border-white/10 pb-safe overflow-y-auto max-h-[90vh]"
            >
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />
              <div className="px-5 pb-8">
                <h2 className="text-lg font-bold text-white mb-4">
                  {modalMode === 'add' ? 'New Habit' : 'Edit Habit'}
                </h2>
                {modalMode === 'add' ? (
                  <AddGoalForm onClose={closeModal} />
                ) : selectedGoal ? (
                  <EditGoalForm goal={selectedGoal} onClose={closeModal} />
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
