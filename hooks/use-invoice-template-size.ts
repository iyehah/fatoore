'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  INVOICE_TEMPLATE_SIZE_KEY,
  isInvoiceTemplateSize,
  type InvoiceTemplateSize,
} from '@/lib/invoice-preview-scale'

const DEFAULT: InvoiceTemplateSize = 'medium'

export function useInvoiceTemplateSize() {
  const [templateSize, setTemplateSizeState] = useState<InvoiceTemplateSize>(DEFAULT)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INVOICE_TEMPLATE_SIZE_KEY)
      if (raw && isInvoiceTemplateSize(raw)) {
        setTemplateSizeState(raw)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const setTemplateSize = useCallback((size: InvoiceTemplateSize) => {
    setTemplateSizeState(size)
    try {
      localStorage.setItem(INVOICE_TEMPLATE_SIZE_KEY, size)
    } catch {
      /* ignore */
    }
  }, [])

  return { templateSize, setTemplateSize }
}
