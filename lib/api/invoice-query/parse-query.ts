import type { InvoiceApiRequest } from './types'
import { MAX_QUERY_STRING_LENGTH } from './types'
import {
  parseBusiness,
  parseCommonValues,
  parseMeta,
  parseRenderOptions,
} from './parse-common'
import {
  mergeWithPluginDefaults,
  parseInvoiceType,
  parseTypeSpecificValues,
} from './parse-type'

export interface ParseInvoiceQueryResult {
  ok: true
  request: InvoiceApiRequest
}

export interface ParseInvoiceQueryError {
  ok: false
  error: string
  details?: string[]
}

export type ParseInvoiceQueryResponse = ParseInvoiceQueryResult | ParseInvoiceQueryError

export function parseInvoiceQuery(searchParams: URLSearchParams): ParseInvoiceQueryResponse {
  const details: string[] = []

  const queryString = searchParams.toString()
  if (queryString.length > MAX_QUERY_STRING_LENGTH) {
    return {
      ok: false,
      error: 'Query string too long',
      details: [`Maximum length is ${MAX_QUERY_STRING_LENGTH} characters`],
    }
  }

  try {
    const type = parseInvoiceType(searchParams)
    const render = parseRenderOptions(searchParams)
    const business = parseBusiness(searchParams, render.showLogo)
    const meta = parseMeta(searchParams)
    const common = parseCommonValues(searchParams)
    const specific = parseTypeSpecificValues(type, searchParams)
    const values = mergeWithPluginDefaults(type, common, specific)

    if (!values.clientName || String(values.clientName).trim() === '') {
      details.push('clientName is required')
    }

    if (type === 'sales') {
      const items = values.items as unknown[]
      if (!Array.isArray(items) || items.length === 0) {
        details.push('At least one line item is required (use items JSON or item0_desc)')
      }
    }

    if (!meta.autoInvoiceNumber && !meta.invoiceNumber?.trim()) {
      details.push('invoiceNumber is required when autoInvoiceNumber=false')
    }

    if (details.length) {
      return { ok: false, error: 'Validation failed', details }
    }

    return {
      ok: true,
      request: {
        type,
        values,
        business,
        render,
        currency: meta.currency,
        autoInvoiceNumber: meta.autoInvoiceNumber,
        invoiceNumber: meta.invoiceNumber,
        createdAt: meta.createdAt,
      },
    }
  } catch (e) {
    return {
      ok: false,
      error: 'Invalid query parameters',
      details: [e instanceof Error ? e.message : 'Unknown error'],
    }
  }
}

/** Serialize request back to URLSearchParams for render/capture URLs. */
export function invoiceRequestToSearchParams(request: InvoiceApiRequest): URLSearchParams {
  const p = new URLSearchParams()
  const { values, business, render, type } = request

  p.set('type', type)
  p.set('format', render.format)
  p.set('lang', render.lang)
  p.set('size', render.size)
  p.set('color', render.accent.preset === 'custom' ? render.accent.customHex : render.accent.preset)
  if (render.accent.applyToBorders) p.set('applyBorders', 'true')
  p.set('showLogo', String(render.showLogo))
  p.set('showQrCode', String(values.showQrCode !== false))
  p.set('exportMode', 'true')

  if (business.storeName) p.set('businessName', business.storeName)
  if (business.logo) p.set('businessLogo', business.logo)
  if (business.phone) p.set('businessPhone', business.phone)
  if (business.address) p.set('businessAddress', business.address)
  if (business.taxId) p.set('businessTaxId', business.taxId)

  if (request.currency) p.set('currency', request.currency)
  p.set('autoInvoiceNumber', String(request.autoInvoiceNumber !== false))
  if (!request.autoInvoiceNumber && request.invoiceNumber) {
    p.set('invoiceNumber', request.invoiceNumber)
  }
  if (request.createdAt) p.set('createdAt', request.createdAt)

  for (const [key, val] of Object.entries(values)) {
    if (val == null || val === '') continue
    if (key === 'items' || key === 'milestones' || key === 'installments') {
      p.set(key, JSON.stringify(val))
    } else if (typeof val === 'boolean') {
      p.set(key, String(val))
    } else if (typeof val === 'number') {
      p.set(key, String(val))
    } else if (typeof val === 'string') {
      p.set(key, val)
    }
  }

  return p
}
