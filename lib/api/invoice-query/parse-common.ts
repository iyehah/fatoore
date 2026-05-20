import type { InvoiceApiBusiness, InvoiceApiRenderOptions } from './types'
import { INVOICE_API_DEFAULTS } from './types'
import { parseAccentColor } from './parse-color'
import { parseFont } from './parse-font'
import { parseLang, parseTemplateSize } from './parse-size-lang'
import {
  parseBooleanParam,
  parseNumberParam,
  sanitizeString,
  sanitizeUrl,
} from './sanitize'
import type { InvoiceApiFormat } from './types'

export function parseRenderOptions(params: URLSearchParams): InvoiceApiRenderOptions {
  const formatRaw = params.get('format')?.trim().toLowerCase()
  const format: InvoiceApiFormat =
    formatRaw === 'pdf' ? 'pdf' : formatRaw === 'img' || formatRaw === 'png' ? 'img' : INVOICE_API_DEFAULTS.format

  return {
    format,
    lang: parseLang(params.get('lang')),
    size: parseTemplateSize(params.get('size')),
    font: parseFont(params.get('font')),
    accent: parseAccentColor(params.get('color'), params.get('applyBorders')),
    showLogo: parseBooleanParam(params.get('showLogo'), INVOICE_API_DEFAULTS.showLogo),
    exportMode: parseBooleanParam(params.get('exportMode'), true),
    debug: parseBooleanParam(params.get('debug'), INVOICE_API_DEFAULTS.debug),
  }
}

export function parseBusiness(params: URLSearchParams, showLogo: boolean): InvoiceApiBusiness {
  const logo = showLogo ? sanitizeUrl(params.get('businessLogo')) : undefined
  return {
    storeName: sanitizeString(params.get('businessName')) ?? 'Business',
    logo,
    phone: sanitizeString(params.get('businessPhone')),
    address: sanitizeString(params.get('businessAddress')),
    taxId: sanitizeString(params.get('businessTaxId')),
  }
}

export function parseCommonValues(params: URLSearchParams): Record<string, unknown> {
  const values: Record<string, unknown> = {}

  const clientName = sanitizeString(params.get('clientName'))
  if (clientName) values.clientName = clientName

  const clientPhone = sanitizeString(params.get('clientPhone'))
  if (clientPhone) values.clientPhone = clientPhone

  const clientAddress = sanitizeString(params.get('clientAddress'))
  if (clientAddress) values.clientAddress = clientAddress

  const gender = params.get('clientGender')?.trim()
  if (gender === 'M' || gender === 'F') values.clientGender = gender

  const taxRate = parseNumberParam(params.get('taxRate'))
  if (taxRate != null) values.taxRate = taxRate

  const discount = parseNumberParam(params.get('discount'))
  if (discount != null) values.discount = discount

  const paymentMethod = sanitizeString(params.get('paymentMethod'))
  if (paymentMethod) values.paymentMethod = paymentMethod

  const paymentDetails = sanitizeString(params.get('paymentDetails'))
  if (paymentDetails) values.paymentDetails = paymentDetails

  const notes = sanitizeString(params.get('notes'))
  if (notes) values.notes = notes

  const dueDate = sanitizeString(params.get('dueDate'))
  if (dueDate) values.dueDate = dueDate

  values.showQrCode = parseBooleanParam(params.get('showQrCode'), INVOICE_API_DEFAULTS.showQrCode)

  return values
}

export function parseMeta(params: URLSearchParams) {
  return {
    currency: sanitizeString(params.get('currency')) ?? INVOICE_API_DEFAULTS.currency,
    autoInvoiceNumber: parseBooleanParam(
      params.get('autoInvoiceNumber'),
      INVOICE_API_DEFAULTS.autoInvoiceNumber,
    ),
    invoiceNumber: sanitizeString(params.get('invoiceNumber'), 64),
    createdAt: sanitizeString(params.get('createdAt'), 64),
  }
}
