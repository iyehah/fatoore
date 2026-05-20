import type { InvoiceApiRequest } from './invoice-query/types'

/** Stable 4-digit suffix from a string (same on server and client). */
function stableSuffix(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return (Math.abs(h) % 10000).toString().padStart(4, '0')
}

/** Deterministic invoice number for API / playground (avoids SSR hydration mismatch). */
export function generateDeterministicInvoiceNumber(
  seed: string,
  createdAt?: string,
): string {
  const date = createdAt ? new Date(createdAt) : new Date()
  const year = date.getUTCFullYear().toString().slice(-2)
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const day = date.getUTCDate().toString().padStart(2, '0')
  return `INV-${year}${month}${day}-${stableSuffix(seed)}`
}

export function buildApiInvoiceNumberSeed(
  request: Pick<InvoiceApiRequest, 'type' | 'values' | 'business' | 'createdAt' | 'currency'>,
): string {
  return JSON.stringify({
    type: request.type,
    currency: request.currency,
    createdAt: request.createdAt ?? '',
    businessName: request.business.storeName,
    clientName: request.values.clientName,
    clientPhone: request.values.clientPhone,
  })
}

export function resolveApiInvoiceNumber(request: InvoiceApiRequest): string {
  const auto = request.autoInvoiceNumber !== false
  if (!auto) {
    return request.invoiceNumber!.trim()
  }
  return generateDeterministicInvoiceNumber(
    buildApiInvoiceNumberSeed(request),
    request.createdAt,
  )
}
