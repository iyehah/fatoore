'use client'

import { useRef, useState } from 'react'
import { FileText, Image, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InvoiceAccentColorProvider } from './invoice-accent-color-provider'
import { InvoicePreview } from './invoice-preview'
import { InvoicePreviewFrame } from './invoice-preview-frame'
import { InvoicePreviewToolbar } from './invoice-preview-toolbar'
import { InvoiceTemplateSizeProvider } from './invoice-template-size-provider'
import { useInvoiceTemplateSize } from '@/hooks/use-invoice-template-size'
import { getInvoiceFormat } from '@/lib/invoice-preview-scale'
import { generatePdf, generateImage } from '@/lib/pdf-generator'
import { useLanguage } from '@/hooks/use-language'
import { toast } from '@/hooks/use-toast'
import type { Invoice } from '@/types/invoice'

interface InvoicePdfProps {
  invoice: Partial<Invoice>
  open: boolean
  onOpenChange: (open: boolean) => void
}

function InvoicePdfContent({ invoice }: { invoice: Partial<Invoice> }) {
  const { t } = useLanguage()
  const { templateSize } = useInvoiceTemplateSize()
  const previewRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState<'pdf' | 'image' | null>(null)

  const baseName = `invoice-${invoice.invoiceNumber || 'draft'}`

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return
    setLoading('pdf')
    try {
      await generatePdf(previewRef.current, `${baseName}.pdf`, {
        pdfFormat: getInvoiceFormat(templateSize).pdfFormat,
      })
      toast({ title: t('toast.pdfDownloaded') })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('toast.downloadFailed'),
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadImage = async () => {
    if (!previewRef.current) return
    setLoading('image')
    try {
      await generateImage(previewRef.current, `${baseName}.png`)
      toast({ title: t('toast.imageDownloaded') })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: t('toast.downloadFailed'),
        description: e instanceof Error ? e.message : undefined,
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-2">
        <InvoicePreviewToolbar className="min-w-0 flex-1 border-0 bg-transparent px-0 py-1" />
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="default" size="sm" onClick={handleDownloadPdf} disabled={!!loading}>
            {loading === 'pdf' ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <FileText className="h-4 w-4 me-2" />
            )}
            {t('invoice.downloadPdf')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadImage} disabled={!!loading}>
            {loading === 'image' ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Image className="h-4 w-4 me-2" />
            )}
            {t('invoice.downloadImage')}
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-muted/20 p-4">
        <InvoicePreviewFrame>
          <InvoicePreview ref={previewRef} invoice={invoice} />
        </InvoicePreviewFrame>
      </div>
    </>
  )
}

export function InvoicePdf({ invoice, open, onOpenChange }: InvoicePdfProps) {
  const { t } = useLanguage()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogDescription className="sr-only">{t('invoice.previewInvoice')}</DialogDescription>
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between border-b border-border px-4 py-3 pe-12">
          <DialogTitle>{t('invoice.previewInvoice')}</DialogTitle>
        </DialogHeader>

        <InvoiceTemplateSizeProvider>
          <InvoiceAccentColorProvider>
            <InvoicePdfContent invoice={invoice} />
          </InvoiceAccentColorProvider>
        </InvoiceTemplateSizeProvider>
      </DialogContent>
    </Dialog>
  )
}
