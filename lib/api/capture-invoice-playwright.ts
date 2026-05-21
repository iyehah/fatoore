import fs from 'node:fs'
import path from 'node:path'
import chromiumPkg from '@sparticuz/chromium'
import { chromium as playwrightChromium, type Browser } from 'playwright-core'
import { getInvoiceFormat } from '@/lib/invoice-preview-scale'
import { pngBufferToPdf } from '@/lib/invoice-export/pdf-from-png'
import type { InvoiceApiFormat } from './invoice-query/types'
import type { InvoiceTemplateSize } from '@/lib/invoice-preview-scale'

function isServerlessEnv(): boolean {
  return Boolean(process.env.VERCEL) || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME)
}

let localBrowserPromise: Promise<Browser> | null = null

async function resolveServerlessExecutablePath(): Promise<string> {
  const binDir = path.join(process.cwd(), 'node_modules', '@sparticuz', 'chromium', 'bin')
  if (fs.existsSync(binDir)) {
    return chromiumPkg.executablePath(binDir)
  }
  return chromiumPkg.executablePath()
}

async function launchBrowser(): Promise<Browser> {
  if (isServerlessEnv()) {
    chromiumPkg.setGraphicsMode = false
    return playwrightChromium.launch({
      args: chromiumPkg.args,
      executablePath: await resolveServerlessExecutablePath(),
      headless: chromiumPkg.headless,
    })
  }

  if (!localBrowserPromise) {
    const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    localBrowserPromise = playwrightChromium.launch({
      headless: true,
      ...(executablePath ? { executablePath } : { channel: 'chromium' }),
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  }
  return localBrowserPromise
}

export interface CaptureInvoiceOptions {
  renderUrl: string
  format: InvoiceApiFormat
  templateSize: InvoiceTemplateSize
  timeoutMs?: number
}

export interface CaptureInvoiceResult {
  buffer: Buffer
  contentType: string
  width: number
  height: number
}

export async function captureInvoiceWithPlaywright(
  options: CaptureInvoiceOptions,
): Promise<CaptureInvoiceResult> {
  const serverless = isServerlessEnv()
  const browser = await launchBrowser()
  const context = await browser.newContext({
    viewport: { width: 900, height: 1200 },
    deviceScaleFactor: 2,
  })
  const page = await context.newPage()
  const timeout = options.timeoutMs ?? 30_000

  try {
    await page.goto(options.renderUrl, { waitUntil: 'domcontentloaded', timeout })

    const errorEl = page.locator('[data-export-error="true"]')
    if (await errorEl.count()) {
      const text = await errorEl.innerText()
      throw new Error(text || 'Invoice render validation failed')
    }

    await Promise.race([
      page.waitForSelector('.invoice-doc[data-export-ready="true"]', {
        timeout,
        state: 'attached',
      }),
      page.waitForFunction(
        () => document.documentElement.getAttribute('data-invoice-export-ready') === 'true',
        { timeout },
      ),
    ]).catch(async () => {
      await page.waitForSelector('.invoice-doc', { timeout: 10_000, state: 'attached' })
      await page.waitForTimeout(2000)
    })
    const doc = page.locator('.invoice-doc').first()
    const box = await doc.boundingBox()
    if (!box) throw new Error('Invoice document not found for capture')

    const pngBuffer = await doc.screenshot({ type: 'png' })
    const width = Math.round(box.width)
    const height = Math.round(box.height)

    if (options.format === 'pdf') {
      const pdfFormat = getInvoiceFormat(options.templateSize).pdfFormat
      const pdfBuffer = await pngBufferToPdf(Buffer.from(pngBuffer), { width, height }, pdfFormat)
      return {
        buffer: pdfBuffer,
        contentType: 'application/pdf',
        width,
        height,
      }
    }

    return {
      buffer: Buffer.from(pngBuffer),
      contentType: 'image/png',
      width,
      height,
    }
  } finally {
    await context.close()
    if (serverless) {
      await browser.close()
    }
  }
}
