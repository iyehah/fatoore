'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceBuilder } from '@/components/invoice-engine/invoice-builder'
import { useInvoiceActions } from '@/hooks/use-invoice'
import { useLanguage } from '@/hooks/use-language'
import { toast } from '@/hooks/use-toast'
import { useBusinessProfiles } from '@/hooks/use-business-profiles'
import type { InvoiceDraft } from '@/types/invoice'

export default function NewInvoicePage() {
  const router = useRouter()
  const { createInvoice, loading } = useInvoiceActions()
  const { t, direction } = useLanguage()
  const { profiles, defaultProfileId } = useBusinessProfiles()

  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  useEffect(() => {
    if (!profiles.length) {
      setSelectedProfileId(null)
      return
    }
    setSelectedProfileId((prev) => {
      if (prev && profiles.some((p) => p.id === prev)) return prev
      if (defaultProfileId && profiles.some((p) => p.id === defaultProfileId)) return defaultProfileId
      return profiles[0].id
    })
  }, [profiles, defaultProfileId])

  const selectedBusiness = profiles.find((p) => p.id === selectedProfileId) ?? null

  const handleSubmit = async (draft: InvoiceDraft) => {
    if (!selectedBusiness) return
    const invoiceId = await createInvoice(draft, selectedBusiness)
    if (invoiceId) {
      toast({ title: t('toast.invoiceCreated') })
      router.push(`/dashboard/invoices/${invoiceId}`)
    } else {
      toast({ variant: 'destructive', title: t('toast.invoiceCreateFailed') })
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/[0.07] via-background to-background p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -bottom-8 -end-8 h-32 w-32 rounded-full bg-primary/[0.06] blur-2xl" />
        <div className="relative flex items-start gap-3">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="mt-0.5 shrink-0 rounded-xl border border-border/60 bg-background/80 shadow-sm"
          >
            <Link href="/dashboard/invoices">
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
            </Link>
          </Button>
          <div>
            <div className="mb-1 flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">{t('nav.newInvoice')}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t('invoice.createInvoice')}</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground sm:text-base">
              {t('invoice.engine.createHint')}
            </p>
          </div>
        </div>
      </div>
      <InvoiceBuilder
        businessProfiles={profiles}
        selectedProfileId={selectedProfileId}
        onSelectProfileId={setSelectedProfileId}
        defaultBusinessProfileId={defaultProfileId}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  )
}
