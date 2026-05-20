'use client'

import {
  Calendar,
  CalendarClock,
  Layers,
  RefreshCw,
  ShoppingCart,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'
import { listInvoiceTypes } from '@/lib/invoice-engine/registry'
import type { InvoiceType } from '@/types/invoice'
import { cn } from '@/lib/utils'

const iconMap: Record<string, LucideIcon> = {
  ShoppingCart,
  RefreshCw,
  Wrench,
  Calendar,
  CalendarClock,
  Layers,
}

interface InvoiceTypeSelectorProps {
  value: InvoiceType | null
  onChange: (type: InvoiceType) => void
}

export function InvoiceTypeSelector({ value, onChange }: InvoiceTypeSelectorProps) {
  const { t } = useLanguage()
  const types = listInvoiceTypes()

  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t('invoice.engine.selectType')}
      </span>
      <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-1 pt-1.5">
        {types.map((plugin) => {
          const Icon = iconMap[plugin.icon] ?? ShoppingCart
          const selected = value === plugin.type
          return (
            <button
              key={plugin.type}
              type="button"
              onClick={() => onChange(plugin.type)}
              title={t(plugin.descriptionKey)}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                selected
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border/80 bg-muted/40 text-foreground hover:border-primary/40 hover:bg-muted',
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" />
              <span>{t(plugin.labelKey)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
