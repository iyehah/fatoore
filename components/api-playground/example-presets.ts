import type { InvoiceType } from '@/types/invoice'

/** Shared customer + address for every playground example and type switch. */
export const PLAYGROUND_SHARED_FIELDS: Record<string, string> = {
  clientName: 'Iyehah Hacen',
  clientPhone: '12345678',
  clientAddress: 'Nouakchott',
  businessAddress: 'Tganent - tidjikja',
}

const today = () => new Date().toISOString().slice(0, 10)

/** Render / export options kept when switching invoice type. */
export const PLAYGROUND_PRESERVE_KEYS = [
  'format',
  'lang',
  'size',
  'font',
  'color',
  'showLogo',
  'showQrCode',
  'applyBorders',
  'exportMode',
  'autoInvoiceNumber',
  'createdAt',
  'invoiceNumber',
  'businessLogo',
  'businessPhone',
  'businessTaxId',
] as const

export const PLAYGROUND_RENDER_DEFAULTS: Record<string, string> = {
  format: 'img',
  lang: 'en',
  size: 'm',
  font: 'geist',
  color: 'default',
  showLogo: 'true',
  showQrCode: 'true',
  applyBorders: 'false',
  exportMode: 'true',
  autoInvoiceNumber: 'true',
  pricingModel: 'fixed',
  scheduleMode: 'count',
  billingCycle: 'monthly',
  autoRenew: 'true',
  bookingStatus: 'confirmed',
}

const TYPE_BUSINESS_NAMES: Record<InvoiceType, string> = {
  sales: 'Boutique Nomade',
  subscription: 'Cloud Services MR',
  service: 'Design Bureau',
  booking: 'Salon Premium',
  installment: 'Electro Shop',
}

function typeSpecificParams(type: InvoiceType): Record<string, string> {
  const businessName = TYPE_BUSINESS_NAMES[type]
  switch (type) {
    case 'sales':
      return {
        type: 'sales',
        businessName,
        items: JSON.stringify([
          { description: 'Handmade rug', quantity: 1, unitPrice: 15000 },
          { description: 'Delivery', quantity: 1, unitPrice: 500 },
        ]),
        taxRate: '0',
        discount: '0',
        currency: 'MRU',
        paymentMethod: 'bankily',
        paymentDetails: 'Tel: 46 00 00 00',
        shipping: '0',
      }
    case 'subscription':
      return {
        type: 'subscription',
        businessName,
        planName: 'Pro Plan',
        billingCycle: 'monthly',
        pricePerCycle: '2500',
        startDate: today(),
        autoRenew: 'true',
        taxRate: '0',
        discount: '0',
      }
    case 'service':
      return {
        type: 'service',
        businessName,
        serviceDescription: 'Brand identity package',
        pricingModel: 'fixed',
        fixedAmount: '45000',
        taxRate: '0',
        discount: '0',
      }
    case 'booking':
      return {
        type: 'booking',
        businessName,
        bookingDate: today(),
        bookingTime: '14:30',
        duration: '2h',
        totalPrice: '3000',
        deposit: '1000',
        bookingStatus: 'confirmed',
        serviceType: 'Consultation',
      }
    case 'installment':
      return {
        type: 'installment',
        businessName,
        totalAmount: '120000',
        scheduleMode: 'count',
        installmentCount: '4',
        installmentInterval: 'month',
        paidAmount: '30000',
        interestOrFees: '0',
      }
    default:
      return { type, businessName }
  }
}

/** Example query params for a given invoice type (includes shared customer/address). */
export function getTypeExampleParams(type: InvoiceType): Record<string, string> {
  return {
    ...PLAYGROUND_SHARED_FIELDS,
    ...typeSpecificParams(type),
  }
}

/** Merge type example with current render options (used when InvoiceTypeSelector changes). */
export function mergePlaygroundStateForType(
  current: Record<string, string>,
  type: InvoiceType,
): Record<string, string> {
  const preserved: Record<string, string> = {}
  for (const key of PLAYGROUND_PRESERVE_KEYS) {
    const v = current[key]
    if (v != null && v !== '') preserved[key] = v
  }
  const merged = {
    ...PLAYGROUND_RENDER_DEFAULTS,
    ...getTypeExampleParams(type),
    ...preserved,
    type,
  }
  if (merged.autoInvoiceNumber !== 'false') {
    delete merged.invoiceNumber
  }
  if (!merged.createdAt) {
    merged.createdAt = `${today()}T12:00:00.000Z`
  }
  return merged
}

export function defaultPlaygroundFormState(): Record<string, string> {
  return mergePlaygroundStateForType({}, 'sales')
}
