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
  INVOICE_TEMPLATE_SIZE_KEY,
  isInvoiceTemplateSize,
  type InvoiceTemplateSize,
} from '@/lib/invoice-preview-scale'

interface InvoiceTemplateSizeContextValue {
  templateSize: InvoiceTemplateSize
  setTemplateSize: (size: InvoiceTemplateSize) => void
}

const InvoiceTemplateSizeContext = createContext<InvoiceTemplateSizeContextValue | null>(
  null,
)

const DEFAULT: InvoiceTemplateSize = 'medium'

export function InvoiceTemplateSizeProvider({
  children,
  initialSize,
  persist = true,
}: {
  children: ReactNode
  initialSize?: InvoiceTemplateSize
  persist?: boolean
}) {
  const [templateSize, setTemplateSizeState] = useState<InvoiceTemplateSize>(
    initialSize ?? DEFAULT,
  )

  useEffect(() => {
    if (initialSize) {
      setTemplateSizeState(initialSize)
      return
    }
    if (!persist) return
    try {
      const raw = localStorage.getItem(INVOICE_TEMPLATE_SIZE_KEY)
      if (raw && isInvoiceTemplateSize(raw)) {
        setTemplateSizeState(raw)
      }
    } catch {
      /* ignore */
    }
  }, [initialSize, persist])

  const setTemplateSize = useCallback(
    (size: InvoiceTemplateSize) => {
      setTemplateSizeState(size)
      if (!persist) return
      try {
        localStorage.setItem(INVOICE_TEMPLATE_SIZE_KEY, size)
      } catch {
        /* ignore */
      }
    },
    [persist],
  )

  const value = useMemo(
    () => ({ templateSize, setTemplateSize }),
    [templateSize, setTemplateSize],
  )

  return (
    <InvoiceTemplateSizeContext.Provider value={value}>
      {children}
    </InvoiceTemplateSizeContext.Provider>
  )
}

export function useInvoiceTemplateSize(): InvoiceTemplateSizeContextValue {
  const ctx = useContext(InvoiceTemplateSizeContext)
  if (!ctx) {
    throw new Error('useInvoiceTemplateSize must be used within InvoiceTemplateSizeProvider')
  }
  return ctx
}
