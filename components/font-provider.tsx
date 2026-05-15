'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { resolvedBodyFontFamily } from '@/lib/fonts/body-font-family'
import { fontRegistry, type FontKey } from '@/lib/fonts/registry'

const STORAGE_KEY = 'rim-invoice-ui-font'

const DEFAULT_FONT_KEY: FontKey = 'geist'

function isFontKey(v: string): v is FontKey {
  return Object.prototype.hasOwnProperty.call(fontRegistry, v)
}

interface FontPreferenceContextValue {
  fontKey: FontKey
  setFontKey: (key: FontKey) => void
}

const FontPreferenceContext = createContext<FontPreferenceContextValue | null>(null)

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontKey, setFontKeyState] = useState<FontKey>(DEFAULT_FONT_KEY)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const resolved = raw && isFontKey(raw) ? raw : DEFAULT_FONT_KEY
      setFontKeyState(resolved)
      document.body.style.fontFamily = resolvedBodyFontFamily(resolved)
    } catch {
      document.body.style.fontFamily = resolvedBodyFontFamily(DEFAULT_FONT_KEY)
    }
  }, [])

  const setFontKey = useCallback((key: FontKey) => {
    setFontKeyState(key)
    try {
      localStorage.setItem(STORAGE_KEY, key)
    } catch {
      console.warn('Failed to persist font preference')
    }
    document.body.style.fontFamily = resolvedBodyFontFamily(key)
  }, [])

  return (
    <FontPreferenceContext.Provider value={{ fontKey, setFontKey }}>
      {children}
    </FontPreferenceContext.Provider>
  )
}

export function useAppFontPreference(): FontPreferenceContextValue {
  const ctx = useContext(FontPreferenceContext)
  if (!ctx) {
    throw new Error('useAppFontPreference must be used within FontProvider')
  }
  return ctx
}
