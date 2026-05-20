import { NextRequest, NextResponse } from 'next/server'
import { buildInvoiceFromQuery } from '@/lib/api/build-invoice-from-query'
import { captureInvoiceWithPlaywright } from '@/lib/api/capture-invoice-playwright'
import { cacheKeyForQuery, getCachedExport, setCachedExport } from '@/lib/api/invoice-cache'
import { parseInvoiceQuery } from '@/lib/api/invoice-query/parse-query'

export const runtime = 'nodejs'
export const maxDuration = 60

function baseUrl(): string {
  return (
    process.env.INVOICE_API_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://127.0.0.1:3000')
  )
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const parsed = parseInvoiceQuery(searchParams)

  if (!parsed.ok) {
    return NextResponse.json(
      { error: parsed.error, details: parsed.details },
      { status: 400 },
    )
  }

  try {
    buildInvoiceFromQuery(parsed.request)
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Failed to build invoice',
        details: [e instanceof Error ? e.message : 'Unknown error'],
      },
      { status: 400 },
    )
  }

  const queryString = searchParams.toString()
  const cacheKey = cacheKeyForQuery(`${parsed.request.render.format}:${queryString}`)
  const cached = getCachedExport(cacheKey)
  if (cached) {
    return new NextResponse(new Uint8Array(cached.buffer), {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=60',
        'X-Invoice-Cache': 'HIT',
      },
    })
  }

  const renderUrl = `${baseUrl().replace(/\/$/, '')}/invoice/render?${queryString}`

  try {
    const result = await captureInvoiceWithPlaywright({
      renderUrl,
      format: parsed.request.render.format,
      templateSize: parsed.request.render.size,
    })

    setCachedExport(cacheKey, result.buffer, result.contentType)

    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=60',
        'X-Invoice-Cache': 'MISS',
        'Content-Disposition':
          parsed.request.render.format === 'pdf'
            ? 'inline; filename="invoice.pdf"'
            : 'inline; filename="invoice.png"',
      },
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Capture failed'
    const debug = searchParams.get('debug') === 'true'

    if (debug) {
      return NextResponse.json(
        {
          error: 'Invoice capture failed',
          details: [message],
          renderUrl,
          hint: 'Ensure the dev server is running and Playwright Chromium is installed (pnpm exec playwright install chromium).',
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { error: 'Invoice capture failed', details: [message] },
      { status: 500 },
    )
  }
}
