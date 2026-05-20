import { generateInvoiceNumber } from '@/lib/invoice-utils'
import type {
  BookingInvoiceData,
  InstallmentInvoiceData,
  Invoice,
  InvoiceDraft,
  InvoiceItem,
  InvoiceType,
  InvoiceTypeData,
  SalesInvoiceData,
  ServiceInvoiceData,
  SubscriptionInvoiceData,
} from '@/types/invoice'
import { calculateInvoice } from './calculate'
import type { BuildInvoiceContext } from './types'
import { parseBookingValues } from './plugins/booking'
import { parseInstallmentValues, resolveInstallmentSchedule } from './plugins/installment'
import { coerceCustomerFields } from './customer-fields'
import { parseSalesValues } from './plugins/sales'
import { parseServiceValues } from './plugins/service'
import { parseSubscriptionValues } from './plugins/subscription'

export interface BuildInvoiceOptions {
  /** When false (live preview), use lenient parsing. Default true for save. */
  strict?: boolean
}

function buildTypeData(
  type: InvoiceType,
  values: Record<string, unknown>,
  strict: boolean,
): InvoiceTypeData {
  switch (type) {
    case 'sales': {
      const v = parseSalesValues(values, strict)
      return {
        invoiceType: 'sales',
        typeData: {
          items: v.items,
          shipping: v.shipping,
        } satisfies SalesInvoiceData,
      }
    }
    case 'subscription': {
      const v = parseSubscriptionValues(values, strict)
      return {
        invoiceType: 'subscription',
        typeData: {
          planName: v.planName,
          billingCycle: v.billingCycle,
          startDate: v.startDate,
          endDate: v.endDate,
          autoRenew: v.autoRenew,
          pricePerCycle: v.pricePerCycle,
        } satisfies SubscriptionInvoiceData,
      }
    }
    case 'service': {
      const v = parseServiceValues(values, strict)
      return {
        invoiceType: 'service',
        typeData: {
          serviceDescription: v.serviceDescription,
          pricingModel: v.pricingModel,
          fixedAmount: v.fixedAmount,
          hours: v.hours,
          hourlyRate: v.hourlyRate,
          milestones: v.milestones?.map((m, i) => ({ id: `ms-${i}`, ...m })),
        } satisfies ServiceInvoiceData,
      }
    }
    case 'booking': {
      const v = parseBookingValues(values, strict)
      return {
        invoiceType: 'booking',
        typeData: {
          bookingDate: v.bookingDate,
          bookingTime: v.bookingTime,
          duration: v.duration,
          serviceType: v.serviceType,
          deposit: v.deposit,
          totalPrice: v.totalPrice,
          bookingStatus: v.bookingStatus,
        } satisfies BookingInvoiceData,
      }
    }
    case 'installment': {
      const v = parseInstallmentValues(values, strict)
      const schedule = resolveInstallmentSchedule(values, strict)

      return {
        invoiceType: 'installment',
        typeData: {
          totalAmount: v.totalAmount,
          scheduleMode: v.scheduleMode,
          installmentCount: v.installmentCount,
          interestOrFees: v.interestOrFees,
          paidAmount: v.paidAmount,
          installments: schedule,
        } satisfies InstallmentInvoiceData,
      }
    }
  }
}

function itemsForInvoice(
  type: InvoiceType,
  values: Record<string, unknown>,
  strict: boolean,
): InvoiceItem[] {
  if (type === 'sales') {
    const v = parseSalesValues(values, strict)
    return v.items.map((item, index) => ({
      id: `item-${index}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.quantity * item.unitPrice,
    }))
  }
  return []
}

export function buildInvoiceFromDraft(
  draft: InvoiceDraft,
  ctx: BuildInvoiceContext,
  existing?: Partial<Invoice>,
  options: BuildInvoiceOptions = {},
): Invoice {
  const strict = options.strict !== false
  const calc = calculateInvoice(draft.invoiceType, draft.values)
  const typePayload = buildTypeData(draft.invoiceType, draft.values, strict)
  const v = draft.values
  const customer = coerceCustomerFields(v)

  const base = {
    id: existing?.id ?? '',
    invoiceNumber: existing?.invoiceNumber ?? ctx.invoiceNumber ?? generateInvoiceNumber(),
    createdAt: existing?.createdAt ?? ctx.createdAt ?? new Date().toISOString(),
    dueDate: (v.dueDate as string) || existing?.dueDate,
    status: existing?.status ?? 'draft',
    businessProfileId: ctx.business.id,
    businessName: ctx.business.storeName,
    businessLogo: ctx.business.logo,
    businessPhone: ctx.business.phone,
    businessAddress: ctx.business.address,
    businessTaxId: ctx.business.taxId,
    clientName: String(v.clientName ?? ''),
    clientPhone: v.clientPhone as string | undefined,
    clientAddress: v.clientAddress as string | undefined,
    clientGender: customer.clientGender,
    items: itemsForInvoice(draft.invoiceType, draft.values, strict),
    subtotal: calc.subtotal,
    taxRate: calc.taxRate,
    taxAmount: calc.taxAmount,
    discount: calc.discount,
    shipping: calc.shipping,
    total: calc.total,
    paymentMethod: v.paymentMethod as string | undefined,
    paymentDetails: v.paymentDetails as string | undefined,
    notes: v.notes as string | undefined,
    userId: ctx.userId,
    currency: ctx.currency ?? 'MRU',
    summaryLines: calc.summaryLines,
    displayTables: calc.displayTables,
    badges: calc.badges,
  }

  return { ...base, ...typePayload } as Invoice
}

export function buildPreviewInvoiceFromDraft(
  draft: InvoiceDraft,
  ctx: Omit<BuildInvoiceContext, 'userId'> & { userId?: string },
): Partial<Invoice> {
  return buildInvoiceFromDraft(
    draft,
    {
      ...ctx,
      userId: ctx.userId ?? 'preview',
    },
    undefined,
    { strict: false },
  )
}
