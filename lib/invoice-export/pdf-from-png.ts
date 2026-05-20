import type { InvoicePdfFormat } from '@/lib/invoice-preview-scale'

export interface PngCaptureDimensions {
  width: number
  height: number
}

function dataUrlFromBuffer(buffer: Buffer): string {
  const base64 = buffer.toString('base64')
  return `data:image/png;base64,${base64}`
}

/** Build a PDF ArrayBuffer from a PNG buffer (server or client). */
export async function buildPdfFromPng(
  png: Buffer | { dataUrl: string; width: number; height: number },
  pdfFormat: InvoicePdfFormat = 'a4',
): Promise<ArrayBuffer> {
  const { default: jsPDF } = await import('jspdf')

  const imgData = Buffer.isBuffer(png) ? dataUrlFromBuffer(png) : png.dataUrl
  const captureWidth = Buffer.isBuffer(png) ? 0 : png.width
  const captureHeight = Buffer.isBuffer(png) ? 0 : png.height

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: pdfFormat,
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 10
  const maxW = pageWidth - margin * 2
  const maxH = pageHeight - margin * 2

  let renderW = maxW
  let renderH = maxH
  if (captureWidth > 0 && captureHeight > 0) {
    renderH = (captureHeight * renderW) / captureWidth
    if (renderH > maxH) {
      const scale = maxH / renderH
      renderH = maxH
      renderW = renderW * scale
    }
  }

  const x = margin + (maxW - renderW) / 2
  const y = margin + (maxH - renderH) / 2
  pdf.addImage(imgData, 'PNG', x, y, renderW, renderH, undefined, 'FAST')

  return pdf.output('arraybuffer')
}

export async function pngBufferToPdf(
  buffer: Buffer,
  dimensions: PngCaptureDimensions,
  pdfFormat: InvoicePdfFormat = 'a4',
): Promise<Buffer> {
  const ab = await buildPdfFromPng(
    { dataUrl: dataUrlFromBuffer(buffer), width: dimensions.width, height: dimensions.height },
    pdfFormat,
  )
  return Buffer.from(ab)
}
