'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { InvoiceRenderShell } from '@/components/invoice/invoice-render-shell'
import { buildInvoiceFromQuery } from '@/lib/api/build-invoice-from-query'
import { parseInvoiceQuery } from '@/lib/api/invoice-query/parse-query'
import '@/styles/invoice-preview.css'
import '@/styles/globals.css'

function InvoiceRenderContent() {
  const searchParams = useSearchParams()
  const parsed = useMemo(
    () => parseInvoiceQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  )

  if (!parsed.ok) {
    return (
      <div className="p-2 text-center text-sm text-destructive" data-export-error="true">
        <p>{parsed.error}</p>
        {parsed.details?.map((d) => (
          <p key={d} className="text-muted-foreground">
            {d}
          </p>
        ))}
      </div>
    )
  }

  const { request } = parsed
  const invoice = buildInvoiceFromQuery(request)

  return (
    <InvoiceRenderShell
      invoice={invoice}
      lang={request.render.lang}
      templateSize={request.render.size}
      font={request.render.font}
      accent={request.render.accent}
      exportMode
      className=""
      onReady={() => {
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-invoice-export-ready', 'true')
        }
      }}
    />
  )
}

export default function InvoiceRenderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          Loading…
        </div>
      }
    >
      <InvoiceRenderContent />
    </Suspense>
  )
}
