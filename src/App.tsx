import { useState } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGoalStore } from './store/useGoalStore'
import { useAuthStore } from './store/useAuthStore'
import { useRollover } from './hooks/useRollover'
import { useUserGoals } from './hooks/useUserGoals'
import { GoalList } from './components/GoalList'
import { UpdateModal } from './components/UpdateModal'
import { AddGoalForm } from './components/AddGoalForm'
import { EditGoalForm } from './components/EditGoalForm'
import { LoginDialog } from './components/LoginDialog'
import { HelpCard } from './components/HelpCard'
import { HistoryModal } from './components/HistoryModal'
import { MenuSheet } from './components/MenuSheet'
import type { Goal } from './types'

type ModalMode = 'none' | 'add' | 'edit' | 'update' | 'help' | 'history' | 'menu'

export default function App() {
  useRollover()

  const currentUserId = useAuthStore((s) => s.currentUserId)
  const { users } = useAuthStore()
  const currentUser = users.find((u) => u.id === currentUserId)

  const { goals } = useUserGoals()
  // Keep deleteGoal available via store for GoalList / other components
  useGoalStore()

  const [modalMode, setModalMode] = useState<ModalMode>('none')
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  if (!currentUserId) {
    return <LoginDialog />
  }

  const openUpdate = (goal: Goal) => {
    setSelectedGoal(goal)
    setModalMode('update')
  }

  const openEdit = (goal: Goal) => {
    setSelectedGoal(goal)
    setModalMode('edit')
  }

  const openHistory = (goal: Goal) => {
    setSelectedGoal(goal)
    setModalMode('history')
  }

  const openAdd = () => {
    setSelectedGoal(null)
    setModalMode('add')
  }

  const closeModal = () => {
    setModalMode('none')
    setSelectedGoal(null)
  }

  const isSheetOpen = modalMode === 'add' || modalMode === 'edit' || modalMode === 'help'
  const userName = currentUser?.name ?? ''

  return (
    <div className="min-h-screen bg-[#0f0f13]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Nexus</h1>
            <p className="text-xs text-white/40">
              {goals.length} {goals.length === 1 ? 'habit' : 'habits'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalMode('menu')}
              title="Menu"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>
            <button
              onClick={openAdd}
              className="flex items-center gap-1.5 bg-accent hover:bg-accent/80 text-white text-sm font-semibold px-3 py-2 rounded-xl transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>
      </header>

      {/* Goal list */}
      <main className="max-w-lg mx-auto px-0 pt-4 flex flex-col" style={{ minHeight: 'calc(100dvh - 73px)' }}>
        <GoalList
          goals={goals}
          onUpdate={openUpdate}
          onEdit={openEdit}
          onHistory={openHistory}
          onAdd={openAdd}
        />
        <div className="flex justify-center mt-auto pb-safe pt-4">
          <img src="/polychrome.png" alt="Polychrome" className="h-12 opacity-30 pr-5" />
        </div>
      </main>

      {/* Update modal */}
      <UpdateModal
        goal={modalMode === 'update' ? selectedGoal : null}
        onClose={closeModal}
      />

      {/* History modal */}
      <HistoryModal
        goal={modalMode === 'history' ? selectedGoal : null}
        onClose={closeModal}
      />

      {/* Menu sheet */}
      <MenuSheet
        isOpen={modalMode === 'menu'}
        userName={userName}
        currentGoalCount={goals.length}
        onClose={closeModal}
        onHelp={() => setModalMode('help')}
      />

      {/* Add / Edit / Help bottom sheet */}
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
                  {modalMode === 'add' ? 'New Habit' : modalMode === 'edit' ? 'Edit Habit' : 'How it works'}
                </h2>
                {modalMode === 'add' ? (
                  <AddGoalForm onClose={closeModal} />
                ) : modalMode === 'edit' && selectedGoal ? (
                  <EditGoalForm goal={selectedGoal} onClose={closeModal} />
                ) : modalMode === 'help' ? (
                  <HelpCard />
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
