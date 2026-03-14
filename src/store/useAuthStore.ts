import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  passwordHash: string
}

interface AuthStore {
  users: User[]
  currentUserId: string | null
  login(name: string, password: string): Promise<'ok' | 'wrong-password' | 'not-found'>
  register(name: string, password: string): Promise<'ok' | 'taken'>
  logout(): void
}

// Pure-JS fallback for non-secure contexts (HTTP) where crypto.subtle is unavailable
function djb2Hash(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h, 33) ^ str.charCodeAt(i)
  }
  const hex = (h >>> 0).toString(16).padStart(8, '0')
  // Repeat to match SHA-256 length (64 hex chars) for format consistency
  return hex.repeat(8)
}

async function hashPassword(pw: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  return djb2Hash(pw)
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      login: async (name, password) => {
        const { users } = get()
        const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase())
        if (!user) return 'not-found'
        const hash = await hashPassword(password)
        if (hash !== user.passwordHash) return 'wrong-password'
        set({ currentUserId: user.id })
        return 'ok'
      },

      register: async (name, password) => {
        const { users } = get()
        if (users.some((u) => u.name.toLowerCase() === name.toLowerCase())) return 'taken'
        const id =
          typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
                const r = (Math.random() * 16) | 0
                return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
              })
        const passwordHash = await hashPassword(password)
        set((state) => ({
          users: [...state.users, { id, name, passwordHash }],
          currentUserId: id,
        }))
        return 'ok'
      },

      logout: () => set({ currentUserId: null }),
    }),
    { name: 'rhythm-auth-v1' }
  )
)
