import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Download, Upload, LogOut } from 'lucide-react'
import { useGoalStore } from '../store/useGoalStore'
import { useAuthStore } from '../store/useAuthStore'
import type { Goal } from '../types'

interface Props {
  isOpen: boolean
  userName: string
  currentGoalCount: number
  onClose: () => void
  onHelp: () => void
}

interface ImportPayload {
  version: number
  goals: Goal[]
}

function isValidGoal(g: unknown): g is Goal {
  if (typeof g !== 'object' || g === null) return false
  const obj = g as Record<string, unknown>
  return typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.type === 'string'
}

function parseImport(raw: string): ImportPayload | string {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return 'Invalid JSON file.'
  }
  if (typeof parsed !== 'object' || parsed === null) return 'Invalid file format.'
  const obj = parsed as Record<string, unknown>
  if (!Array.isArray(obj.goals)) return 'Missing "goals" array in file.'
  if (!obj.goals.every(isValidGoal)) return 'Some goals are missing required fields (id, name, type).'
  return { version: typeof obj.version === 'number' ? obj.version : 1, goals: obj.goals }
}

export function MenuSheet({ isOpen, userName, currentGoalCount, onClose, onHelp }: Props) {
  const { userData, importGoals } = useGoalStore()
  const { currentUserId, logout } = useAuthStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingGoals, setPendingGoals] = useState<Goal[] | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  function handleExport() {
    const goals = currentUserId ? (userData[currentUserId]?.goals ?? []) : []
    const payload = { version: 1, exportedAt: new Date().toISOString(), goals }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rhythm-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImportError(null)
    setPendingGoals(null)
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = parseImport(ev.target?.result as string)
      if (typeof result === 'string') {
        setImportError(result)
      } else {
        setPendingGoals(result.goals)
      }
    }
    reader.readAsText(file)
    // Reset input so the same file can be re-selected after cancel
    e.target.value = ''
  }

  function handleImportConfirm() {
    if (pendingGoals) {
      importGoals(pendingGoals)
      setPendingGoals(null)
      onClose()
    }
  }

  function handleImportCancel() {
    setPendingGoals(null)
    setImportError(null)
  }

  function handleLogout() {
    logout()
    onClose()
  }

  function handleClose() {
    setPendingGoals(null)
    setImportError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40"
            onClick={handleClose}
          />
          <motion.div
            key="menu-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-surface border-t border-white/10 pb-safe"
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-4" />

            {/* Username */}
            <div className="px-5 pb-3">
              <p className="text-sm text-white/50">Signed in as <span className="text-white/80 font-medium">{userName}</span></p>
            </div>

            <div className="border-t border-white/10 mx-5" />

            {/* Actions */}
            <div className="px-5 py-2">
              <button
                onClick={() => { handleClose(); onHelp() }}
                className="w-full flex items-center gap-3 py-3 text-white/80 hover:text-white transition-colors"
              >
                <BookOpen size={18} className="text-white/50" />
                <span className="text-sm font-medium">How it works</span>
              </button>

              <button
                onClick={handleExport}
                className="w-full flex items-center gap-3 py-3 text-white/80 hover:text-white transition-colors"
              >
                <Download size={18} className="text-white/50" />
                <span className="text-sm font-medium">Export data</span>
              </button>

              {/* Import — phase 1 */}
              {!pendingGoals && (
                <button
                  onClick={() => { setImportError(null); fileInputRef.current?.click() }}
                  className="w-full flex items-center gap-3 py-3 text-white/80 hover:text-white transition-colors"
                >
                  <Upload size={18} className="text-white/50" />
                  <span className="text-sm font-medium">Import data</span>
                </button>
              )}

              {/* Import — phase 2 (confirm) */}
              {pendingGoals && (
                <div className="py-3">
                  <div className="flex items-start gap-3 mb-3">
                    <Upload size={18} className="text-white/50 mt-0.5 shrink-0" />
                    <p className="text-sm text-white/80">
                      Import <span className="text-white font-semibold">{pendingGoals.length}</span> habit{pendingGoals.length !== 1 ? 's' : ''}?
                      This will replace your <span className="text-white font-semibold">{currentGoalCount}</span> current habit{currentGoalCount !== 1 ? 's' : ''}.
                    </p>
                  </div>
                  <div className="flex gap-2 pl-7">
                    <button
                      onClick={handleImportCancel}
                      className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/70 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImportConfirm}
                      className="flex-1 py-2 rounded-xl bg-accent hover:bg-accent/80 text-white text-sm font-semibold transition-colors"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              )}

              {importError && (
                <p className="text-xs text-danger pl-7 pb-2">{importError}</p>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="border-t border-white/10 mx-5" />

            {/* Logout */}
            <div className="px-5 py-2 pb-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 py-3 text-danger hover:text-danger/80 transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
