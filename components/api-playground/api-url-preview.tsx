'use client'

import { useEffect, useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/hooks/use-language'

interface ApiUrlPreviewProps {
  /** Path + query only, e.g. /api/invoice?type=sales */
  apiPath: string
  renderPath: string
}

export function ApiUrlPreview({ apiPath, renderPath }: ApiUrlPreviewProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState<'api' | 'render' | null>(null)
  const [absoluteApi, setAbsoluteApi] = useState(apiPath)
  const [absoluteRender, setAbsoluteRender] = useState(renderPath)

  useEffect(() => {
    setAbsoluteApi(`${window.location.origin}${apiPath}`)
    setAbsoluteRender(`${window.location.origin}${renderPath}`)
  }, [apiPath, renderPath])

  const copy = async (text: string, which: 'api' | 'render') => {
    const full = which === 'api' ? absoluteApi : absoluteRender
    await navigator.clipboard.writeText(full)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('api.url.apiEndpoint')}
          </p>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => copy(apiPath, 'api')}>
              {copied === 'api' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={apiPath} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
        <pre
          suppressHydrationWarning
          className="max-h-32 overflow-auto rounded-lg border border-border/80 bg-muted/40 p-3 text-xs break-all whitespace-pre-wrap"
        >
          {apiPath}
        </pre>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t('api.url.renderPage')}
          </p>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => copy(renderPath, 'render')}>
              {copied === 'render' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button type="button" variant="ghost" size="sm" asChild>
              <a href={renderPath} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
        <pre
          suppressHydrationWarning
          className="max-h-24 overflow-auto rounded-lg border border-border/80 bg-muted/40 p-3 text-xs break-all whitespace-pre-wrap"
        >
          {renderPath}
        </pre>
      </div>
    </div>
  )
}
