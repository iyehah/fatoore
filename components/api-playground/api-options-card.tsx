'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useLanguage } from '@/hooks/use-language'
import type { QueryFormState } from './query-form-builder'

interface ApiOptionsCardProps {
  state: QueryFormState
  onPatch: (patch: Partial<QueryFormState>) => void
}

export function ApiOptionsCard({ state, onPatch }: ApiOptionsCardProps) {
  const { t } = useLanguage()

  const toggles: { key: string; label: string }[] = [
    { key: 'autoInvoiceNumber', label: t('api.form.autoInvoiceNumber') },
    { key: 'showLogo', label: t('api.form.showLogo') },
    { key: 'showQrCode', label: t('invoice.showQrCode') },
    { key: 'applyBorders', label: t('invoice.applyAccentToBorders') },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t('api.form.options')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {toggles.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5"
            >
              <Label htmlFor={`api-opt-${key}`} className="text-xs font-normal cursor-pointer">
                {label}
              </Label>
              <Switch
                id={`api-opt-${key}`}
                checked={(state[key] ?? 'true') !== 'false'}
                onCheckedChange={(c) => {
                  if (key === 'autoInvoiceNumber') {
                    onPatch({
                      autoInvoiceNumber: String(c),
                      ...(c ? { invoiceNumber: '' } : {}),
                    })
                    return
                  }
                  onPatch({ [key]: String(c) })
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
