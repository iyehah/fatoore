import type { InvoiceAccentState } from '@/lib/invoice-accent-color'
import type { ApiFontKey } from './parse-font'
import type { InvoiceTemplateSize } from '@/lib/invoice-preview-scale'
import type { ActiveLanguage } from '@/lib/i18n-config'
import type { InvoiceType } from '@/types/invoice'

export type InvoiceApiFormat = 'img' | 'pdf'

export interface InvoiceApiRenderOptions {
  format: InvoiceApiFormat
  lang: ActiveLanguage
  size: InvoiceTemplateSize
  font: ApiFontKey
  accent: InvoiceAccentState
  showLogo: boolean
  exportMode: boolean
  debug: boolean
}

export interface InvoiceApiBusiness {
  storeName: string
  logo?: string
  phone?: string
  address?: string
  taxId?: string
}

export interface InvoiceApiRequest {
  type: InvoiceType
  values: Record<string, unknown>
  business: InvoiceApiBusiness
  render: InvoiceApiRenderOptions
  currency: string
  /** When true (default), invoice number is generated from request fields. When false, `invoiceNumber` is required. */
  autoInvoiceNumber: boolean
  invoiceNumber?: string
  createdAt?: string
}

export const INVOICE_API_DEFAULTS = {
  type: 'sales' as InvoiceType,
  format: 'img' as InvoiceApiFormat,
  color: 'default',
  showLogo: true,
  showQrCode: true,
  lang: 'en' as ActiveLanguage,
  size: 'medium' as InvoiceTemplateSize,
  currency: 'MRU',
  autoInvoiceNumber: true,
  exportMode: false,
  debug: false,
} as const

export const MAX_QUERY_STRING_LENGTH = 12_000
export const MAX_FIELD_LENGTH = 2000
export const MAX_ITEMS = 50
