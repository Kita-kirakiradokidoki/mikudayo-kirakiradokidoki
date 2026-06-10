import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { SITE_CONFIG } from './site.config'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'nagi-blog-theme'

const cssVarMap: Record<string, keyof typeof SITE_CONFIG.colors.dark> = {
  '--color-ink': 'ink',
  '--color-ink-2': 'ink2',
  '--color-paper': 'paper',
  '--color-dim': 'dim',
  '--color-accent': 'accent',
  '--color-amber': 'amber',
  '--color-line': 'line',
  '--grid-line': 'gridLine',
  '--stroke-faint': 'strokeFaint',
}

function applyColors(theme: Theme) {
  const colors = SITE_CONFIG.colors[theme]
  const root = document.documentElement
  for (const [cssVar, key] of Object.entries(cssVarMap)) {
    root.style.setProperty(cssVar, colors[key])
  }
  root.dataset.theme = theme
  root.style.colorScheme = theme === 'dark' ? 'dark' : 'light'
}

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
    }
    applyColors(theme)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
