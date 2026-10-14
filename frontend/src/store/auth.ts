import { create } from 'zustand'
import { authApi } from '@/lib/auth'
import type { Credentials, RegisterPayload, User } from '@/types/auth'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  bootstrap: () => Promise<void>
  login: (credentials: Credentials) => Promise<User>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => Promise<void>
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  setUser: (user) => set({ user }),

  bootstrap: async () => {
    set({ loading: true })
    try {
      const user = await authApi.me()
      set({ user })
    } catch {
      set({ user: null })
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  login: async (credentials) => {
    const user = await authApi.login(credentials)
    set({ user })
    return user
  },

  register: async (payload) => {
    const user = await authApi.register(payload)
    set({ user })
    return user
  },

  logout: async () => {
    try {
      await authApi.logout()
    } finally {
      set({ user: null })
    }
  },
}))
