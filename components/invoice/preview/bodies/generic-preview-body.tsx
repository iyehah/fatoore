'use client'

import type { PreviewBodyProps } from '@/lib/invoice-engine/types'
import { useLanguage } from '@/hooks/use-language'
import { InvoiceDisplayTableView } from '../invoice-display-table'
import { InvoicePreviewSide } from '../invoice-preview-side'
import { InvoicePreviewTotals } from '../invoice-preview-totals'
import { InvoiceBadge } from '../invoice-badge'
import { cn } from '@/lib/utils'

export function GenericPreviewBody({ invoice }: PreviewBodyProps) {
  const { t } = useLanguage()
  const hasSideContent = Boolean(invoice.paymentMethod || invoice.notes)
  const tables = invoice.displayTables ?? []
  const badges = invoice.badges ?? []

  return (
    <div className="invoice-doc__main">
      {badges.length > 0 && (
        <div className="invoice-badges">
          {badges.map((badge, i) => (
            <InvoiceBadge key={`${badge.labelKey}-${i}`}>{t(badge.labelKey)}</InvoiceBadge>
          ))}
        </div>
      )}
      {tables.map((table) => (
        <InvoiceDisplayTableView key={table.id} table={table} invoice={invoice} />
      ))}
      <div className={cn('invoice-bottom', !hasSideContent && 'invoice-bottom--totals-only')}>
        <InvoicePreviewSide invoice={invoice} />
        <InvoicePreviewTotals invoice={invoice} />
      </div>
    </div>
  )
}
