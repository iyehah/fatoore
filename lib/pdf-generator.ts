import type { InvoicePdfFormat } from '@/lib/invoice-preview-scale'
import { captureInvoicePngDataUrl } from '@/lib/invoice-export/capture'
import { buildPdfFromPng } from '@/lib/invoice-export/pdf-from-png'

export interface GeneratePdfOptions {
  pdfFormat?: InvoicePdfFormat
}

export async function generatePdf(
  element: HTMLElement,
  filename: string,
  options?: GeneratePdfOptions,
): Promise<void> {
  const capture = await captureInvoicePngDataUrl(element)
  const ab = await buildPdfFromPng(capture, options?.pdfFormat ?? 'a4')
  const blob = new Blob([ab], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const safe = filename.replace(/[^\w.\-]+/g, '_') || 'invoice.pdf'
  const name = safe.endsWith('.pdf') ? safe : `${safe}.pdf`

  const link = document.createElement('a')
  link.download = name
  link.href = url
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function generateImage(element: HTMLElement, filename: string): Promise<void> {
  const capture = await captureInvoicePngDataUrl(element)

  const safe = filename.replace(/[^\w.\-]+/g, '_') || 'invoice.png'
  const name = safe.endsWith('.png') ? safe : `${safe}.png`

  const link = document.createElement('a')
  link.download = name
  link.href = capture.dataUrl
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
