import { useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

export function LoginDialog() {
  const { login, register } = useAuthStore()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!name.trim() || !password) return
    setLoading(true)
    setError(null)
    try {
      const result = await login(name.trim(), password)
      if (result === 'not-found') setError('User not found')
      else if (result === 'wrong-password') setError('Wrong password')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!name.trim() || !password) return
    setLoading(true)
    setError(null)
    try {
      const result = await register(name.trim(), password)
      if (result === 'taken') setError('Name already taken')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSignIn()
  }

  return (
    <div className="fixed inset-0 bg-[#0f0f13] z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-card border border-white/10 rounded-2xl p-8 flex flex-col gap-6">
        <div className="text-center">
<h1 className="text-2xl font-bold text-white tracking-tight">Nexus</h1>
          <p className="text-white/40 text-sm mt-1">Your personal habit tracker</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            autoComplete="username"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null) }}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-accent"
          />
          {error && (
            <p className="text-danger text-sm text-center">{error}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSignIn}
            disabled={loading || !name.trim() || !password}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent/80 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
          <button
            onClick={handleCreateAccount}
            disabled={loading || !name.trim() || !password}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
