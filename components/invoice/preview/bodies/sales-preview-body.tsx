'use client'

import { useLanguage } from '@/hooks/use-language'
import { formatCurrency } from '@/lib/invoice-utils'
import type { PreviewBodyProps } from '@/lib/invoice-engine/types'
import { InvoiceDisplayTableView } from '../invoice-display-table'
import { InvoicePreviewSide } from '../invoice-preview-side'
import { InvoicePreviewTotals } from '../invoice-preview-totals'
import { cn } from '@/lib/utils'

export function SalesPreviewBody({ invoice }: PreviewBodyProps) {
  const itemsTable = invoice.displayTables?.find((t) => t.id === 'items')
  const hasSideContent = Boolean(invoice.paymentMethod || invoice.notes)

  return (
    <div className="invoice-doc__main">
      {itemsTable ? (
        <InvoiceDisplayTableView table={itemsTable} invoice={invoice} />
      ) : (
        <LegacyItemsTable invoice={invoice} />
      )}
      <div className={cn('invoice-bottom', !hasSideContent && 'invoice-bottom--totals-only')}>
        <InvoicePreviewSide invoice={invoice} />
        <InvoicePreviewTotals invoice={invoice} />
      </div>
    </div>
  )
}

function LegacyItemsTable({ invoice }: PreviewBodyProps) {
  const { t } = useLanguage()
  const currency = invoice.currency ?? 'MRU'

  return (
    <div className="invoice-table-wrap">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>{t('invoice.description')}</th>
            <th className="invoice-table__col-qty">{t('invoice.quantity')}</th>
            <th className="invoice-table__col-money">{t('invoice.unitPrice')}</th>
            <th className="invoice-table__col-total">{t('invoice.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items?.map((item, index) => (
            <tr key={item.id || index}>
              <td className="invoice-table__desc">{item.description}</td>
              <td className="invoice-table__qty" dir="ltr">
                {item.quantity}
              </td>
              <td className="invoice-table__money" dir="ltr">
                {formatCurrency(item.unitPrice, currency)}
              </td>
              <td className="invoice-table__total" dir="ltr">
                {formatCurrency(item.total, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
