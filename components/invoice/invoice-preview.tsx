'use client'

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import { useAppFontPreference } from '@/components/font-provider'
import type { FontKey } from '@/lib/fonts/registry'
import { useInvoiceAccentColor } from '@/hooks/use-invoice-accent-color'
import { useLanguage } from '@/hooks/use-language'
import { resolvedBodyFontFamily } from '@/lib/fonts/body-font-family'
import { useInvoiceTemplateSize } from '@/hooks/use-invoice-template-size'
import {
  computeAutoFitScale,
  computeInvoicePreviewMetrics,
  getInvoiceFormat,
} from '@/lib/invoice-preview-scale'
import { waitForRenderableAssets } from '@/lib/invoice-export/capture'
import { cn } from '@/lib/utils'
import type { Invoice } from '@/types/invoice'
import { InvoicePreviewShell } from './preview/invoice-preview-shell'
import { InvoicePreviewRouter } from './preview/invoice-preview-router'
import '@/styles/invoice-preview.css'

interface InvoicePreviewProps {
  invoice: Partial<Invoice>
  className?: string
  /** When false, skips ResizeObserver auto-fit (avoids feedback loops in live builder). */
  autoFit?: boolean
  /** Called when fonts/images loaded and layout is stable (export capture). */
  onExportReady?: () => void
  /** Overrides app font when set (API / isolated preview). */
  fontKey?: FontKey
}

export const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ invoice, className, autoFit = true, onExportReady, fontKey: fontKeyProp }, ref) {
    const { language, direction } = useLanguage()
    const { fontKey: contextFontKey } = useAppFontPreference()
    const fontKey = fontKeyProp ?? contextFontKey
    const { templateSize } = useInvoiceTemplateSize()
    const { accentCssVars, accentClassName } = useInvoiceAccentColor()
    const rootRef = useRef<HTMLDivElement>(null)
    const sheetRef = useRef<HTMLDivElement>(null)
    const exportReadyMarkedRef = useRef(false)
    const [autoFitScale, setAutoFitScale] = useState(1)
    const [exportReady, setExportReady] = useState(false)

    const format = getInvoiceFormat(templateSize)
    const fontFamily = resolvedBodyFontFamily(fontKey)

    const metrics = useMemo(
      () => computeInvoicePreviewMetrics(invoice, templateSize, autoFitScale),
      [invoice, templateSize, autoFitScale],
    )

    const rootStyle = useMemo(
      (): CSSProperties => ({
        ...metrics.style,
        ...accentCssVars,
        fontFamily,
        ['--inv-font-family' as string]: fontFamily,
      }),
      [metrics.style, accentCssVars, fontFamily],
    )

    const itemCount = invoice.items?.length ?? 0
    const tableCount = invoice.displayTables?.length ?? 0

    useEffect(() => {
      setAutoFitScale(1)
      exportReadyMarkedRef.current = false
      setExportReady(false)
    }, [templateSize, invoice, language, fontKey])

    useEffect(() => {
      if (!onExportReady) return
      const root = rootRef.current
      if (!root || !exportReady) return
      onExportReady()
    }, [exportReady, onExportReady])

    useEffect(() => {
      if (!onExportReady || exportReadyMarkedRef.current) return
      const root = rootRef.current
      if (!root) return

      let cancelled = false
      const markReady = async () => {
        await waitForRenderableAssets(root)
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r())),
        )
        if (cancelled || exportReadyMarkedRef.current) return
        exportReadyMarkedRef.current = true
        setExportReady(true)
      }

      const t = window.setTimeout(markReady, 500)
      return () => {
        cancelled = true
        window.clearTimeout(t)
      }
    }, [onExportReady, invoice, templateSize, language, fontKey])

    useLayoutEffect(() => {
      if (!autoFit) {
        setAutoFitScale(1)
        return
      }

      const sheet = sheetRef.current
      if (!sheet) return

      let rafId = 0
      const measure = () => {
        cancelAnimationFrame(rafId)
        rafId = requestAnimationFrame(() => {
          const contentHeight = sheet.scrollHeight
          const next = computeAutoFitScale(contentHeight, format.maxPageHeightPx)
          setAutoFitScale((prev) => (Math.abs(prev - next) < 0.005 ? prev : next))
        })
      }

      measure()
      const observer = new ResizeObserver(measure)
      observer.observe(sheet)
      return () => {
        cancelAnimationFrame(rafId)
        observer.disconnect()
      }
    }, [
      autoFit,
      invoice,
      templateSize,
      format.maxPageHeightPx,
      itemCount,
      tableCount,
      language,
      fontKey,
    ])

    const setRefs = (node: HTMLDivElement | null) => {
      rootRef.current = node
      if (typeof ref === 'function') ref(node)
      else if (ref) ref.current = node
    }

    return (
      <div
        ref={setRefs}
        dir={direction}
        data-export-ready={onExportReady ? (exportReady ? 'true' : 'false') : undefined}
        className={cn(
          'invoice-doc',
          metrics.className,
          accentClassName,
          language === 'ar' && 'invoice-doc--ar',
          className,
        )}
        style={rootStyle}
      >
        <div ref={sheetRef} className="invoice-doc__sheet">
          <InvoicePreviewShell invoice={invoice}>
            <InvoicePreviewRouter invoice={invoice} />
          </InvoicePreviewShell>
        </div>
      </div>
    )
  },
)
