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
import {
  buildInvoiceAccentCssVars,
  DEFAULT_INVOICE_ACCENT,
  INVOICE_ACCENT_STORAGE_KEY,
  parseStoredAccent,
  type InvoiceAccentPreset,
  type InvoiceAccentState,
} from '@/lib/invoice-accent-color'

interface InvoiceAccentColorContextValue {
  preset: InvoiceAccentPreset
  customHex: string
  applyToBorders: boolean
  accentCssVars: Record<string, string>
  accentClassName: string
  setPreset: (preset: InvoiceAccentPreset) => void
  setCustomHex: (customHex: string) => void
  setApplyToBorders: (applyToBorders: boolean) => void
}

const InvoiceAccentColorContext = createContext<InvoiceAccentColorContextValue | null>(
  null,
)

function persist(state: InvoiceAccentState) {
  try {
    localStorage.setItem(INVOICE_ACCENT_STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function InvoiceAccentColorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InvoiceAccentState>(DEFAULT_INVOICE_ACCENT)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVOICE_ACCENT_STORAGE_KEY)
      setState(parseStoredAccent(raw))
    } catch {
      /* ignore */
    }
  }, [])

  const update = useCallback((patch: Partial<InvoiceAccentState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const setPreset = useCallback(
    (preset: InvoiceAccentPreset) => update({ preset }),
    [update],
  )

  const setCustomHex = useCallback(
    (customHex: string) => update({ customHex, preset: 'custom' }),
    [update],
  )

  const setApplyToBorders = useCallback(
    (applyToBorders: boolean) => update({ applyToBorders }),
    [update],
  )

  const { cssVars: accentCssVars, className: accentClassName } = useMemo(
    () => buildInvoiceAccentCssVars(state),
    [state],
  )

  const value = useMemo(
    (): InvoiceAccentColorContextValue => ({
      preset: state.preset,
      customHex: state.customHex,
      applyToBorders: state.applyToBorders,
      accentCssVars,
      accentClassName,
      setPreset,
      setCustomHex,
      setApplyToBorders,
    }),
    [
      state,
      accentCssVars,
      accentClassName,
      setPreset,
      setCustomHex,
      setApplyToBorders,
    ],
  )

  return (
    <InvoiceAccentColorContext.Provider value={value}>
      {children}
    </InvoiceAccentColorContext.Provider>
  )
}

export function useInvoiceAccentColor(): InvoiceAccentColorContextValue {
  const ctx = useContext(InvoiceAccentColorContext)
  if (!ctx) {
    throw new Error('useInvoiceAccentColor must be used within InvoiceAccentColorProvider')
  }
  return ctx
}
