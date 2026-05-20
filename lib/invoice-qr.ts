import type { Invoice } from '@/types/invoice'

/** Whether the invoice footer should render a QR code (default on). */
export function shouldShowInvoiceQr(invoice: Partial<Invoice>): boolean {
  return invoice.showQrCode !== false
}

/** Compact payload encoded in the invoice QR (readable in any QR scanner). */
export function buildInvoiceQrPayload(invoice: Partial<Invoice>): string {
  const lines: string[] = ['FATOORE']
  if (invoice.invoiceNumber) lines.push(`INV: ${invoice.invoiceNumber}`)
  if (invoice.businessName) lines.push(`FROM: ${invoice.businessName}`)
  if (invoice.clientName) lines.push(`TO: ${invoice.clientName}`)
  if (invoice.total != null) {
    const currency = invoice.currency || 'MRU'
    lines.push(`TOTAL: ${invoice.total} ${currency}`)
  }
  if (invoice.dueDate) lines.push(`DUE: ${invoice.dueDate.slice(0, 10)}`)
  if (invoice.paymentDetails) lines.push(`PAY: ${invoice.paymentDetails}`)
  return lines.join('\n')
}
