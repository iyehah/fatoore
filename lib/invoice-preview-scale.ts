import type { Invoice } from '@/types/invoice'

export type InvoiceTemplateSize = 'small' | 'medium' | 'large'
export type InvoiceDensity = 'comfortable' | 'compact' | 'dense'
export type InvoicePdfFormat = 'a4' | 'a5' | [number, number]

export interface InvoiceFormatSpec {
  widthPx: number
  maxWidthCss: string
  pdfFormat: InvoicePdfFormat
  baseScale: number
  maxPageHeightPx: number
}

export const INVOICE_FORMATS: Record<InvoiceTemplateSize, InvoiceFormatSpec> = {
  small: {
    widthPx: 500,
    maxWidthCss: '500px',
    pdfFormat: [140, 216],
    baseScale: 0.78,
    maxPageHeightPx: 816,
  },
  medium: {
    widthPx: 559,
    maxWidthCss: '148mm',
    pdfFormat: 'a5',
    baseScale: 0.92,
    maxPageHeightPx: 794,
  },
  large: {
    widthPx: 794,
    maxWidthCss: '210mm',
    pdfFormat: 'a4',
    baseScale: 1,
    maxPageHeightPx: 1122,
  },
}

const DENSITY_SCALE: Record<InvoiceDensity, number> = {
  comfortable: 1,
  compact: 0.93,
  dense: 0.86,
}

const MIN_AUTO_FIT_SCALE = 0.72

export const INVOICE_TEMPLATE_SIZE_KEY = 'rim-invoice-template-size'

export function isInvoiceTemplateSize(v: string): v is InvoiceTemplateSize {
  return v === 'small' || v === 'medium' || v === 'large'
}

export function getInvoiceFormat(templateSize: InvoiceTemplateSize): InvoiceFormatSpec {
  return INVOICE_FORMATS[templateSize]
}

export function getInvoicePreviewMaxWidthClass(templateSize: InvoiceTemplateSize): string {
  switch (templateSize) {
    case 'small':
      return 'max-w-[500px]'
    case 'medium':
      return 'max-w-[148mm]'
    case 'large':
      return 'max-w-[210mm]'
  }
}

export function computeContentScore(invoice: Partial<Invoice>): number {
  const items = invoice.items?.length ?? 0
  let score = items * 1.15

  if (invoice.clientPhone) score += 0.35
  if (invoice.clientAddress) score += 0.45
  if (invoice.businessPhone) score += 0.35
  if (invoice.businessAddress) score += 0.45
  if (invoice.businessTaxId) score += 0.3
  if (invoice.dueDate) score += 0.35
  if (invoice.notes) score += 0.9
  if (invoice.paymentMethod) score += 0.75
  if (invoice.taxAmount && invoice.taxAmount > 0) score += 0.4
  if (invoice.discount && invoice.discount > 0) score += 0.35

  return score
}

export function computeInvoiceDensity(score: number): InvoiceDensity {
  if (score > 14) return 'dense'
  if (score > 8) return 'compact'
  return 'comfortable'
}

export function computeAutoFitScale(contentHeightPx: number, maxPageHeightPx: number): number {
  if (contentHeightPx <= maxPageHeightPx) return 1
  return Math.max(MIN_AUTO_FIT_SCALE, maxPageHeightPx / contentHeightPx)
}

export function buildInvoiceCssVars(
  templateSize: InvoiceTemplateSize,
  density: InvoiceDensity,
  autoFitScale = 1,
): Record<string, string> {
  const format = getInvoiceFormat(templateSize)
  const scale =
    format.baseScale * DENSITY_SCALE[density] * Math.min(1, autoFitScale)

  return {
    '--inv-doc-width': format.maxWidthCss,
    '--inv-scale': String(scale),
    '--inv-pad-x': `calc(${scale} * 28px)`,
    '--inv-pad-y': `calc(${scale} * 24px)`,
    '--inv-gap-lg': `calc(${scale} * 18px)`,
    '--inv-gap-md': `calc(${scale} * 12px)`,
    '--inv-gap-sm': `calc(${scale} * 8px)`,
    '--inv-radius': `calc(${scale} * 10px)`,
    '--inv-radius-sm': `calc(${scale} * 6px)`,
    '--inv-text-xs': `calc(${scale} * 10px)`,
    '--inv-text-sm': `calc(${scale} * 11px)`,
    '--inv-text-base': `calc(${scale} * 12px)`,
    '--inv-text-md': `calc(${scale} * 13px)`,
    '--inv-text-lg': `calc(${scale} * 15px)`,
    '--inv-text-xl': `calc(${scale} * 20px)`,
    '--inv-text-2xl': `calc(${scale} * 24px)`,
    '--inv-row-pad': `calc(${scale} * 7px)`,
    '--inv-logo': `calc(${scale} * 56px)`,
  }
}

export function computeInvoicePreviewMetrics(
  invoice: Partial<Invoice>,
  templateSize: InvoiceTemplateSize,
  autoFitScale = 1,
) {
  const score = computeContentScore(invoice)
  const density = computeInvoiceDensity(score)

  return {
    score,
    density,
    templateSize,
    format: getInvoiceFormat(templateSize),
    className: `invoice-doc--${templateSize} invoice-doc--${density}`,
    style: buildInvoiceCssVars(templateSize, density, autoFitScale),
  }
}
