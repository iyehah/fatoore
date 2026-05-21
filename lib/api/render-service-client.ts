import type { InvoiceApiFormat } from './invoice-query/types'
import type { InvoiceTemplateSize } from '@/lib/invoice-preview-scale'

export interface RenderServiceCaptureOptions {
  url: string
  format: InvoiceApiFormat
  templateSize: InvoiceTemplateSize
  timeoutMs?: number
}

export interface RenderServiceCaptureResult {
  buffer: Buffer
  contentType: string
}

function renderServiceConfig(): { baseUrl: string; apiKey: string } {
  const baseUrl = process.env.RENDER_SERVICE_URL?.replace(/\/$/, '')
  const apiKey = process.env.RENDER_SERVICE_API_KEY?.trim()
  if (!baseUrl || !apiKey) {
    throw new Error(
      'RENDER_SERVICE_URL and RENDER_SERVICE_API_KEY must be set (external Playwright render service)',
    )
  }
  return { baseUrl, apiKey }
}

export async function captureViaRenderService(
  options: RenderServiceCaptureOptions,
): Promise<RenderServiceCaptureResult> {
  const { baseUrl, apiKey } = renderServiceConfig()
  const timeoutMs = options.timeoutMs ?? Number(process.env.RENDER_SERVICE_TIMEOUT_MS ?? 55_000)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        url: options.url,
        format: options.format,
        templateSize: options.templateSize,
        token: apiKey,
      }),
      signal: controller.signal,
    })

    if (!res.ok) {
      let details = res.statusText
      try {
        const json = (await res.json()) as { error?: string; details?: string[] }
        details = [json.error, ...(json.details ?? [])].filter(Boolean).join(' — ')
      } catch {
        /* non-json body */
      }
      throw new Error(`Render service error (${res.status}): ${details}`)
    }

    const contentType = res.headers.get('content-type') ?? 'application/octet-stream'
    const arrayBuffer = await res.arrayBuffer()
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
    }
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error(`Render service timed out after ${timeoutMs}ms`)
    }
    throw e
  } finally {
    clearTimeout(timer)
  }
}
