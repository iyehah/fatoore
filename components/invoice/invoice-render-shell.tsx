'use client'

import type { InvoiceAccentState } from '@/lib/invoice-accent-color'
import type { FontKey } from '@/lib/fonts/registry'
import type { ApiFontKey } from '@/lib/api/invoice-query/parse-font'
import type { InvoiceTemplateSize } from '@/lib/invoice-preview-scale'
import type { ActiveLanguage } from '@/lib/i18n-config'
import type { Invoice } from '@/types/invoice'
import { FontProvider } from '@/components/font-provider'
import { LanguageProvider } from '@/hooks/use-language'
import { InvoiceAccentColorProvider } from './invoice-accent-color-provider'
import { InvoicePreview } from './invoice-preview'
import { InvoiceTemplateSizeProvider } from './invoice-template-size-provider'
import { cn } from '@/lib/utils'

export interface InvoiceRenderShellProps {
  invoice: Partial<Invoice>
  lang: ActiveLanguage
  templateSize: InvoiceTemplateSize
  font?: FontKey | ApiFontKey
  accent: InvoiceAccentState
  exportMode?: boolean
  className?: string
  onReady?: () => void
}

export function InvoiceRenderShell({
  invoice,
  lang,
  templateSize,
  font = 'geist',
  accent,
  exportMode = false,
  className,
  onReady,
}: InvoiceRenderShellProps) {
  return (
    <LanguageProvider initialLanguage={lang} persist={false} isolateDocument>
      <FontProvider initialFontKey={font} persist={false} isolate>
        <InvoiceTemplateSizeProvider initialSize={templateSize} persist={false}>
          <InvoiceAccentColorProvider initialState={accent} persist={false}>
          <div
            className={cn(
              exportMode && 'invoice-export-mode',
              'bg-white p-4',
              className,
            )}
          >
            <InvoicePreview
              invoice={invoice}
              autoFit={exportMode}
              className={exportMode ? 'invoice-doc--export' : undefined}
              onExportReady={exportMode ? onReady ?? (() => {}) : onReady}
            />
          </div>
          </InvoiceAccentColorProvider>
        </InvoiceTemplateSizeProvider>
      </FontProvider>
    </LanguageProvider>
  )
}
