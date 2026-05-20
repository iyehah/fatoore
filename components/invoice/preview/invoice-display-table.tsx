'use client'

import { useLanguage } from '@/hooks/use-language'
import { formatCurrency, formatDate } from '@/lib/invoice-utils'
import type { Invoice, InvoiceDisplayTable } from '@/types/invoice'
import { cn } from '@/lib/utils'

interface InvoiceDisplayTableProps {
  table: InvoiceDisplayTable
  invoice: Partial<Invoice>
}

function formatCell(
  key: string,
  value: string | number,
  currency: string,
): string | number {
  if (
    key === 'unitPrice' ||
    key === 'total' ||
    key === 'amount' ||
    key === 'paid' ||
    key === 'rate'
  ) {
    return formatCurrency(Number(value), currency)
  }
  if (key === 'start' || key === 'next' || key === 'dueDate') {
    const s = String(value)
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return formatDate(s)
    return s
  }
  if (key === 'cycle') {
    return String(value)
  }
  return value
}

export function InvoiceDisplayTableView({ table, invoice }: InvoiceDisplayTableProps) {
  const { t } = useLanguage()
  const currency = invoice.currency ?? 'MRU'

  return (
    <div className="invoice-table-wrap">
      {/* {table.titleKey && (
        <p className="invoice-table__caption">{t(table.titleKey)}</p>
      )} */}
      <table className="invoice-table">
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  col.align === 'center' && 'invoice-table__col-qty',
                  col.align === 'end' && 'invoice-table__col-money',
                )}
              >
                {t(col.labelKey)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {table.columns.map((col) => {
                const raw = row[col.key]
                const display =
                  col.key === 'cycle' && typeof raw === 'string'
                    ? t(`invoice.engine.cycles.${raw}`)
                    : col.key === 'status' && typeof raw === 'string'
                      ? t(`invoice.engine.installmentStatus.${raw}`)
                      : formatCell(col.key, raw ?? '', currency)
                return (
                  <td
                    key={col.key}
                    className={cn(
                      col.key === 'description' && 'invoice-table__desc',
                      col.align === 'center' && 'invoice-table__qty',
                      (col.align === 'end' || col.key === 'unitPrice' || col.key === 'total' || col.key === 'amount') &&
                        'invoice-table__money',
                    )}
                    dir={typeof display === 'number' || col.key.includes('Price') || col.key === 'amount' || col.key === 'total' ? 'ltr' : undefined}
                  >
                    {display}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
