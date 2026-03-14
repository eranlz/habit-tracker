import { useState } from 'react'

const AUTHED_KEY = 'access-authed'

function check(username: string, password: string): boolean {
  return username === 'Eran' && password === '3775'
}

export function useAccessGranted(): boolean {
  return !!localStorage.getItem(AUTHED_KEY)
}

export function AccessGate({ onGranted }: { onGranted: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (check(username, password)) {
      localStorage.setItem(AUTHED_KEY, '1')
      onGranted()
    } else {
      setError(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-white text-center mb-2">Rhythm</h1>
        <input
          type="text"
          placeholder="Username"
          autoCapitalize="none"
          autoCorrect="off"
          value={username}
          onChange={(e) => { setUsername(e.target.value); setError(false) }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false) }}
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-accent"
        />
        {error && <p className="text-red-400 text-sm text-center">Incorrect credentials</p>}
        <button
          type="submit"
          className="bg-accent hover:bg-accent/80 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Sign in
        </button>
      </form>
    </div>
  )
}
