import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { loginWithUsernamePassword } from '../utils/auth'
import type { Role, User } from '../types/domain'
import { useAppStore } from './appStore'

interface AuthState {
  token: string | null
  user: User | null
  role: Role | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      login: (username, password) => {
        const users = useAppStore.getState().users
        const result = loginWithUsernamePassword(users, username, password)
        if (!result) {
          return false
        }

        set({ token: result.token, user: result.user, role: result.user.role })
        return true
      },
      logout: () => set({ token: null, user: null, role: null }),
    }),
    {
      name: 'wishaw-auth-session',
      partialize: (state) => ({ token: state.token, user: state.user, role: state.role }),
    },
  ),
)
