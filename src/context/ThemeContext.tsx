import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useState } from 'react'

export type ThemeSetting = 'light' | 'dark' | 'system'

export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: ThemeSetting
  resolvedTheme: ResolvedTheme
  setTheme(theme: ThemeSetting): void
}

interface ThemeProviderProps {
  children: ReactNode
}

const storageKey = 'theme'

const ThemeContext = createContext<ThemeContextValue | null>(null)

function isThemeSetting(value: string | null): value is ThemeSetting {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readStoredTheme(): ThemeSetting {
  const stored = localStorage.getItem(storageKey)

  return isThemeSetting(stored) ? stored : 'system'
}

function readSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeSetting>(readStoredTheme)
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(readSystemTheme)

  const resolvedTheme: ResolvedTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme === 'dark' ? 'dark' : 'light')
  }, [resolvedTheme])

  useEffect(() => {
    if (theme !== 'system') {
      return
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  function setTheme(next: ThemeSetting) {
    setThemeState(next)
    localStorage.setItem(storageKey, next)

    if (next === 'system') {
      setSystemTheme(readSystemTheme())
    }
  }

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
