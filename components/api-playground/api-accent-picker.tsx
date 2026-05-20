'use client'

import { useRef } from 'react'
import { useLanguage } from '@/hooks/use-language'
import {
  INVOICE_ACCENT_PRESETS,
  type InvoiceAccentPreset,
} from '@/lib/invoice-accent-color'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const PRESETS: Exclude<InvoiceAccentPreset, 'custom'>[] = [
  'black',
  'blue',
  'green',
  'orange',
  'gray',
]

interface ApiAccentPickerProps {
  value: string
  onChange: (color: string) => void
}

function isPresetColor(v: string): v is Exclude<InvoiceAccentPreset, 'custom'> {
  return (PRESETS as string[]).includes(v)
}

export function ApiAccentPicker({ value, onChange }: ApiAccentPickerProps) {
  const { t } = useLanguage()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const raw = value?.trim() || 'default'
  const isCustom = raw.startsWith('#')
  const activePreset = isCustom ? 'custom' : raw === 'default' ? 'black' : isPresetColor(raw) ? raw : 'black'
  const customHex = isCustom ? raw : INVOICE_ACCENT_PRESETS.blue

  const presetLabels: Record<Exclude<InvoiceAccentPreset, 'custom'>, string> = {
    black: t('invoice.accentBlack'),
    blue: t('invoice.accentBlue'),
    green: t('invoice.accentGreen'),
    orange: t('invoice.accentOrange'),
    gray: t('invoice.accentGray'),
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        title={t('api.form.colorDefault')}
        aria-label={t('api.form.colorDefault')}
        aria-pressed={raw === 'default'}
        onClick={() => onChange('default')}
        className={cn(
          'h-7 w-7 rounded-full border-2 border-dashed border-muted-foreground/50 bg-background shadow-sm transition-transform',
          raw === 'default' && 'scale-110 border-primary',
        )}
      />
      {PRESETS.map((key) => (
        <button
          key={key}
          type="button"
          title={presetLabels[key]}
          aria-label={presetLabels[key]}
          aria-pressed={!isCustom && raw === key}
          onClick={() => onChange(key)}
          className={cn(
            'h-7 w-7 rounded-full border-2 border-background shadow-sm transition-transform',
            !isCustom && raw === key && 'scale-110 border-foreground/40',
            key === 'black' && 'bg-[#0f172a]',
          )}
          style={key !== 'black' ? { backgroundColor: INVOICE_ACCENT_PRESETS[key] } : undefined}
        />
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn('h-7 gap-1.5 px-2 text-xs', isCustom && 'border-primary')}
        onClick={() => colorInputRef.current?.click()}
      >
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: isCustom ? raw : customHex }}
        />
        {t('invoice.accentCustom')}
      </Button>
      <Input
        ref={colorInputRef}
        type="color"
        className="sr-only"
        value={isCustom ? raw : customHex}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
      />
    </div>
  )
}
