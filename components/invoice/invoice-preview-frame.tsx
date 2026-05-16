'use client'

import { useInvoiceTemplateSize } from '@/hooks/use-invoice-template-size'
import { getInvoicePreviewMaxWidthClass } from '@/lib/invoice-preview-scale'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface InvoicePreviewFrameProps {
  children: ReactNode
  className?: string
}

export function InvoicePreviewFrame({ children, className }: InvoicePreviewFrameProps) {
  const { templateSize } = useInvoiceTemplateSize()

  return (
    <div
      className={cn(
        'mx-auto w-full overflow-hidden rounded-xl border border-border',
        getInvoicePreviewMaxWidthClass(templateSize),
        className,
      )}
    >
      {children}
    </div>
  )
}
