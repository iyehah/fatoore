'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceRenderShell } from '@/components/invoice/invoice-render-shell'
import { buildInvoiceFromQuery } from '@/lib/api/build-invoice-from-query'
import { parseInvoiceQuery } from '@/lib/api/invoice-query/parse-query'
import { useLanguage } from '@/hooks/use-language'
import { ApiUrlPreview } from './api-url-preview'
import { IntegrationDocs } from './integration-docs'
import { mergePlaygroundStateForType } from './example-presets'
import { isInvoiceType } from '@/lib/invoice-engine/registry'
import {
  QueryFormBuilder,
  defaultFormState,
  formStateToSearchParams,
  type QueryFormState,
} from './query-form-builder'

export function InvoiceApiPlayground() {
  const { t, direction } = useLanguage()
  const [formState, setFormState] = useState<QueryFormState>(defaultFormState)

  const searchParams = useMemo(() => formStateToSearchParams(formState), [formState])
  const queryString = searchParams.toString()

  const parsed = useMemo(() => parseInvoiceQuery(searchParams), [searchParams])

  const apiPath = `/api/invoice?${queryString}`
  const renderPath = `/invoice/render?${queryString}`
  const pdfPath = `/api/invoice?${new URLSearchParams({ ...Object.fromEntries(searchParams), format: 'pdf' }).toString()}`

  const preview = useMemo(() => {
    if (!parsed.ok) return null
    return {
      invoice: buildInvoiceFromQuery(parsed.request),
      request: parsed.request,
    }
  }, [parsed])

  const syncUrl = useCallback(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.search = queryString
    window.history.replaceState(null, '', url.toString())
  }, [queryString])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (!params.toString()) return
    const fromUrl: QueryFormState = {}
    params.forEach((v, k) => {
      fromUrl[k] = v
    })
    const typeParam = params.get('type')
    const type = typeParam && isInvoiceType(typeParam) ? typeParam : 'sales'
    setFormState({ ...mergePlaygroundStateForType({}, type), ...fromUrl })
  }, [])

  useEffect(() => {
    syncUrl()
  }, [syncUrl])

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link href="/">
            <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('api.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('api.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
        <div className="space-y-6 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('api.form.title')}</CardTitle>
              <CardDescription>{t('api.form.hint')}</CardDescription>
            </CardHeader>
            <CardContent>
              <QueryFormBuilder state={formState} onChange={setFormState} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('api.url.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ApiUrlPreview apiPath={apiPath} renderPath={renderPath} />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm" variant="default">
                  <a href={apiPath} target="_blank" rel="noopener noreferrer">
                    {t('api.url.openImage')}
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href={pdfPath} target="_blank" rel="noopener noreferrer">
                    {t('api.url.openPdf')}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <IntegrationDocs />
        </div>

        <div className="xl:sticky xl:top-6 space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60">
              <CardTitle className="text-base">{t('api.preview.title')}</CardTitle>
              <CardDescription>{t('api.preview.hint')}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {!parsed.ok ? (
                <p className="text-sm text-destructive">
                  {parsed.error}
                  {parsed.details?.join(' — ')}
                </p>
              ) : preview ? (
                <InvoiceRenderShell
                  invoice={preview.invoice}
                  lang={preview.request.render.lang}
                  templateSize={preview.request.render.size}
                  font={preview.request.render.font}
                  accent={preview.request.render.accent}
                  exportMode={false}
                />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
