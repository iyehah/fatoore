'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ThemeSetting = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const DEFAULT_STORAGE_KEY = 'theme'

interface ThemeContextValue {
  theme: ThemeSetting
  setTheme: (theme: ThemeSetting) => void
  resolvedTheme: ResolvedTheme
  themes: ThemeSetting[]
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function systemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: ThemeSetting): ResolvedTheme {
  return theme === 'system' ? systemTheme() : theme
}

function applyDocumentTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

export interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeSetting
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  enableSystem = true,
  storageKey = DEFAULT_STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeSetting>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(defaultTheme),
  )

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as ThemeSetting | null
      const valid =
        stored === 'light' ||
        stored === 'dark' ||
        (enableSystem && stored === 'system')
      const initial = valid ? stored! : defaultTheme
      setThemeState(initial)
      const resolved = resolveTheme(initial)
      setResolvedTheme(resolved)
      applyDocumentTheme(resolved)
    } catch {
      const resolved = resolveTheme(defaultTheme)
      setResolvedTheme(resolved)
      applyDocumentTheme(resolved)
    }
  }, [defaultTheme, enableSystem, storageKey])

  useEffect(() => {
    if (!enableSystem || theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const resolved = systemTheme()
      setResolvedTheme(resolved)
      applyDocumentTheme(resolved)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme, enableSystem])

  const setTheme = useCallback(
    (next: ThemeSetting) => {
      setThemeState(next)
      try {
        localStorage.setItem(storageKey, next)
      } catch {
        /* ignore */
      }
      const resolved = resolveTheme(next)
      setResolvedTheme(resolved)
      applyDocumentTheme(resolved)
    },
    [storageKey],
  )

  const themes = useMemo(
    (): ThemeSetting[] => (enableSystem ? ['light', 'dark', 'system'] : ['light', 'dark']),
    [enableSystem],
  )

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme, themes }),
    [theme, setTheme, resolvedTheme, themes],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return {
      theme: 'dark',
      setTheme: () => {},
      resolvedTheme: 'dark',
      themes: ['light', 'dark'],
    }
  }
  return ctx
}
