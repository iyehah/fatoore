import { isActiveLanguage, type ActiveLanguage } from '@/lib/i18n-config'
import { isInvoiceTemplateSize, type InvoiceTemplateSize } from '@/lib/invoice-preview-scale'
import { INVOICE_API_DEFAULTS } from './types'

const SIZE_ALIASES: Record<string, InvoiceTemplateSize> = {
  s: 'small',
  small: 'small',
  ticket: 'small',
  m: 'medium',
  medium: 'medium',
  standard: 'medium',
  l: 'large',
  large: 'large',
  full: 'large',
}

export function parseTemplateSize(value: string | null | undefined): InvoiceTemplateSize {
  if (value == null || value === '') return INVOICE_API_DEFAULTS.size
  const key = value.trim().toLowerCase()
  const mapped = SIZE_ALIASES[key]
  if (mapped) return mapped
  if (isInvoiceTemplateSize(key)) return key
  return INVOICE_API_DEFAULTS.size
}

export function parseLang(value: string | null | undefined): ActiveLanguage {
  if (value == null || value === '') return INVOICE_API_DEFAULTS.lang
  const key = value.trim().toLowerCase()
  if (isActiveLanguage(key)) return key
  return INVOICE_API_DEFAULTS.lang
}
