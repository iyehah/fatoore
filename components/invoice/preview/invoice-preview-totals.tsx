'use client'

import { useLanguage } from '@/hooks/use-language'
import { formatCurrency } from '@/lib/invoice-utils'
import type { Invoice, InvoiceSummaryLine } from '@/types/invoice'
import { cn } from '@/lib/utils'

interface InvoicePreviewTotalsProps {
  invoice: Partial<Invoice>
}

function formatLineLabel(
  t: (key: string, params?: Record<string, string | number>) => string,
  line: InvoiceSummaryLine,
) {
  if (line.labelParams) {
    return t(line.labelKey, line.labelParams as Record<string, string | number>)
  }
  return t(line.labelKey)
}

export function InvoicePreviewTotals({ invoice }: InvoicePreviewTotalsProps) {
  const { t } = useLanguage()
  const currency = invoice.currency ?? 'MRU'
  const hasTax = Boolean(invoice.taxAmount && invoice.taxAmount > 0)
  const hasDiscount = Boolean(invoice.discount && invoice.discount > 0)
  const useSummary = Boolean(invoice.summaryLines?.length)

  return (
    <aside className="invoice-totals">
      {useSummary ? (
        invoice.summaryLines!.map((line, index) => {
          if (line.amount === undefined) {
            return (
              <div
                key={`${line.labelKey}-${index}`}
                className="invoice-totals__row invoice-totals__row--muted"
              >
                <span>{formatLineLabel(t, line)}</span>
              </div>
            )
          }
          return (
            <TotalsRow
              key={`${line.labelKey}-${index}`}
              label={formatLineLabel(t, line)}
              amount={line.amount}
              currency={currency}
              variant={line.variant}
            />
          )
        })
      ) : (
        <>
          <TotalsRow label={t('invoice.subtotal')} amount={invoice.subtotal ?? 0} currency={currency} />
          {hasTax && (
            <div className="invoice-totals__row">
              <span>
                {t('invoice.tax')} ({invoice.taxRate}%)
              </span>
              <span dir="ltr">{formatCurrency(invoice.taxAmount!, currency)}</span>
            </div>
          )}
          {hasDiscount && (
            <TotalsRow
              label={t('invoice.discount')}
              amount={invoice.discount!}
              currency={currency}
              variant="discount"
              prefix="-"
            />
          )}
        </>
      )}
      <hr className="invoice-totals__divider" />
      <div className="invoice-totals__grand">
        <span className="invoice-totals__grand-label">{t('invoice.total')}</span>
        <span className="invoice-totals__grand-value" dir="ltr">
          {formatCurrency(invoice.total || 0, currency)}
        </span>
      </div>
    </aside>
  )
}

function TotalsRow({
  label,
  amount,
  currency,
  variant,
  prefix,
}: {
  label: string
  amount: number
  currency: string
  variant?: string
  prefix?: string
}) {
  return (
    <div
      className={cn(
        'invoice-totals__row',
        variant === 'discount' && 'invoice-totals__row--discount',
      )}
    >
      <span>{label}</span>
      <span dir="ltr">
        {prefix}
        {formatCurrency(amount, currency)}
      </span>
    </div>
  )
}
