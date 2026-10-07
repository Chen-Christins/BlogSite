import { create } from 'zustand'

type Theme = 'dark' | 'light'

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const saved = localStorage.getItem('theme')
  return saved === 'light' ? 'light' : 'dark'
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeState {
  theme: Theme
  toggle: () => void
  setTheme: (t: Theme) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getInitial(),
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('theme', next)
    apply(next)
    set({ theme: next })
  },
  setTheme: (t) => {
    localStorage.setItem('theme', t)
    apply(t)
    set({ theme: t })
  },
}))
