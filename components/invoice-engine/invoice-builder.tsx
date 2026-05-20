'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BusinessProfileSelector } from './business-profile-selector'
import { InvoiceAccentColorProvider } from '@/components/invoice/invoice-accent-color-provider'
import { InvoicePreview } from '@/components/invoice/invoice-preview'
import { InvoicePreviewFrame } from '@/components/invoice/invoice-preview-frame'
import { InvoicePreviewToolbar } from '@/components/invoice/invoice-preview-toolbar'
import { InvoiceTemplateSizeProvider } from '@/components/invoice/invoice-template-size-provider'
import { DynamicInvoiceForm } from './dynamic-invoice-form'
import { InvoiceTypeSelector } from './invoice-type-selector'
import { useLanguage } from '@/hooks/use-language'
import { buildPreviewInvoiceFromDraft } from '@/lib/invoice-engine/normalize'
import { getPlugin } from '@/lib/invoice-engine/registry'
import { generateInvoiceNumber } from '@/lib/invoice-utils'
import type { InvoiceDraft, InvoiceType } from '@/types/invoice'
import type { BusinessProfileStored } from '@/lib/local-business-profiles'

interface InvoiceBuilderProps {
  businessProfiles: BusinessProfileStored[]
  selectedProfileId: string | null
  onSelectProfileId: (id: string) => void
  defaultBusinessProfileId: string | null
  onSubmit: (draft: InvoiceDraft) => void
  loading?: boolean
}

export function InvoiceBuilder({
  businessProfiles,
  selectedProfileId,
  onSelectProfileId,
  defaultBusinessProfileId,
  onSubmit,
  loading,
}: InvoiceBuilderProps) {
  const { t } = useLanguage()
  const [invoiceType, setInvoiceType] = useState<InvoiceType | null>(null)
  const [values, setValues] = useState<Record<string, unknown>>({})

  const selectedBusiness = businessProfiles.find((p) => p.id === selectedProfileId) ?? null
  const hasBusiness = businessProfiles.length > 0 && !!selectedBusiness

  const previewMetaRef = useRef({
    invoiceNumber: generateInvoiceNumber(),
    createdAt: new Date().toISOString(),
  })

  const handleTypeChange = useCallback((type: InvoiceType) => {
    previewMetaRef.current = {
      invoiceNumber: generateInvoiceNumber(),
      createdAt: new Date().toISOString(),
    }
    setInvoiceType(type)
    setValues({ ...getPlugin(type).defaultValues })
  }, [])

  const draft = useMemo((): InvoiceDraft | null => {
    if (!invoiceType) return null
    return { invoiceType, values }
  }, [invoiceType, values])

  const previewInvoice = useMemo(() => {
    if (!draft || !selectedBusiness) return null
    return buildPreviewInvoiceFromDraft(draft, {
      business: {
        id: selectedBusiness.id,
        storeName: selectedBusiness.storeName,
        logo: selectedBusiness.logo,
        phone: selectedBusiness.phone,
        address: selectedBusiness.address,
        taxId: selectedBusiness.taxId,
      },
      invoiceNumber: previewMetaRef.current.invoiceNumber,
      createdAt: previewMetaRef.current.createdAt,
    })
  }, [draft, selectedBusiness])

  const handleValuesChange = useCallback((next: Record<string, unknown>) => {
    setValues({ ...next })
  }, [])

  const handleFormSubmit = useCallback(() => {
    if (!draft || !hasBusiness) return
    onSubmit(draft)
  }, [draft, hasBusiness, onSubmit])

  return (
    <div className="space-y-8">
      {businessProfiles.length === 0 ? (
        <Alert className="border-dashed border-amber-500/40 bg-amber-500/5">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('invoice.noBusinessProfile')}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{t('invoice.noBusinessProfileHint')}</span>
            <Button asChild size="sm" variant="secondary">
              <Link href="/dashboard/profile">{t('nav.profile')}</Link>
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <BusinessProfileSelector
          profiles={businessProfiles}
          value={selectedProfileId}
          onChange={onSelectProfileId}
          defaultProfileId={defaultBusinessProfileId}
        />
      )}

      <InvoiceTypeSelector value={invoiceType} onChange={handleTypeChange} />

      {invoiceType && hasBusiness ? (
        <div className="grid gap-8 xl:grid-cols-2 xl:items-start">
          <div className="min-w-0">
            <DynamicInvoiceForm
              key={invoiceType}
              invoiceType={invoiceType}
              onValuesChange={handleValuesChange}
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          </div>
          <div className="xl:sticky xl:top-6">
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-base">{t('invoice.previewInvoice')}</CardTitle>
                <CardDescription>{t('invoice.engine.livePreviewHint')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <InvoiceTemplateSizeProvider>
                  <InvoiceAccentColorProvider>
                    <InvoicePreviewToolbar />
                    {previewInvoice ? (
                      <InvoicePreviewFrame>
                        <InvoicePreview invoice={previewInvoice} autoFit={false} />
                      </InvoicePreviewFrame>
                    ) : null}
                  </InvoiceAccentColorProvider>
                </InvoiceTemplateSizeProvider>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : invoiceType && !hasBusiness ? (
        <p className="text-sm text-muted-foreground">{t('invoice.noBusinessProfileHint')}</p>
      ) : null}
    </div>
  )
}
