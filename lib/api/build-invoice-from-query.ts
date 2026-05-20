import { buildPreviewInvoiceFromDraft } from '@/lib/invoice-engine/normalize'
import { resolveApiInvoiceNumber } from '@/lib/api/invoice-number'
import type { Invoice } from '@/types/invoice'
import type { InvoiceApiRequest } from './invoice-query/types'

export function buildInvoiceFromQuery(request: InvoiceApiRequest): Partial<Invoice> {
  const now = new Date().toISOString()
  return buildPreviewInvoiceFromDraft(
    { invoiceType: request.type, values: request.values },
    {
      userId: 'api',
      currency: request.currency,
      invoiceNumber: resolveApiInvoiceNumber(request),
      createdAt: request.createdAt ?? now,
      business: {
        id: 'api',
        storeName: request.business.storeName,
        logo: request.business.logo,
        phone: request.business.phone,
        address: request.business.address,
        taxId: request.business.taxId,
      },
    },
  )
}
