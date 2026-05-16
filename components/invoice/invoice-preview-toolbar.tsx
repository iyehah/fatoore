'use client'

import { InvoiceAccentColorPicker } from './invoice-accent-color-picker'
import { InvoiceTemplateSizeToggle } from './invoice-template-size-toggle'
import { useInvoiceTemplateSize } from '@/hooks/use-invoice-template-size'
import { cn } from '@/lib/utils'

interface InvoicePreviewToolbarProps {
  className?: string
}

export function InvoicePreviewToolbar({ className }: InvoicePreviewToolbarProps) {
  const { templateSize, setTemplateSize } = useInvoiceTemplateSize()

  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3',
        className,
      )}
    >
      <InvoiceTemplateSizeToggle value={templateSize} onChange={setTemplateSize} />
      <InvoiceAccentColorPicker />
    </div>
  )
}
