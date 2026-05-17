'use client'

import { useRef } from 'react'
import { useLanguage } from '@/hooks/use-language'
import { useInvoiceAccentColor } from '@/hooks/use-invoice-accent-color'
import {
  INVOICE_ACCENT_PRESETS,
  type InvoiceAccentPreset,
} from '@/lib/invoice-accent-color'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const PRESET_SWATCHES: Exclude<InvoiceAccentPreset, 'custom'>[] = [
  'black',
  'blue',
  'green',
  'orange',
  'gray',
]

const swatchBase =
  'h-5 w-5 shrink-0 p-0.2 rounded-full border-1 border-dashed border-background shadow-sm outline-none transition-transform focus:outline-none focus-visible:outline-none'

interface InvoiceAccentColorPickerProps {
  className?: string
}

export function InvoiceAccentColorPicker({ className }: InvoiceAccentColorPickerProps) {
  const { t } = useLanguage()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const {
    preset,
    customHex,
    applyToBorders,
    setPreset,
    setCustomHex,
    setApplyToBorders,
  } = useInvoiceAccentColor()

  const presetLabels: Record<Exclude<InvoiceAccentPreset, 'custom'>, string> = {
    black: t('invoice.accentBlack'),
    blue: t('invoice.accentBlue'),
    green: t('invoice.accentGreen'),
    orange: t('invoice.accentOrange'),
    gray: t('invoice.accentGray'),
  }

  return (
    <div
      role="group"
      aria-label={t('invoice.accentColor')}
      className={cn('flex flex-wrap items-center justify-end gap-2', className)}
    >
      <div className="flex items-center gap-1.5">
        {PRESET_SWATCHES.map((key) => (
          <Button
            key={key}
            type="button"
            title={presetLabels[key]}
            aria-label={presetLabels[key]}
            aria-pressed={preset === key}
            onClick={() => setPreset(key)}
            className={cn(
              swatchBase,
              preset === key && 'scale-120 border-foreground/30',
              key === 'black' && 'bg-[#0f172a]',
            )}
            style={
              key !== 'black'
                ? { backgroundColor: INVOICE_ACCENT_PRESETS[key] }
                : undefined
            }
          />
        ))}

        <Button
          type="button"
          title={t('invoice.accentCustom')}
          aria-label={t('invoice.accentCustom')}
          aria-pressed={preset === 'custom'}
          onClick={() => colorInputRef.current?.click()}
          className={cn(
            swatchBase,
            'relative border-dashed border-muted-foreground/50',
            preset === 'custom' && 'scale-110 border-foreground/40',
          )}
        >
          <span
            className="block h-full w-full rounded-full border border-background shadow-sm"
            style={{ backgroundColor: customHex }}
          />
          <Input
            ref={colorInputRef}
            type="color"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            className="sr-only"
            tabIndex={-1}
          />
        </Button>
      </div>

      <div className="flex items-center gap-2 border-s border-border ps-2">
        <Checkbox
          id="invoice-accent-borders"
          checked={applyToBorders}
          onCheckedChange={(checked) => setApplyToBorders(checked === true)}
        />
        <Label
          htmlFor="invoice-accent-borders"
          className="cursor-pointer text-xs font-normal text-muted-foreground"
        >
          {t('invoice.applyAccentToBorders')}
        </Label>
      </div>
    </div>
  )
}
