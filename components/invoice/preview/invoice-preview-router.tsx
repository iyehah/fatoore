'use client'

import type { Invoice } from '@/types/invoice'
import { getInvoiceType } from '@/types/invoice'
import type { PreviewBodyProps } from '@/lib/invoice-engine/types'
import { SalesPreviewBody } from './bodies/sales-preview-body'
import { SubscriptionPreviewBody } from './bodies/subscription-preview-body'
import { ServicePreviewBody } from './bodies/service-preview-body'
import { BookingPreviewBody } from './bodies/booking-preview-body'
import { InstallmentPreviewBody } from './bodies/installment-preview-body'

const bodies: Record<string, React.ComponentType<PreviewBodyProps>> = {
  sales: SalesPreviewBody,
  subscription: SubscriptionPreviewBody,
  service: ServicePreviewBody,
  booking: BookingPreviewBody,
  installment: InstallmentPreviewBody,
}

export function InvoicePreviewRouter({ invoice }: { invoice: Partial<Invoice> }) {
  const type = getInvoiceType(invoice)
  const Body = bodies[type] ?? SalesPreviewBody
  return <Body invoice={invoice} />
}
