'use client'

import { useLanguage } from '@/hooks/use-language'
import type { InvoiceTemplateSize } from '@/lib/invoice-preview-scale'
import { cn } from '@/lib/utils'

interface InvoiceTemplateSizeToggleProps {
  value: InvoiceTemplateSize
  onChange: (size: InvoiceTemplateSize) => void
  className?: string
}

const SIZES: InvoiceTemplateSize[] = ['small', 'medium', 'large']

export function InvoiceTemplateSizeToggle({
  value,
  onChange,
  className,
}: InvoiceTemplateSizeToggleProps) {
  const { t } = useLanguage()

  const labels: Record<InvoiceTemplateSize, string> = {
    small: t('invoice.templateSmall'),
    medium: t('invoice.templateMedium'),
    large: t('invoice.templateLarge'),
  }

  return (
    <div
      role="group"
      aria-label={t('invoice.templateSize')}
      className={cn('inline-flex rounded-lg border border-border bg-background p-0.5', className)}
    >
      {SIZES.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => onChange(size)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            value === size
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {labels[size]}
        </button>
      ))}
    </div>
  )
}
