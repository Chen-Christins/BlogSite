import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TOKEN_KEY } from '@/api/client'

interface AuthState {
  token: string | null
  username: string | null
  setAuth: (token: string, username: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: localStorage.getItem(TOKEN_KEY),
      username: null,
      setAuth: (token, username) => {
        localStorage.setItem(TOKEN_KEY, token)
        set({ token, username })
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY)
        set({ token: null, username: null })
      },
      isAuthenticated: () => Boolean(get().token),
    }),
    {
      name: 'blogsite_auth',
      partialize: (state) => ({ token: state.token, username: state.username }),
    },
  ),
)
